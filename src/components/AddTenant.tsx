"use client";

import { useState, useEffect } from "react";
import { UserPlus, AlertCircle, CheckCircle2, Loader2 } from "lucide-react";
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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

type Property = {
    id: string;
    address: string;
};

export function AddTenant() {
    const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
    const [fullName, setFullName] = useState("");
    const [email, setEmail] = useState("");
    const [phone, setPhone] = useState("");
    const [propertyId, setPropertyId] = useState("");
    const [properties, setProperties] = useState<Property[]>([]);

    // Loading & Org ID State
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [organizationId, setOrganizationId] = useState<string | null>(null);
    const [fetchError, setFetchError] = useState(false);

    // Initial Fetch with detailed logging
    useEffect(() => {
        async function init() {
            setLoading(true);
            console.log("TENANT MODAL: Starting Fetch...");

            try {
                const { data: { user }, error: authError } = await supabase.auth.getUser();
                console.log("TENANT MODAL: User found?", user?.id, "Auth Error:", authError);

                if (user) {
                    const { data: profile, error: profileError } = await supabase
                        .from('profiles')
                        .select('organization_id')
                        .eq('id', user.id)
                        .single();

                    console.log("TENANT MODAL: Profile found?", profile, "Error:", profileError);

                    if (profile?.organization_id) {
                        setOrganizationId(profile.organization_id);

                        // Fetch properties for this organization
                        const { data, error: propError } = await supabase
                            .from("properties")
                            .select("id, address")
                            .eq('organization_id', profile.organization_id);

                        console.log("TENANT MODAL: Properties fetched:", data?.length, "Error:", propError);

                        if (data) setProperties(data);
                    } else {
                        console.warn("TENANT MODAL: Profile missing organization_id");
                        setFetchError(true);
                    }
                } else {
                    console.error("TENANT MODAL: No authenticated user");
                    setFetchError(true);
                }
            } catch (err) {
                console.error("TENANT MODAL: Unexpected error fetching dependencies:", err);
                setFetchError(true);
            } finally {
                setLoading(false);
            }
        }
        init();
    }, []);

    async function handleSave() {
        // Fail-Safe: Attempt to recover Org ID if missing
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
            alert("CRITICAL ERROR: Could not determine your organization. Please refresh and try again.");
            return;
        }

        if (!fullName || !email || !propertyId) {
            alert("Please fill in all required fields (Name, Email, Property).");
            return;
        }

        setSaving(true);
        const payload = {
            full_name: fullName,
            email,
            phone,
            property_id: propertyId,
            status: "Active",
            organization_id: finalOrgId
        };

        console.log("TENANT MODAL: Submitting payload:", payload);

        const { error } = await supabase.from("tenants").insert(payload);
        setSaving(false);

        if (!error) {
            console.log("TENANT MODAL: Success");
            window.location.reload();
        } else {
            console.error("TENANT MODAL: Insert Error", error);
            alert("Error adding tenant: " + error.message);
        }
    }

    return (
        <Sheet>
            <SheetTrigger asChild>
                <Button className="bg-zinc-800 text-white hover:bg-zinc-700 border border-zinc-700">
                    <UserPlus className="mr-2 h-4 w-4" /> Add Tenant
                </Button>
            </SheetTrigger>
            <SheetContent className="bg-zinc-950 border-l-zinc-800 text-white overflow-y-auto">
                <SheetHeader>
                    <SheetTitle className="text-white">Onboard Tenant</SheetTitle>
                    <SheetDescription className="text-zinc-400">
                        Register a new tenant and assign them to a property.
                    </SheetDescription>
                </SheetHeader>

                {/* Status Bar */}
                <div className={cn(
                    "mt-6 p-3 rounded-md text-sm border flex items-center gap-2",
                    loading ? "bg-amber-950/30 border-amber-900/50 text-amber-500" :
                        !organizationId ? "bg-red-950/30 border-red-900/50 text-red-400" :
                            "bg-emerald-950/30 border-emerald-900/50 text-emerald-400"
                )}>
                    {loading ? (
                        <>
                            <Loader2 className="h-4 w-4 animate-spin" />
                            <span>Syncing Profile...</span>
                        </>
                    ) : !organizationId ? (
                        <>
                            <AlertCircle className="h-4 w-4" />
                            <span>⚠️ Org ID Missing - Auto-retrying on submit</span>
                        </>
                    ) : (
                        <>
                            <CheckCircle2 className="h-4 w-4" />
                            <span>Ready to Link</span>
                        </>
                    )}
                </div>

                <div className="grid gap-6 py-6">
                    <div className="grid gap-2">
                        <Label>Full Name *</Label>
                        <Input
                            className="bg-zinc-900 border-zinc-800 focus:ring-indigo-500"
                            placeholder="e.g. John Doe"
                            onChange={(e) => setFullName(e.target.value)}
                            value={fullName}
                        />
                    </div>
                    <div className="grid gap-2">
                        <Label>Email Address *</Label>
                        <Input
                            className="bg-zinc-900 border-zinc-800"
                            placeholder="e.g. john@example.com"
                            onChange={(e) => setEmail(e.target.value)}
                            value={email}
                        />
                    </div>
                    <div className="grid gap-2">
                        <Label>Phone Number</Label>
                        <Input
                            className="bg-zinc-900 border-zinc-800"
                            placeholder="e.g. +1 234 567 890"
                            onChange={(e) => setPhone(e.target.value)}
                            value={phone}
                        />
                    </div>
                    <div className="grid gap-2">
                        <Label>Assign Unit *</Label>
                        <Select onValueChange={setPropertyId} disabled={loading || !organizationId}>
                            <SelectTrigger className="bg-zinc-900 border-zinc-800">
                                <SelectValue placeholder={
                                    loading ? "Loading properties..." :
                                        !organizationId ? "Waiting for Organization Data..." :
                                            "Select a property"
                                } />
                            </SelectTrigger>
                            <SelectContent className="bg-zinc-900 border-zinc-800 text-white">
                                {properties.map((prop) => (
                                    <SelectItem key={prop.id} value={prop.id}>
                                        {prop.address}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>
                <SheetFooter>
                    <Button
                        onClick={handleSave}
                        disabled={saving}
                        className="w-full bg-indigo-600 hover:bg-indigo-700"
                    >
                        {saving ? "Processing..." : "Register Tenant"}
                    </Button>
                </SheetFooter>
            </SheetContent>
        </Sheet>
    );
}
