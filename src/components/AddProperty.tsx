"use client";

import { useState, useEffect } from "react";
import { Plus } from "lucide-react";
import { createBrowserClient } from "@supabase/ssr";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetFooter,
} from "@/components/ui/sheet";

export function AddProperty() {
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [leaseEnd, setLeaseEnd] = useState("");
  const [rentDay, setRentDay] = useState("");
  const [inspectionDate, setInspectionDate] = useState("");
  const [saving, setSaving] = useState(false);

  // Loading & Org ID State
  const [loading, setLoading] = useState(true);
  const [organizationId, setOrganizationId] = useState<string | null>(null);

  // Fetch Organization ID on mount with detailed tracing
  useEffect(() => {
    async function fetchOrgId() {
      console.log("1. Modal Mounted. Starting Fetch...");
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      console.log("2. Auth User:", user?.id, "Auth Error:", authError);

      if (user) {
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('organization_id')
          .eq('id', user.id)
          .single();
        console.log("3. Profile Fetch Result:", profile, "Error:", profileError);

        if (profile?.organization_id) {
          setOrganizationId(profile.organization_id);
        }
      }
      setLoading(false);
    }
    fetchOrgId();
  }, []);

  async function handleSave() {
    // Retry logic: If organizationId is missing, try to fetch it one more time
    let finalOrgId = organizationId;

    if (!finalOrgId) {
      console.log("⚠️ Organization ID missing during submit. Attempting final fetch...");
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('organization_id')
          .eq('id', user.id)
          .single();

        if (profile?.organization_id) {
          console.log("✅ Recovered Organization ID:", profile.organization_id);
          setOrganizationId(profile.organization_id);
          finalOrgId = profile.organization_id;
        }
      }
    }

    if (!finalOrgId) {
      alert("CRITICAL ERROR: No Organization ID found. Cannot link asset to your account.");
      return;
    }

    if (!address || !city) {
      alert("Validation Failed: Missing required fields (Address or City)");
      return;
    }

    setSaving(true);

    const payload = {
      address: address,
      city: city,
      rent_due_day: rentDay ? parseInt(rentDay) : null,
      lease_end: leaseEnd || null,
      next_inspection: inspectionDate || null,
      organization_id: finalOrgId
    };

    console.log("DEBUG: Attempting INSERT with:", payload);

    const { error } = await supabase.from('properties').insert(payload);

    setSaving(false);

    if (error) {
      console.error("DEBUG: Insert Error:", error);
      alert("Database Error: " + error.message);
    } else {
      console.log("DEBUG: Insert Success");
      alert("Success! Asset Created.");
      window.location.reload();
    }
  }

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button className="bg-white text-black hover:bg-zinc-200">
          <Plus className="mr-2 h-4 w-4" /> Add Asset
        </Button>
      </SheetTrigger>
      <SheetContent className="bg-zinc-950 border-l-zinc-800 text-white overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="text-white">Onboard New Asset</SheetTitle>
          <SheetDescription className="text-zinc-400">
            Add a new property to the Night Watch monitoring system.
          </SheetDescription>
        </SheetHeader>

        {/* Requirements: Show amber warning but always show form */}
        {!loading && !organizationId && (
          <div className="mt-4 p-3 bg-amber-900/20 border border-amber-600/30 text-amber-200 rounded text-xs flex items-center animate-pulse">
            <span className="mr-2">⚠️</span>
            Syncing Organization ID...
          </div>
        )}

        <div className="grid gap-6 py-6">
          <div className="grid gap-2">
            <Label>Property Address *</Label>
            <Input
              className="bg-zinc-900 border-zinc-800 focus:ring-indigo-500"
              placeholder="e.g. 12 Lekki Phase 1"
              onChange={(e) => setAddress(e.target.value)}
              value={address}
            />
          </div>
          <div className="grid gap-2">
            <Label>City / Region *</Label>
            <Input
              className="bg-zinc-900 border-zinc-800"
              placeholder="e.g. Lagos"
              onChange={(e) => setCity(e.target.value)}
              value={city}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label>Rent Due Day (1-31)</Label>
              <Input
                type="number"
                min={1}
                max={31}
                className="bg-zinc-900 border-zinc-800"
                placeholder="25"
                onChange={(e) => setRentDay(e.target.value)}
                value={rentDay}
              />
            </div>
            <div className="grid gap-2">
              <Label>Lease End</Label>
              <Input
                type="date"
                className="bg-zinc-900 border-zinc-800 invert-calendar-icon"
                onChange={(e) => setLeaseEnd(e.target.value)}
                value={leaseEnd}
              />
            </div>
          </div>

          <div className="grid gap-2">
            <Label>Next Inspection</Label>
            <Input
              type="date"
              className="bg-zinc-900 border-zinc-800 invert-calendar-icon"
              onChange={(e) => setInspectionDate(e.target.value)}
              value={inspectionDate}
            />
          </div>

        </div>
        <SheetFooter>
          <Button
            onClick={handleSave}
            disabled={saving}
            className="w-full bg-indigo-600 hover:bg-indigo-700"
          >
            {saving ? "Encrypting..." : "Initialize Asset"}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}