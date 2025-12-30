"use client";

import { useState, useEffect } from "react";
import { Plus, UserPlus } from "lucide-react";
import { supabase } from "@/lib/supabase";
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

type Property = {
    id: string;
    address: string;
};

export function AddTenant() {
    const [fullName, setFullName] = useState("");
    const [email, setEmail] = useState("");
    const [phone, setPhone] = useState("");
    const [propertyId, setPropertyId] = useState("");
    const [properties, setProperties] = useState<Property[]>([]);
    const [saving, setSaving] = useState(false);
    const [organizationId, setOrganizationId] = useState<string | null>(null);

    useEffect(() => {
        async function init() {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                const { data: profile } = await supabase
                    .from('profiles')
                    .select('organization_id')
                    .eq('id', user.id)
                    .single();

                if (profile?.organization_id) {
                    setOrganizationId(profile.organization_id);

                    // Fetch properties for this organization
                    const { data } = await supabase
                        .from("properties")
                        .select("id, address")
                        .eq('organization_id', profile.organization_id);

                    if (data) setProperties(data);
                }
            }
        }
        init();
    }, []);

    async function handleSave() {
        if (!organizationId) {
            alert("Error: Could not determine your organization. Please try reloading.");
            return;
        }

        setSaving(true);
        const { error } = await supabase.from("tenants").insert({
            full_name: fullName,
            email,
            phone,
            property_id: propertyId,
            status: "Active",
            organization_id: organizationId
        });
        setSaving(false);

        if (!error) {
            window.location.reload();
        } else {
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
            <SheetContent className="bg-zinc-950 border-l-zinc-800 text-white">
                <SheetHeader>
                    <SheetTitle className="text-white">Onboard Tenant</SheetTitle>
                    <SheetDescription className="text-zinc-400">
                        Register a new tenant and assign them to a property.
                    </SheetDescription>
                </SheetHeader>
                <div className="grid gap-6 py-6">
                    <div className="grid gap-2">
                        <Label>Full Name</Label>
                        <Input
                            className="bg-zinc-900 border-zinc-800 focus:ring-indigo-500"
                            placeholder="e.g. John Doe"
                            onChange={(e) => setFullName(e.target.value)}
                        />
                    </div>
                    <div className="grid gap-2">
                        <Label>Email Address</Label>
                        <Input
                            className="bg-zinc-900 border-zinc-800"
                            placeholder="e.g. john@example.com"
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>
                    <div className="grid gap-2">
                        <Label>Phone Number</Label>
                        <Input
                            className="bg-zinc-900 border-zinc-800"
                            placeholder="e.g. +1 234 567 890"
                            onChange={(e) => setPhone(e.target.value)}
                        />
                    </div>
                    <div className="grid gap-2">
                        <Label>Assign Unit</Label>
                        <Select onValueChange={setPropertyId}>
                            <SelectTrigger className="bg-zinc-900 border-zinc-800">
                                <SelectValue placeholder="Select a property" />
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
                        disabled={saving || !organizationId}
                        className="w-full bg-indigo-600 hover:bg-indigo-700"
                    >
                        {saving ? "Processing..." : "Register Tenant"}
                    </Button>
                </SheetFooter>
            </SheetContent>
        </Sheet>
    );
}
