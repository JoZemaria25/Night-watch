"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { AlertTriangle, CheckCircle2, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";

type Request = {
    id: string;
    issue_type: string;
    description: string;
    status: string;
    created_at: string;
    properties?: {
        address: string;
    };
};

export function MaintenanceList() {
    const [requests, setRequests] = useState<Request[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchRequests();
    }, []);

    async function fetchRequests() {
        const { data } = await supabase
            .from("maintenance_requests")
            .select(`*, properties(address)`)
            .eq("status", "Open")
            .order("created_at", { ascending: false });

        if (data) setRequests(data as any);
        setLoading(false);
    }

    async function markResolved(id: string) {
        const { error } = await supabase
            .from("maintenance_requests")
            .update({ status: "Resolved" })
            .eq("id", id);

        if (!error) {
            setRequests(prev => prev.filter(r => r.id !== id));
        }
    }

    if (loading) return <div className="text-zinc-500 text-xs animate-pulse">Loading Inbox...</div>;
    if (requests.length === 0) return null; // Hide if empty

    return (
        <div className="space-y-4 mb-8">
            <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider">
                    Inbox ({requests.length})
                </h3>
            </div>

            <div className="space-y-3">
                {requests.map((req) => (
                    <div key={req.id} className="bg-zinc-900/50 border border-zinc-800 p-4 rounded-xl flex gap-3 group hover:border-amber-900/50 transition-colors">
                        <div className="mt-1">
                            <div className="h-8 w-8 rounded-full bg-amber-500/10 flex items-center justify-center border border-amber-500/20 text-amber-500">
                                <AlertTriangle className="h-4 w-4" />
                            </div>
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="flex justify-between items-start">
                                <h4 className="text-sm font-medium text-white truncate">
                                    {req.issue_type}
                                </h4>
                                <span className="text-[10px] text-zinc-500">
                                    {new Date(req.created_at).toLocaleDateString()}
                                </span>
                            </div>
                            <p className="text-xs text-zinc-400 mt-1 line-clamp-2">
                                {req.description}
                            </p>
                            <div className="mt-3 flex items-center justify-between">
                                <span className="text-[10px] font-mono text-zinc-500 bg-zinc-950 px-2 py-1 rounded border border-zinc-800">
                                    {req.properties?.address || "Unknown Unit"}
                                </span>
                                <Button
                                    size="sm"
                                    variant="ghost"
                                    className="h-6 text-[10px] text-zinc-500 hover:text-emerald-400 hover:bg-emerald-950/30"
                                    onClick={() => markResolved(req.id)}
                                >
                                    <CheckCircle2 className="mr-1 h-3 w-3" /> Mark Done
                                </Button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
