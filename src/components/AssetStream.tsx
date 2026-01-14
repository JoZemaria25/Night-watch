"use client";

import React, { useEffect, useState } from "react";
import { Ghost, MoreHorizontal, Building2, Trash } from "lucide-react";
import { createBrowserClient } from "@supabase/ssr";
import { EditProperty } from "./EditProperty";

type Property = {
  id: string;
  address: string;
  city: string;
  leaseEnd?: string;
  lease_end?: string;
  rent_due_day?: number;
  next_inspection_date?: string;
  image_url?: string;
};

export function AssetStream({ limit }: { limit?: number }) {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [organizationId, setOrganizationId] = useState<string | null>(null);

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  useEffect(() => {
    async function init() {
      setLoading(true);
      try {
        // 1. Get current user
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          console.warn("[AssetStream] No authenticated user.");
          setLoading(false);
          return;
        }

        // 2. Get user's organization_id from profiles
        const { data: profile, error: profileError } = await supabase
          .from("profiles")
          .select("organization_id")
          .eq("id", user.id)
          .maybeSingle();

        if (profileError || !profile?.organization_id) {
          console.warn("[AssetStream] No organization linked to user.");
          setLoading(false);
          return;
        }

        setOrganizationId(profile.organization_id);

        // 3. Fetch ONLY properties belonging to user's organization
        let query = supabase
          .from("properties")
          .select("*")
          .eq("organization_id", profile.organization_id)
          .order("address");

        if (limit) {
          query = query.limit(limit);
        }

        const { data, error } = await query;

        if (error) throw error;
        if (data) {
          const enhancedData = data.map((prop: any, index: number) => ({
            ...prop,
            leaseEnd: prop.lease_end || "No Date Set",
            image_url: `https://images.unsplash.com/photo-${index % 2 === 0 ? '1600585154340-be6161a56a0c' : '1600607687939-ce8a6c25118c'}?w=800&auto=format&fit=crop&q=60`
          }));
          setProperties(enhancedData);
        }
      } catch (err) {
        console.error("[AssetStream] Connection Error:", err);
      } finally {
        setLoading(false);
      }
    }

    init();
  }, [limit]);

  async function handleDelete(id: string) {
    if (!window.confirm("Are you sure you want to delete this asset? This action cannot be undone.")) return;

    const { error } = await supabase.from("properties").delete().eq("id", id);
    if (error) {
      alert("Error deleting property: " + error.message);
    } else {
      setProperties(prev => prev.filter(p => p.id !== id));
    }
  }

  if (loading) return <div className="text-zinc-500 text-sm animate-pulse">Syncing Assets...</div>;

  // SECURITY: If no organization, show empty state - NEVER show other users' data
  if (!organizationId) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <Ghost className="h-12 w-12 text-zinc-700 mb-4" />
        <h3 className="text-lg font-medium text-zinc-400">No Assets Yet</h3>
        <p className="text-sm text-zinc-600 mt-1">Add your first property to get started.</p>
      </div>
    );
  }

  if (properties.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <Building2 className="h-12 w-12 text-zinc-700 mb-4" />
        <h3 className="text-lg font-medium text-zinc-400">No Properties Found</h3>
        <p className="text-sm text-zinc-600 mt-1">Add assets to begin monitoring your portfolio.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-white">Live Assets</h2>
        <span className="text-xs font-mono text-emerald-400 bg-emerald-950/30 border border-emerald-900 px-3 py-1 rounded-full">
          ● {properties.length} CONNECTED
        </span>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {properties.map((prop) => (
          <div key={prop.id} className="group relative overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900/50 hover:bg-zinc-900 hover:border-zinc-700 transition-all duration-500">

            {/* ACTION AREA */}
            <div className="absolute top-4 right-4 z-10 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <EditProperty property={prop} />
              <button
                onClick={() => handleDelete(prop.id)}
                className="p-2 text-zinc-600 hover:text-red-500 transition-colors"
                title="Delete Asset"
              >
                <Trash className="h-4 w-4" />
              </button>
            </div>

            <div className="flex items-center p-4 gap-6">

              {/* IMAGE */}
              <div className="h-20 w-20 shrink-0 overflow-hidden rounded-xl border border-zinc-700/50">
                <img
                  src={prop.image_url}
                  alt="Property"
                  className="h-full w-full object-cover opacity-80 group-hover:opacity-100 group-hover:scale-110 transition-all duration-700"
                />
              </div>

              {/* INFO */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="text-lg font-medium text-white truncate">{prop.address}</h3>
                </div>
                <p className="text-sm text-zinc-500 uppercase tracking-wider">{prop.city} • Active Lease</p>

                {/* Visual Timeline Bar */}
                <div className="mt-4 h-1.5 w-full bg-zinc-800 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 w-[65%] group-hover:w-[70%] transition-all duration-1000"></div>
                </div>
              </div>

              {/* EXPIRATION DATA */}
              <div className="text-right shrink-0">
                <div className="text-[10px] text-zinc-500 uppercase tracking-widest mb-1">Lease Ends</div>
                <div className="font-mono text-xl text-white">{prop.leaseEnd}</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}