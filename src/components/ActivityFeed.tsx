"use client";

import { useEffect, useState } from "react";
import { createBrowserClient } from "@supabase/ssr";
import { Activity, AlertTriangle, CheckCircle } from "lucide-react";

export function ActivityFeed() {
    const [logs, setLogs] = useState<any[]>([]);

    const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    useEffect(() => {
        fetchLogs();

        // Optional: Real-time subscription
        const channel = supabase
            .channel('realtime logs')
            .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'asset_log' }, (payload) => {
                setLogs((current) => [payload.new, ...current]);
            })
            .subscribe();

        return () => { supabase.removeChannel(channel); };
    }, []);

    async function fetchLogs() {
        const { data } = await supabase
            .from('asset_log')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(10);

        if (data) setLogs(data);
    }

    return (
        <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6">
            <div className="flex items-center gap-2 mb-4">
                <Activity className="w-5 h-5 text-indigo-500" />
                <h3 className="font-semibold text-white">Night Watch Logs</h3>
            </div>

            <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2">
                {logs.length === 0 ? (
                    <p className="text-zinc-500 text-sm">No recent anomalies detected.</p>
                ) : (
                    logs.map((log) => (
                        <div key={log.id} className="flex gap-3 text-sm border-b border-zinc-800/50 pb-3 last:border-0">
                            <div className="mt-1">
                                {log.status === 'warning' ? (
                                    <AlertTriangle className="w-4 h-4 text-amber-500" />
                                ) : (
                                    <CheckCircle className="w-4 h-4 text-emerald-500" />
                                )}
                            </div>
                            <div>
                                <p className="text-zinc-300">{log.message}</p>
                                <p className="text-xs text-zinc-500">
                                    {new Date(log.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </p>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}