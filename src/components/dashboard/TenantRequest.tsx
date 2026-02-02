"use client";

import { useEffect, useState } from "react";
import { createBrowserClient } from "@supabase/ssr";
import { formatDistanceToNow } from "date-fns";
import {
    CheckCircle2,
    Clock,
    AlertTriangle,
    SearchX,
    Loader2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

// ------------------------------------------------------------------
// TYPES
// ------------------------------------------------------------------
type Request = {
    id: string;
    created_at: string;
    issue_type: string;  // e.g. "Repair", "Inspection"
    description: string;
    status: string;      // "Open", "Pending", "Resolved"
    priority?: string;   // "High", "Medium", "Low" (Optional)
    properties?: {
        address: string;
    } | null;
};

export function TenantRequest() {
    // ------------------------------------------------------------------
    // STATE & SUPABASE
    // ------------------------------------------------------------------
    const [requests, setRequests] = useState<Request[]>([]);
    const [loading, setLoading] = useState(true);

    const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    // ------------------------------------------------------------------
    // FETCH DATA
    // ------------------------------------------------------------------
    useEffect(() => {
        const fetchRequests = async () => {
            try {
                const { data, error } = await supabase
                    .from("maintenance_requests")
                    .select(`
            *,
            properties (
              address
            )
          `)
                    .neq("status", "Resolved")
                    .order("created_at", { ascending: false });

                if (error) throw error;
                setRequests((data as Request[]) || []);
            } catch (err) {
                console.error("Error fetching requests:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchRequests();

        // Optional: Real-time subscription could go here
        // But for now, just fetch on mount.
    }, [supabase]);

    // ------------------------------------------------------------------
    // ACTIONS
    // ------------------------------------------------------------------
    const handleResolve = async (id: string) => {
        // 1. Optimistic Update
        setRequests((prev) => prev.filter((req) => req.id !== id));

        // 2. DB Update
        const { error } = await supabase
            .from("maintenance_requests")
            .update({ status: "Resolved" })
            .eq("id", id);

        if (error) {
            console.error("Failed to resolve request:", error);
            // Revert if needed, or just show toast
            alert("Failed to mark properly. Please refresh.");
        }
    };

    // ------------------------------------------------------------------
    // RENDER HELPERS
    // ------------------------------------------------------------------
    const getPriorityColor = (priority?: string) => {
        switch (priority?.toLowerCase()) {
            case "high":
            case "critical":
                return "bg-red-500/10 text-red-500 border-red-500/20";
            case "medium":
                return "bg-amber-500/10 text-amber-500 border-amber-500/20";
            default:
                return "bg-zinc-500/10 text-zinc-400 border-zinc-500/20";
        }
    };

    if (loading) {
        return (
            <div className="h-[300px] flex flex-col items-center justify-center text-zinc-500 space-y-3 animate-in fade-in">
                <Loader2 className="h-6 w-6 animate-spin text-purple-500" />
                <p className="text-xs tracking-widest uppercase">Syncing Requests...</p>
            </div>
        );
    }

    if (requests.length === 0) {
        return (
            <div className="h-[300px] flex flex-col items-center justify-center text-zinc-500 space-y-4 border border-dashed border-zinc-800 rounded-lg bg-zinc-900/20">
                <div className="h-12 w-12 rounded-full bg-zinc-900 flex items-center justify-center">
                    <SearchX className="h-6 w-6 text-zinc-600" />
                </div>
                <div className="text-center">
                    <p className="text-sm font-medium text-zinc-300">No active issues</p>
                    <p className="text-xs text-zinc-500 mt-1">Tenant requests will appear here</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-3 max-h-[400px] overflow-y-auto pr-1 custom-scrollbar">
            {requests.map((req) => (
                <div
                    key={req.id}
                    className="group relative flex gap-4 p-4 rounded-xl border border-zinc-800 bg-zinc-900/40 hover:bg-zinc-900 hover:border-zinc-700 transition-all duration-200"
                >
                    {/* Icon Column */}
                    <div className="pt-1">
                        <div className={cn(
                            "h-10 w-10 rounded-full flex items-center justify-center border",
                            req.issue_type === "Repair"
                                ? "bg-amber-500/10 border-amber-500/20 text-amber-500"
                                : "bg-blue-500/10 border-blue-500/20 text-blue-500"
                        )}>
                            {req.issue_type === "Repair" ? (
                                <AlertTriangle className="h-5 w-5" />
                            ) : (
                                <Clock className="h-5 w-5" />
                            )}
                        </div>
                    </div>

                    {/* Content Column */}
                    <div className="flex-1 min-w-0 space-y-1">
                        <div className="flex items-center justify-between">
                            <h4 className="text-sm font-semibold text-zinc-200 truncate pr-2">
                                {req.issue_type}
                            </h4>
                            <span className="text-[10px] text-zinc-500 whitespace-nowrap">
                                {formatDistanceToNow(new Date(req.created_at), { addSuffix: true })}
                            </span>
                        </div>

                        <p className="text-xs text-zinc-400 line-clamp-2 leading-relaxed">
                            {req.description}
                        </p>

                        <div className="flex items-center gap-2 mt-3">
                            {/* Priority Badge */}
                            {req.priority && (
                                <span className={cn(
                                    "text-[10px] px-2 py-0.5 rounded-full border font-medium uppercase tracking-wider",
                                    getPriorityColor(req.priority)
                                )}>
                                    {req.priority}
                                </span>
                            )}

                            {/* Unit Badge */}
                            <span className="text-[10px] px-2 py-0.5 rounded-full border border-zinc-800 bg-zinc-950 text-zinc-400 font-mono">
                                {req.properties?.address || "General"}
                            </span>
                        </div>
                    </div>

                    {/* Action Button (Absolute or Flex) */}
                    <div className="flex items-center self-center pl-2">
                        <Button
                            size="icon"
                            variant="ghost"
                            className="h-8 w-8 text-zinc-500 hover:text-emerald-400 hover:bg-emerald-950/30 rounded-full transition-colors"
                            onClick={() => handleResolve(req.id)}
                            title="Mark as Resolved"
                        >
                            <CheckCircle2 className="h-5 w-5" />
                        </Button>
                    </div>
                </div>
            ))}
        </div>
    );
}
