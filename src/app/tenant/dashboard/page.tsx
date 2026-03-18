"use client";

import {
    Plus,
    CalendarClock,
    Wrench,
    Clock,
    CheckCircle2,
    HardHat
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

// --- Mock Data ---
const tenantInfo = {
    name: "Victor Land",
    unit: "Apt 4B",
    nextRentDue: {
        amount: "$2,450.00",
        date: "Oct 1, 2026"
    },
    leaseExpiry: "Aug 31, 2027"
};

type TicketStatus = 'Open' | 'In Progress' | 'Resolved';

interface MaintenanceTicket {
    id: string;
    title: string;
    dateSubmitted: string;
    status: TicketStatus;
    assignedVendor?: string;
    description: string;
}

const maintenanceHistory: MaintenanceTicket[] = [
    {
        id: "TKT-089",
        title: "Leaking Kitchen Faucet",
        dateSubmitted: "Sep 15, 2026",
        status: "In Progress",
        assignedVendor: "Apex Plumbing Solutions",
        description: "Constant dripping under the kitchen sink, even when turned off tightly."
    },
    {
        id: "TKT-092",
        title: "HVAC Filter Replacement",
        dateSubmitted: "Sep 16, 2026",
        status: "Open",
        description: "The air filter needs replacement as per the bi-annual schedule."
    },
    {
        id: "TKT-045",
        title: "Broken Blinds in Bedroom",
        dateSubmitted: "Jul 02, 2026",
        status: "Resolved",
        assignedVendor: "City Maintenance Group",
        description: "The pull cord snapped on the master bedroom window blinds."
    }
];

export default function TenantDashboardPage() {
    
    // Helper to get status pill styling based on the design spec
    const getStatusStyle = (status: TicketStatus) => {
        switch (status) {
            case 'Open':
                return "bg-amber-900/30 text-amber-400 border-amber-800/50 shadow-[0_0_10px_rgba(251,191,36,0.1)]";
            case 'In Progress':
                return "bg-blue-900/30 text-blue-400 border-blue-800/50 shadow-[0_0_10px_rgba(59,130,246,0.1)]";
            case 'Resolved':
                return "bg-emerald-900/30 text-emerald-400 border-emerald-800/50 shadow-[0_0_10px_rgba(52,211,153,0.1)]";
        }
    };

    const getStatusIcon = (status: TicketStatus) => {
        switch (status) {
            case 'Open':
                return <AlertCircle className="h-3.5 w-3.5" />; // Need to import AlertCircle if used, or use Clock below
            case 'In Progress':
                return <HardHat className="h-3.5 w-3.5" />;
            case 'Resolved':
                return <CheckCircle2 className="h-3.5 w-3.5" />;
        }
    };

    // Since AlertCircle isn't imported, let's just use Clock for Open
    const getStatusIconSafe = (status: TicketStatus) => {
        switch (status) {
            case 'Open':
                return <Clock className="h-3.5 w-3.5" />;
            case 'In Progress':
                return <HardHat className="h-3.5 w-3.5" />;
            case 'Resolved':
                return <CheckCircle2 className="h-3.5 w-3.5" />;
        }
    };


    return (
        <main className="min-h-screen bg-[#0f172a] text-slate-200 p-6 md:p-12 font-sans selection:bg-indigo-500/30">
            <div className="max-w-4xl mx-auto space-y-8">
                
                {/* Greeting Card section */}
                <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-xl shadow-black/30 p-6 md:p-8 relative overflow-hidden">
                    {/* Decorative background glow */}
                    <div className="absolute -top-24 -right-24 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>

                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative z-10">
                        <div className="space-y-4 flex-1">
                            <div>
                                <h1 className="text-3xl font-bold text-white tracking-tight">
                                    Welcome back, {tenantInfo.name.split(' ')[0]}
                                </h1>
                                <p className="text-slate-400 text-lg mt-1 flex items-center gap-2 font-medium">
                                    <span className="text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20 text-sm">
                                        {tenantInfo.unit}
                                    </span>
                                </p>
                            </div>

                            <div className="flex items-center gap-6 pt-2">
                                <div className="space-y-1">
                                    <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Next Rent Due</p>
                                    <p className="text-2xl font-bold text-white flex items-baseline gap-2">
                                        {tenantInfo.nextRentDue.amount}
                                        <span className="text-sm font-medium text-slate-400">on {tenantInfo.nextRentDue.date}</span>
                                    </p>
                                </div>
                                
                                <div className="h-10 w-px bg-slate-800 hidden sm:block"></div>

                                <div className="space-y-1 hidden sm:block">
                                    <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Lease Expiry</p>
                                    <p className="text-lg font-medium text-slate-300">
                                        {tenantInfo.leaseExpiry}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="w-full md:w-auto">
                            <Button 
                                onClick={() => alert("Launch Report Issue Modal")}
                                className="w-full md:w-auto bg-indigo-600 hover:bg-indigo-500 text-white shadow-[0_0_20px_rgba(99,102,241,0.25)] hover:shadow-[0_0_25px_rgba(99,102,241,0.4)] transition-all duration-300 border border-indigo-400/30 gap-2 h-12 px-6 rounded-xl font-medium text-base"
                            >
                                <Plus className="h-5 w-5" />
                                Report an Issue
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Active Requests Tracker */}
                <div className="space-y-6">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 rounded-xl bg-slate-800 border border-slate-700 text-slate-300">
                            <Wrench className="h-5 w-5" />
                        </div>
                        <h2 className="text-2xl font-bold text-white tracking-tight">Active Requests Tracker</h2>
                    </div>

                    <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-xl shadow-black/30 p-6">
                        <div className="space-y-0 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-800 before:to-transparent">
                            
                            {maintenanceHistory.map((ticket, index) => (
                                <div key={ticket.id} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active py-4">
                                    
                                    {/* Timeline dot */}
                                    <div className="flex items-center justify-center w-10 h-10 rounded-full border border-slate-700 bg-slate-900 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10 transition-colors group-hover:border-indigo-500/50 group-hover:text-indigo-400">
                                        {getStatusIconSafe(ticket.status)}
                                    </div>

                                    {/* Content Card */}
                                    <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-5 rounded-xl bg-slate-800/40 border border-slate-800/80 backdrop-blur-sm transition-all duration-300 hover:bg-slate-800/60 hover:border-slate-700/80 hover:shadow-lg">
                                        <div className="flex flex-col md:flex-row md:items-start justify-between gap-3 mb-2">
                                            <h3 className="font-bold text-slate-200 text-lg leading-tight group-hover:text-white transition-colors">
                                                {ticket.title}
                                            </h3>
                                            <Badge variant="outline" className={cn("inline-flex w-fit gap-1.5 py-1 px-3 text-xs font-semibold uppercase tracking-wider border", getStatusStyle(ticket.status))}>
                                                {ticket.status}
                                            </Badge>
                                        </div>
                                        
                                        <div className="flex items-center gap-2 text-xs font-mono text-slate-500 mb-3">
                                            <CalendarClock className="h-3.5 w-3.5" />
                                            <span>Submitted: {ticket.dateSubmitted}</span>
                                            <span>•</span>
                                            <span className="text-slate-400">{ticket.id}</span>
                                        </div>

                                        <p className="text-sm text-slate-400 leading-relaxed mb-4 line-clamp-2">
                                            {ticket.description}
                                        </p>

                                        {ticket.assignedVendor && (
                                            <div className="pt-3 border-t border-slate-800/60 flex items-center gap-2">
                                                <div className="flex items-center gap-1.5 text-xs font-medium text-slate-500">
                                                    Assigned to: <span className="text-indigo-300 bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20">{ticket.assignedVendor}</span>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                    
                                </div>
                            ))}
                            
                        </div>
                    </div>
                </div>

            </div>
        </main>
    );
}
