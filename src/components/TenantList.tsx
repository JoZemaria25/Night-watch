"use client";

import React, { useEffect, useState } from "react";
import { Trash, User } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { EditTenant } from "./EditTenant";

type Tenant = {
    id: string;
    full_name: string;
    email: string;
    phone: string;
    status: string;
    property_id: string;
    properties?: {
        address: string;
    };
};

export function TenantList() {
    const [tenants, setTenants] = useState<Tenant[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchTenants();
    }, []);

    async function fetchTenants() {
        try {
            const { data, error } = await supabase
                .from("tenants")
                .select(`
          *,
          properties (
            address
          )
        `)
                .order("full_name");

            if (error) throw error;
            if (data) {
                setTenants(data as any);
            }
        } catch (err) {
            console.error("Error fetching tenants:", err);
        } finally {
            setLoading(false);
        }
    }

    async function handleDelete(id: string) {
        if (!window.confirm("Are you sure you want to remove this tenant?")) return;

        const { error } = await supabase.from("tenants").delete().eq("id", id);
        if (error) {
            alert("Error deleting tenant: " + error.message);
        } else {
            setTenants((prev) => prev.filter((t) => t.id !== id));
        }
    }

    if (loading) return <div className="text-zinc-500 text-sm animate-pulse">Loading Tenants...</div>;

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-white">Tenants</h2>
                <span className="text-xs font-mono text-indigo-400 bg-indigo-950/30 border border-indigo-900 px-3 py-1 rounded-full">
                    ● {tenants.length} ACTIVE
                </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {tenants.map((tenant) => (
                    <div
                        key={tenant.id}
                        className="group relative overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900/50 hover:bg-zinc-900 hover:border-zinc-700 transition-all duration-300"
                    >
                        <div className="absolute top-4 right-4 z-10 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                            <EditTenant tenant={tenant} />
                            <button
                                onClick={() => handleDelete(tenant.id)}
                                className="p-2 text-zinc-600 hover:text-red-500 transition-colors"
                                title="Remove Tenant"
                            >
                                <Trash className="h-4 w-4" />
                            </button>
                        </div>

                        <div className="flex items-center p-4 gap-4">
                            {/* Avatar */}
                            <div className="h-12 w-12 shrink-0 rounded-full bg-zinc-800 flex items-center justify-center border border-zinc-700">
                                <User className="h-6 w-6 text-zinc-400" />
                            </div>

                            {/* Info */}
                            <div className="flex-1 min-w-0">
                                <h3 className="text-base font-medium text-white truncate">
                                    {tenant.full_name}
                                </h3>
                                <p className="text-xs text-zinc-500 truncate">{tenant.email}</p>
                                <div className="mt-2 flex items-center gap-2">
                                    <span className="text-[10px] uppercase tracking-wider text-zinc-400 bg-zinc-800 px-2 py-0.5 rounded">
                                        {tenant.status}
                                    </span>
                                    <span className="text-[10px] text-zinc-500 truncate">
                                        {tenant.properties?.address || "Unassigned"}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
