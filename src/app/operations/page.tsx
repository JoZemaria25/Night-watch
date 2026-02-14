"use client";

import { useEffect, useState } from "react";
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
    Search
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
        <main className="min-h-screen bg-zinc-50 dark:bg-zinc-950 p-6 md:p-12">
            <div className="max-w-5xl mx-auto space-y-8">

                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
                            Operations Hub
                        </h1>
                        <p className="text-zinc-500 dark:text-zinc-400 mt-2">
                            Manage portfolio compliance and tenant maintenance requests.
                        </p>
                    </div>
                    <Button onClick={fetchTickets} variant="outline" size="sm" className="gap-2">
                        Refresh
                    </Button>
                </div>

                {/* Custom Tabs */}
                <div className="bg-white dark:bg-zinc-900 p-1 rounded-lg border border-zinc-200 dark:border-zinc-800 inline-flex">
                    <button
                        onClick={() => setActiveTab('compliance')}
                        className={cn(
                            "flex items-center gap-2 px-6 py-2.5 rounded-md text-sm font-medium transition-all duration-200",
                            activeTab === 'compliance'
                                ? "bg-indigo-50 text-indigo-700 shadow-sm border border-indigo-100 dark:bg-indigo-950/30 dark:text-indigo-400 dark:border-indigo-900/50"
                                : "text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-200"
                        )}
                    >
                        <ShieldCheck className="h-4 w-4" />
                        Compliance
                        <Badge variant="secondary" className="ml-2 bg-indigo-100 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-300">
                            {tickets.filter(t => t.title.toLowerCase().includes('lease expiring') || t.issue_type === 'Compliance').length}
                        </Badge>
                    </button>

                    <button
                        onClick={() => setActiveTab('maintenance')}
                        className={cn(
                            "flex items-center gap-2 px-6 py-2.5 rounded-md text-sm font-medium transition-all duration-200",
                            activeTab === 'maintenance'
                                ? "bg-zinc-100 text-zinc-900 shadow-sm border border-zinc-200 dark:bg-zinc-800 dark:text-zinc-100 dark:border-zinc-700"
                                : "text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-200"
                        )}
                    >
                        <Wrench className="h-4 w-4" />
                        Maintenance
                        <Badge variant="secondary" className="ml-2 bg-zinc-200 text-zinc-700 dark:bg-zinc-700 dark:text-zinc-300">
                            {tickets.filter(t => !(t.title.toLowerCase().includes('lease expiring') || t.issue_type === 'Compliance')).length}
                        </Badge>
                    </button>
                </div>

                {/* Content Area */}
                <div className="space-y-4">
                    {loading ? (
                        <div className="text-center py-20 text-zinc-400 animate-pulse">
                            Loading Operations Data...
                        </div>
                    ) : filteredTickets.length === 0 ? (
                        <div className="text-center py-20 border-2 border-dashed border-zinc-200 dark:border-zinc-800 rounded-xl">
                            <CheckCircle2 className="h-10 w-10 text-zinc-300 mx-auto mb-4" />
                            <h3 className="text-lg font-medium text-zinc-900 dark:text-zinc-100">All clear</h3>
                            <p className="text-zinc-500">No pending items in this category.</p>
                        </div>
                    ) : (
                        filteredTickets.map((ticket) => {
                            const isUrgent = ticket.priority?.toLowerCase() === 'urgent' || ticket.priority?.toLowerCase() === 'high';

                            return (
                                <div
                                    key={ticket.id}
                                    className={cn(
                                        "group relative overflow-hidden rounded-xl border p-5 transition-all hover:shadow-md",
                                        "bg-white dark:bg-zinc-900",
                                        isUrgent
                                            ? "border-red-200 bg-red-50/30 dark:border-red-900/50 dark:bg-red-950/10"
                                            : "border-zinc-200 dark:border-zinc-800"
                                    )}
                                >
                                    <div className="flex flex-col md:flex-row gap-6 justify-between items-start md:items-center">

                                        {/* Left: Icon & Info */}
                                        <div className="flex items-start gap-4">
                                            <div className={cn(
                                                "p-3 rounded-lg mt-1",
                                                activeTab === 'compliance'
                                                    ? "bg-indigo-100 text-indigo-600 dark:bg-indigo-950 dark:text-indigo-400"
                                                    : "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400"
                                            )}>
                                                {activeTab === 'compliance' ? <ShieldCheck className="h-6 w-6" /> : <Wrench className="h-6 w-6" />}
                                            </div>

                                            <div className="space-y-1">
                                                <div className="flex items-center gap-3">
                                                    <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
                                                        {ticket.title}
                                                    </h3>
                                                    {isUrgent && (
                                                        <Badge variant="destructive" className="animate-pulse shadow-sm">
                                                            URGENT
                                                        </Badge>
                                                    )}
                                                    <Badge variant="outline" className="text-xs text-zinc-500 font-mono">
                                                        {format(new Date(ticket.created_at), 'MMM dd')}
                                                    </Badge>
                                                </div>

                                                <div className="flex items-center gap-2 text-sm text-zinc-500 dark:text-zinc-400">
                                                    <span className="font-medium text-zinc-700 dark:text-zinc-300">
                                                        {ticket.properties?.title || ticket.properties?.name || ticket.properties?.address || "Unknown Property"}
                                                    </span>
                                                    <span>•</span>
                                                    <span className="truncate max-w-md">
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
                                                    className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm w-full md:w-auto"
                                                >
                                                    {processingId === ticket.id ? "Processing..." : "Renew Lease"}
                                                </Button>
                                            ) : (
                                                <Button
                                                    onClick={() => handleMarkDone(ticket.id)}
                                                    disabled={!!processingId}
                                                    variant="outline"
                                                    className="border-zinc-300 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 w-full md:w-auto"
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

                {/* Smart Renewal Dialog */}
                <Dialog open={renewalOpen} onOpenChange={setRenewalOpen}>
                    <DialogContent className="sm:max-w-[425px]">
                        <DialogHeader>
                            <DialogTitle>Smart Renewal Protocol</DialogTitle>
                            <DialogDescription>
                                Extend the lease for <strong>{renewalTenantName || "Unknown Tenant"}</strong> and resolve the compliance alert.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                            <div className="grid gap-2">
                                <Label htmlFor="date">New Lease End Date</Label>
                                <Input
                                    id="date"
                                    type="date"
                                    value={renewalDate}
                                    onChange={(e) => setRenewalDate(e.target.value)}
                                    className="col-span-3"
                                />
                            </div>
                        </div>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setRenewalOpen(false)}>Cancel</Button>
                            <Button onClick={handleConfirmRenewal} disabled={!renewalDate || !!processingId}>
                                {processingId ? "Updating Database..." : "Confirm Renewal"}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

            </div>
        </main>
    );
}
