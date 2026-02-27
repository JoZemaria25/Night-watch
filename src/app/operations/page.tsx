"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createBrowserClient } from "@supabase/ssr";
import { format } from "date-fns";
import {
    ShieldCheck,
    Wrench,
    AlertCircle,
    CheckCircle2,
    Construction,
    Clock,
    CalendarDays,
    Search,
    Briefcase
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import VendorMatchmaker from "@/components/VendorMatchmaker";

// --- Types ---

type MaintenanceTicket = {
    id: string;
    created_at: string;
    title: string;
    description: string;
    status: string;
    priority: string;
    issue_type: string;
    unit_id: string | null;
    properties: {
        address?: string;
        name?: string;
        title?: string;
        [key: string]: any;
    } | null;
};

type TabType = 'compliance' | 'maintenance';

export default function MaintenancePage() {
    const router = useRouter();
    const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    // --- State ---
    const [activeTab, setActiveTab] = useState<TabType>('compliance');
    const [tickets, setTickets] = useState<MaintenanceTicket[]>([]);
    const [loading, setLoading] = useState(true);
    const [processingId, setProcessingId] = useState<string | null>(null);

    // Renewal Modal State
    const [renewalOpen, setRenewalOpen] = useState(false);
    const [selectedTicket, setSelectedTicket] = useState<MaintenanceTicket | null>(null);
    const [renewalDate, setRenewalDate] = useState("");
    const [renewalTenantName, setRenewalTenantName] = useState("");

    // --- Data Fetching ---

    const fetchTickets = async () => {
        setLoading(true);
        console.log(">>> Fetching Tickets...");
        try {
            const { data, error } = await supabase
                .from('maintenance_requests')
                .select(`
          *,
          properties (*)
        `)
                // Force Wildcard Select to fix 400 Bad Request
                .neq('status', 'Resolved')
                .neq('status', 'closed')
                .order('priority', { ascending: false })
                .order('created_at', { ascending: false });

            if (error) {
                console.error("Fetch Error:", error.message, error.details);
            } else {
                console.log("Fetched Tickets:", data);
                setTickets(data || []);
            }
        } catch (err) {
            console.error("Failed to fetch tickets:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTickets();
    }, []);

    // --- Logic: Smart Renewal ---

    const initiateRenewal = (ticket: MaintenanceTicket) => {
        // 1. Extract Tenant Name from Title (Format: "Lease Expiry: [Name]")
        const extractedName = ticket.title.replace('Lease Expiry:', '').replace('Lease Expiring:', '').trim();
        const tenantName = extractedName || "Unknown Tenant";

        console.log("🔍 Attempting renewal for extracted name:", tenantName);

        setRenewalTenantName(tenantName);
        setSelectedTicket(ticket);
        setRenewalOpen(true);
    };

    const handleConfirmRenewal = async () => {
        if (!selectedTicket || !renewalDate || !renewalTenantName) return;
        setProcessingId(selectedTicket.id);

        try {
            // Step A: Find the Tenant
            console.log(`🔍 Searching tenants table for: ${renewalTenantName}`);
            const { data: tenantData, error: tenantErr } = await supabase
                .from('tenants')
                .select('id')
                .ilike('full_name', `%${renewalTenantName}%`)
                .single();

            // Note: .single() returns error if 0 or >1 rows found, handling both cases.
            if (tenantErr || !tenantData) {
                console.error("❌ Tenant Lookup Failed:", tenantErr);
                alert(`Failed to find a unique tenant named "${renewalTenantName}". Check spelling or duplicates.`);
                setProcessingId(null);
                return;
            }

            console.log("✅ Tenant Found. ID:", tenantData.id);

            // Step B: Update Lease Date
            const { error: updateErr } = await supabase
                .from('tenants')
                .update({ lease_end: renewalDate })
                .eq('id', tenantData.id);

            if (updateErr) {
                console.error("❌ Lease Update Failed:", updateErr);
                alert("Failed to update the lease date in the database.");
                setProcessingId(null);
                return;
            }

            // Step C: Resolve Ticket
            const { error: ticketErr } = await supabase
                .from('maintenance_requests')
                .update({
                    status: 'Resolved',
                    description: selectedTicket.description + `\n\n[System] Renewed by user on ${new Date().toLocaleDateString()} to ${renewalDate}.`
                })
                .eq('id', selectedTicket.id);

            if (ticketErr) console.error("❌ Ticket Resolve Failed:", ticketErr);

            console.log("✅ Renewal Protocol Complete.");
            alert("Lease successfully renewed!");
            setRenewalOpen(false);
            setRenewalDate("");
            fetchTickets(); // Refresh list

        } catch (err) {
            console.error("❌ Critical System Error during renewal:", err);
            alert("A critical error occurred. Check the console.");
        } finally {
            setProcessingId(null);
        }
    };

    // --- Logic: Standard Maintenance ---

    const handleMarkDone = async (id: string) => {
        if (!confirm("Mark this request as resolved?")) return;
        setProcessingId(id);

        try {
            const { error } = await supabase
                .from('maintenance_requests')
                .update({ status: 'Resolved' })
                .eq('id', id);

            if (error) throw error;

            // UI Optimistic Update could go here, but fetching is safer for sync
            fetchTickets();
        } catch (err: any) {
            alert("Error: " + err.message);
        } finally {
            setProcessingId(null);
        }
    };

    // --- Filtering & Rendering ---

    const filteredTickets = tickets.filter(t => {
        // Logic to distinguish Compliance vs Maintenance
        // Compliance: title includes "Lease Expiring" OR issue_type == 'Compliance'
        // Maintenance: Everything else
        const isCompliance = t.title.toLowerCase().includes('lease expiring') || t.issue_type === 'Compliance';

        if (activeTab === 'compliance') return isCompliance;
        return !isCompliance;
    });

    return (
        <main className="min-h-screen bg-[#0B0F19] text-gray-100 p-6 md:p-12 font-sans">
            <div className="max-w-5xl mx-auto space-y-8">

                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight text-white">
                            Operations Hub
                        </h1>
                        <p className="text-gray-400 mt-2">
                            Manage portfolio compliance and tenant maintenance requests.
                        </p>
                    </div>
                    <Button onClick={fetchTickets} variant="outline" size="sm" className="gap-2 border-gray-700 bg-gray-800 text-gray-300 hover:bg-gray-700 hover:text-white">
                        Refresh
                    </Button>
                </div>

                {/* Custom Tabs */}
                <div className="bg-gray-900/50 p-1 rounded-lg border border-gray-800/50 inline-flex backdrop-blur-sm">
                    <button
                        onClick={() => setActiveTab('compliance')}
                        className={cn(
                            "flex items-center gap-2 px-6 py-2.5 rounded-md text-sm font-medium transition-all duration-200 border",
                            activeTab === 'compliance'
                                ? "bg-indigo-500/10 text-indigo-400 border-indigo-500/20 shadow-[0_0_15px_rgba(99,102,241,0.1)]"
                                : "text-gray-400 border-transparent hover:bg-gray-800 hover:text-gray-200"
                        )}
                    >
                        <ShieldCheck className="h-4 w-4" />
                        Compliance
                        <Badge variant="secondary" className="ml-2 bg-indigo-500/20 text-indigo-300 hover:bg-indigo-500/30">
                            {tickets.filter(t => t.title.toLowerCase().includes('lease expiring') || t.issue_type === 'Compliance').length}
                        </Badge>
                    </button>

                    <button
                        onClick={() => setActiveTab('maintenance')}
                        className={cn(
                            "flex items-center gap-2 px-6 py-2.5 rounded-md text-sm font-medium transition-all duration-200 border",
                            activeTab === 'maintenance'
                                ? "bg-gray-800 text-gray-100 border-gray-700 shadow-sm"
                                : "text-gray-400 border-transparent hover:bg-gray-800 hover:text-gray-200"
                        )}
                    >
                        <Wrench className="h-4 w-4" />
                        Maintenance
                        <Badge variant="secondary" className="ml-2 bg-gray-700 text-gray-300 hover:bg-gray-600">
                            {tickets.filter(t => !(t.title.toLowerCase().includes('lease expiring') || t.issue_type === 'Compliance')).length}
                        </Badge>
                    </button>

                    <button
                        onClick={() => router.push('/operations/vendors')}
                        className={cn(
                            "flex items-center gap-2 px-6 py-2.5 rounded-md text-sm font-medium transition-all duration-200 border",
                            "text-gray-400 border-transparent hover:bg-gray-800 hover:text-gray-200"
                        )}
                    >
                        <Briefcase className="h-4 w-4" />
                        Vendors
                    </button>
                </div>

                {/* Content Area */}
                <div className="space-y-4">
                    {loading ? (
                        <div className="text-center py-20 text-gray-500 animate-pulse">
                            Loading Operations Data...
                        </div>
                    ) : filteredTickets.length === 0 ? (
                        <div className="text-center py-20 border-2 border-dashed border-gray-800 rounded-xl bg-gray-900/30">
                            <CheckCircle2 className="h-10 w-10 text-gray-700 mx-auto mb-4" />
                            <h3 className="text-lg font-medium text-gray-200">All clear</h3>
                            <p className="text-gray-500">No pending items in this category.</p>
                        </div>
                    ) : (
                        filteredTickets.map((ticket) => {
                            const isUrgent = ticket.priority?.toLowerCase() === 'urgent' || ticket.priority?.toLowerCase() === 'high';

                            return (
                                <div
                                    key={ticket.id}
                                    className={cn(
                                        "group relative overflow-hidden rounded-xl border p-5 transition-all duration-300",
                                        "bg-gray-900/40 backdrop-blur-sm",
                                        "hover:bg-gray-800/40 hover:border-gray-700 hover:shadow-lg",
                                        isUrgent
                                            ? "border-red-900/30 bg-red-900/10 hover:bg-red-900/20"
                                            : "border-gray-800/60"
                                    )}
                                >
                                    <div className="flex flex-col md:flex-row gap-6 justify-between items-start md:items-center">

                                        {/* Left: Icon & Info */}
                                        <div className="flex items-start gap-4">
                                            <div className={cn(
                                                "p-3 rounded-lg mt-1 border",
                                                activeTab === 'compliance'
                                                    ? "bg-indigo-500/10 text-indigo-400 border-indigo-500/20"
                                                    : "bg-gray-800 text-gray-400 border-gray-700"
                                            )}>
                                                {activeTab === 'compliance' ? <ShieldCheck className="h-6 w-6" /> : <Wrench className="h-6 w-6" />}
                                            </div>

                                            <div className="space-y-1">
                                                <div className="flex items-center gap-3">
                                                    <h3 className="text-lg font-semibold text-gray-100 group-hover:text-white transition-colors">
                                                        {ticket.title}
                                                    </h3>
                                                    {isUrgent && (
                                                        <Badge variant="destructive" className="animate-pulse shadow-sm bg-red-500/20 text-red-200 border-red-500/30 border">
                                                            URGENT
                                                        </Badge>
                                                    )}
                                                    <Badge variant="outline" className="text-xs text-gray-500 font-mono border-gray-700">
                                                        {format(new Date(ticket.created_at), 'MMM dd')}
                                                    </Badge>
                                                </div>

                                                <div className="flex items-center gap-2 text-sm text-gray-500">
                                                    <span className="font-medium text-gray-300">
                                                        {ticket.properties?.title || ticket.properties?.name || ticket.properties?.address || "Unknown Property"}
                                                    </span>
                                                    <span>•</span>
                                                    <span className="truncate max-w-md text-gray-400">
                                                        {ticket.description.split('\n')[0]}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Right: Actions */}
                                        <div className="w-full md:w-auto flex items-center justify-end gap-3 mt-4 md:mt-0">
                                            {activeTab === 'compliance' ? (
                                                <Button
                                                    onClick={() => initiateRenewal(ticket)}
                                                    disabled={!!processingId}
                                                    className="bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-900/20 w-full md:w-auto border border-indigo-500/50"
                                                >
                                                    {processingId === ticket.id ? "Processing..." : "Renew Lease"}
                                                </Button>
                                            ) : (
                                                <Button
                                                    onClick={() => handleMarkDone(ticket.id)}
                                                    disabled={!!processingId}
                                                    variant="outline"
                                                    className="border-gray-700 text-gray-300 hover:bg-gray-800 hover:text-white dark:border-gray-700 dark:hover:bg-gray-800 w-full md:w-auto"
                                                >
                                                    {processingId === ticket.id ? "Saving..." : "Mark Done"}
                                                </Button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>

                {/* Vendor Matchmaker Demo Section */}
                <div className="mt-12 pt-8 border-t border-gray-800/60">
                    <div className="mb-4">
                        <h2 className="text-xl font-semibold text-gray-200">Vendor Assignment (Demo)</h2>
                        <p className="text-sm text-gray-500">Live preview of the new intelligent vendor matchmaking system.</p>
                    </div>
                    <div className="bg-transparent rounded-3xl overflow-hidden">
                        <VendorMatchmaker />
                    </div>
                </div>

                {/* Smart Renewal Dialog */}
                <Dialog open={renewalOpen} onOpenChange={setRenewalOpen}>
                    <DialogContent className="sm:max-w-[425px] bg-[#0B0F19] border-gray-800 text-gray-100">
                        <DialogHeader>
                            <DialogTitle className="text-white">Smart Renewal Protocol</DialogTitle>
                            <DialogDescription className="text-gray-400">
                                Extend the lease for <strong className="text-indigo-400">{renewalTenantName || "Unknown Tenant"}</strong> and resolve the compliance alert.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                            <div className="grid gap-2">
                                <Label htmlFor="date" className="text-gray-300">New Lease End Date</Label>
                                <Input
                                    id="date"
                                    type="date"
                                    value={renewalDate}
                                    onChange={(e) => setRenewalDate(e.target.value)}
                                    className="col-span-3 bg-gray-900 border-gray-800 text-white focus:ring-indigo-500 focus:border-indigo-500"
                                />
                            </div>
                        </div>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setRenewalOpen(false)} className="border-gray-700 text-gray-300 hover:bg-gray-800 hover:text-white">Cancel</Button>
                            <Button onClick={handleConfirmRenewal} disabled={!renewalDate || !!processingId} className="bg-indigo-600 hover:bg-indigo-500 text-white">
                                {processingId ? "Updating Database..." : "Confirm Renewal"}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

            </div>
        </main>
    );
}
