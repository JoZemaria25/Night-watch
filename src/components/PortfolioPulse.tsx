"use client";

import { Activity } from "lucide-react";
import {
    Area,
    AreaChart,
    CartesianGrid,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from "recharts";
import { useEffect, useState } from "react";
import { createBrowserClient } from "@supabase/ssr";

const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
        return (
            <div className="rounded-md border border-zinc-800 bg-zinc-950 p-3 shadow-xl">
                <p className="mb-1 text-sm font-medium text-zinc-400">{label}</p>
                <p className="text-lg font-bold text-white">
                    {payload[0].value} <span className="text-xs font-normal text-emerald-500">Events</span>
                </p>
            </div>
        );
    }
    return null;
};

export function PortfolioPulse() {
    const [data, setData] = useState<{ day: string; value: number }[]>([]);
    const [totalEvents, setTotalEvents] = useState(0);
    const [loading, setLoading] = useState(true);

    const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    useEffect(() => {
        async function fetchData() {
            try {
                // 1. Get current user's organization
                const { data: { user } } = await supabase.auth.getUser();
                if (!user) {
                    console.warn("[PortfolioPulse] No authenticated user.");
                    setLoading(false);
                    return;
                }

                const { data: profile, error: profileError } = await supabase
                    .from("profiles")
                    .select("organization_id")
                    .eq("id", user.id)
                    .maybeSingle();

                if (profileError || !profile?.organization_id) {
                    console.warn("[PortfolioPulse] No organization linked to user.");
                    // Show empty chart with 0 values
                    const emptyDays = generateEmptyDays();
                    setData(emptyDays);
                    setLoading(false);
                    return;
                }

                const today = new Date();
                const sevenDaysAgo = new Date();
                sevenDaysAgo.setDate(today.getDate() - 6);

                // 2. Generate the last 7 days array
                const days: { date: string; day: string; value: number }[] = [];
                for (let i = 6; i >= 0; i--) {
                    const d = new Date();
                    d.setDate(today.getDate() - i);
                    days.push({
                        date: d.toISOString().split("T")[0],
                        day: d.toLocaleDateString("en-US", { weekday: "short" }),
                        value: 0,
                    });
                }

                // 3. Fetch ONLY logs belonging to user's organization
                const { data: logs, error } = await supabase
                    .from("asset_log")
                    .select("created_at")
                    .eq("organization_id", profile.organization_id)
                    .gte("created_at", sevenDaysAgo.toISOString());

                if (error) {
                    console.error("[PortfolioPulse] Error fetching logs:", error);
                    setData(days.map(d => ({ day: d.day, value: 0 })));
                    setLoading(false);
                    return;
                }

                // 4. Aggregate data
                let total = 0;
                if (logs) {
                    logs.forEach((log) => {
                        const dateStr = log.created_at.split("T")[0];
                        const dayObj = days.find((d) => d.date === dateStr);
                        if (dayObj) {
                            dayObj.value += 1;
                            total += 1;
                        }
                    });
                }

                setData(days.map((d) => ({ day: d.day, value: d.value })));
                setTotalEvents(total);
            } catch (err) {
                console.error("[PortfolioPulse] Unexpected error:", err);
            } finally {
                setLoading(false);
            }
        }

        fetchData();
    }, []);

    // Helper to generate empty days for chart structure
    function generateEmptyDays(): { day: string; value: number }[] {
        const days: { day: string; value: number }[] = [];
        const today = new Date();
        for (let i = 6; i >= 0; i--) {
            const d = new Date();
            d.setDate(today.getDate() - i);
            days.push({
                day: d.toLocaleDateString("en-US", { weekday: "short" }),
                value: 0,
            });
        }
        return days;
    }

    return (
        <div className="w-full rounded-xl border border-zinc-800 bg-zinc-900/50 backdrop-blur-sm p-6">
            <div className="mb-6 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-500">
                        <Activity className="h-5 w-5" />
                    </div>
                    <div>
                        <h2 className="text-lg font-semibold text-white">System Heartbeat</h2>
                        <p className="text-sm text-zinc-400">Real-time portfolio health monitoring</p>
                    </div>
                </div>
                <div className="text-right">
                    <p className="text-2xl font-bold text-white">{loading ? "-" : totalEvents}</p>
                    <p className="text-xs text-zinc-500 uppercase tracking-wider">Total Events (7d)</p>
                </div>
            </div>

            <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <defs>
                            <linearGradient id="colorHealth" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                                <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                        <XAxis
                            dataKey="day"
                            stroke="#71717a"
                            fontSize={12}
                            tickLine={false}
                            axisLine={false}
                            dy={10}
                        />
                        <YAxis
                            stroke="#71717a"
                            fontSize={12}
                            tickLine={false}
                            axisLine={false}
                            allowDecimals={false}
                        />
                        <Tooltip content={<CustomTooltip />} cursor={{ stroke: "#27272a", strokeWidth: 1 }} />
                        <Area
                            type="monotone"
                            dataKey="value"
                            stroke="#10b981"
                            strokeWidth={3}
                            fillOpacity={1}
                            fill="url(#colorHealth)"
                            isAnimationActive={!loading}
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}
