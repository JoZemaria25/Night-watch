"use client";

import React, { useEffect, useState } from "react";
import { CheckCircle2, ScrollText, RefreshCw } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type Log = {
    id: string;
    policy_name: string;
    status: string;
    scheduled_for: string;
    created_at: string;
};

export function ActivityFeed() {
    const [logs, setLogs] = useState<Log[]>([]);

    useEffect(() => {
        fetchLogs();

        // Subscribe to "Realtime" updates (Optional advanced step)
        // For now, we just fetch on load
    }, []);

    async function fetchLogs() {
        const { data } = await supabase
            .from('asset_log')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(5);

        if (data) setLogs(data);
    }

    return (
        <Card className="border-zinc-200 shadow-sm bg-white h-full">
            <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="p-2 bg-zinc-100 rounded-lg">
                            <ScrollText className="h-4 w-4 text-zinc-900" />
                        </div>
                        <CardTitle className="text-base font-medium text-zinc-900">
                            Night Watch Logs
                        </CardTitle>
                    </div>
                    <button onClick={fetchLogs} className="text-zinc-400 hover:text-zinc-900 transition-colors">
                        <RefreshCw className="h-3.5 w-3.5" />
                    </button>
                </div>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    {logs.length === 0 ? (
                        <p className="text-sm text-zinc-400 italic py-4 text-center">No activity recorded yet.</p>
                    ) : (
                        logs.map((log) => (
                            <div key={log.id} className="flex gap-3 items-start group">
                                <div className="mt-0.5">
                                    <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                                </div>
                                <div className="space-y-1">
                                    <p className="text-sm font-medium text-zinc-900 leading-none">
                                        Triggered: {log.policy_name}
                                    </p>
                                    <div className="flex items-center gap-2 text-xs text-zinc-500">
                                        <span className="font-mono text-[10px] bg-zinc-100 px-1.5 py-0.5 rounded">
                                            {new Date(log.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </span>
                                        <span>Status: {log.status}</span>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </CardContent>
        </Card>
    );
}