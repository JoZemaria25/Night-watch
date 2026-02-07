"use client";

import { createBrowserClient } from "@supabase/ssr";
import { useEffect, useState } from "react";
import { formatDistanceToNow } from "date-fns";

export function SystemStatus() {
    const [engineStatus, setEngineStatus] = useState("Checking...");
    const [dbStatus, setDbStatus] = useState("Connecting...");
    const [lastRun, setLastRun] = useState<string | null>(null);

    const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    useEffect(() => {
        async function checkStatus() {
            try {
                // 1. Check DB Connection (Latency Check)
                const start = performance.now();
                const { count, error } = await supabase
                    .from("tenants")
                    .select("*", { count: "exact", head: true });
                const end = performance.now();

                if (error) {
                    setDbStatus("Error ❌");
                } else {
                    const latency = Math.round(end - start);
                    setDbStatus(`Active (${latency}ms)`);
                }

                // 2. Check Engine Status (Last Run)
                // Get the latest 'compliance_scan' from asset_log
                // We need org_id first
                const { data: { user } } = await supabase.auth.getUser();
                if (user) {
                    const { data: profile } = await supabase.from('profiles').select('organization_id').eq('id', user.id).maybeSingle();

                    if (profile?.organization_id) {
                        const { data: logs } = await supabase
                            .from("asset_log")
                            .select("created_at")
                            .eq("organization_id", profile.organization_id)
                            .eq("event_type", "compliance_scan")
                            .order("created_at", { ascending: false })
                            .limit(1);

                        if (logs && logs.length > 0) {
                            const lastDate = new Date(logs[0].created_at);
                            setLastRun(lastDate.toISOString());
                            setEngineStatus(`Last Run: ${formatDistanceToNow(lastDate, { addSuffix: true })}`);
                        } else {
                            setEngineStatus("Standing By");
                        }
                    }
                }

            } catch (err) {
                console.error("Status check failed:", err);
                setEngineStatus("Unknown ⚠️");
                setDbStatus("Unknown ⚠️");
            }
        }

        checkStatus();

        // Optional: Poll every minute to update "time ago"
        const interval = setInterval(checkStatus, 60000);
        return () => clearInterval(interval);

    }, []);

    return (
        <div className="bg-[#111] border border-[#222] rounded-xl p-6">
            <h3 className="text-lg font-semibold mb-4 text-zinc-100">System Status</h3>
            <div className="text-green-400 flex items-center gap-2 text-sm">
                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                Operational
            </div>
            <p className="text-zinc-500 text-sm mt-4">All systems running normally.</p>
            <div className="mt-6 space-y-3">
                <div className="flex justify-between text-sm">
                    <span className="text-zinc-400">Engine</span>
                    <span className="text-green-400">{engineStatus}</span>
                </div>
                <div className="flex justify-between text-sm">
                    <span className="text-zinc-400">Database</span>
                    <span className="text-green-400">{dbStatus}</span>
                </div>
                <div className="flex justify-between text-sm">
                    <span className="text-zinc-400">Notifications</span>
                    <span className="text-green-400">Active</span>
                </div>
            </div>
        </div>
    );
}
