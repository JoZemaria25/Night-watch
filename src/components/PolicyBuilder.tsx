"use client";
import { Plus, Trash2, AlertCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PolicyRow } from "@/lib/nightWatchEngine";
import { useEffect, useState } from "react";
import { createBrowserClient } from "@supabase/ssr";

interface Props {
    policies: PolicyRow[];
    setPolicies: (p: PolicyRow[]) => void;
}

export function PolicyBuilder({ policies, setPolicies }: Props) {
    const [propertyOptions, setPropertyOptions] = useState<{ id: string; address: string }[]>([]);

    useEffect(() => {
        const fetchProperties = async () => {
            const supabase = createBrowserClient(
                process.env.NEXT_PUBLIC_SUPABASE_URL!,
                process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
            );
            const { data } = await supabase.from('properties').select('id, address');
            if (data) setPropertyOptions(data);
        };
        fetchProperties();
    }, []);

    const addPolicy = () => {
        setPolicies([
            ...policies,
            { id: Date.now(), scope: "global", metric: "rent_due", operator: "=", value: "1", recipient: "tenant" }
        ]);
    };

    const removePolicy = (id: number) => {
        setPolicies(policies.filter((p) => p.id !== id));
    };

    const updatePolicy = (id: number, field: keyof PolicyRow, value: string) => {
        setPolicies(policies.map((p) => (p.id === id ? { ...p, [field]: value } : p)));
    };

    return (
        <Card className="bg-zinc-900/50 border-zinc-800 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
                <div className="space-y-1">
                    <div className="flex items-center gap-2 text-indigo-400">
                        <AlertCircle className="h-4 w-4" />
                        <span className="text-xs font-bold tracking-widest uppercase">Automation Logic</span>
                    </div>
                    <CardTitle className="text-white text-xl">Policy Engine</CardTitle>
                </div>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="space-y-2">
                    {policies.map((policy) => (
                        <div key={policy.id} className="grid grid-cols-1 md:grid-cols-12 gap-2 items-center bg-zinc-950/50 p-3 rounded-lg border border-zinc-800/50">
                            {/* SCOPE */}
                            <div className="col-span-3">
                                <select value={policy.scope} onChange={(e) => updatePolicy(policy.id, "scope", e.target.value)} className="w-full bg-zinc-900 border border-zinc-800 text-zinc-300 text-xs rounded h-9 px-2">
                                    <optgroup label="General">
                                        <option value="global">🌐 All Properties</option>
                                        <option value="residential">🏠 Residential</option>
                                        <option value="commercial">🏢 Commercial</option>
                                    </optgroup>
                                    <optgroup label="Specific Assets">
                                        {propertyOptions.map((prop) => (
                                            <option key={prop.id} value={prop.id}>📍 {prop.address}</option>
                                        ))}
                                    </optgroup>
                                </select>
                            </div>
                            {/* TRIGGER */}
                            <div className="col-span-3">
                                <select value={policy.metric} onChange={(e) => updatePolicy(policy.id, "metric", e.target.value)} className="w-full bg-zinc-900 border border-zinc-800 text-white text-xs rounded h-9 px-2">
                                    <option value="lease_end">Lease Ends</option>
                                    <option value="rent_due">Rent Due</option>
                                </select>
                            </div>
                            {/* LOGIC */}
                            <div className="col-span-3 flex gap-1">
                                <select value={policy.operator} onChange={(e) => updatePolicy(policy.id, "operator", e.target.value)} className="w-12 bg-zinc-900 border border-zinc-800 text-zinc-400 text-xs rounded h-9 px-1 text-center">
                                    <option value="<">&lt;</option><option value=">">&gt;</option><option value="=">=</option>
                                </select>
                                <input type="number" value={policy.value} onChange={(e) => updatePolicy(policy.id, "value", e.target.value)} className="w-full bg-zinc-900 border border-zinc-800 text-white text-xs rounded h-9 px-2" />
                            </div>
                            {/* ACTION */}
                            <div className="col-span-2">
                                <select value={policy.recipient} onChange={(e) => updatePolicy(policy.id, "recipient", e.target.value)} className="w-full bg-zinc-900 border border-zinc-800 text-emerald-400 text-xs rounded h-9 px-2">
                                    <option value="manager">Alert Me</option><option value="tenant">Email Tenant</option>
                                </select>
                            </div>
                            {/* DELETE */}
                            <div className="col-span-1 flex justify-end">
                                <button onClick={() => removePolicy(policy.id)} className="p-2 text-zinc-600 hover:text-red-500 hover:bg-red-950/30 rounded"><Trash2 className="w-4 h-4" /></button>
                            </div>
                        </div>
                    ))}
                </div>
                <Button onClick={addPolicy} variant="outline" className="w-full border-dashed border-zinc-800 text-zinc-500 hover:text-white h-9 text-xs"><Plus className="w-3 h-3 mr-2" />Add Logic Rule</Button>
            </CardContent>
        </Card>
    );
}