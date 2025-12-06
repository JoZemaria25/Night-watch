"use client";

import { useState } from "react";
import { Pencil } from "lucide-react";
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

type Tenant = {
    id: string;
    full_name: string;
    email: string;
    phone: string;
    status: string;
    [key: string]: any;
};

export function EditTenant({ tenant }: { tenant: Tenant }) {
    const [open, setOpen] = useState(false);
    const [fullName, setFullName] = useState(tenant.full_name);
    const [email, setEmail] = useState(tenant.email);
    const [phone, setPhone] = useState(tenant.phone);
    const [status, setStatus] = useState(tenant.status);
    const [saving, setSaving] = useState(false);

    async function handleSave() {
        setSaving(true);
        const { error } = await supabase
            .from('tenants')
            .update({
                full_name: fullName,
                email,
                phone,
                status,
            })
            .eq('id', tenant.id);

        setSaving(false);

        if (!error) {
            setOpen(false);
            window.location.reload(); // Quick refresh to show data
        } else {
            alert("Error updating tenant: " + error.message);
        }
    }

    return (
        <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 w-8 text-zinc-400 hover:text-white hover:bg-zinc-800">
                    <Pencil className="h-4 w-4" />
                </Button>
            </SheetTrigger>
            <SheetContent className="bg-zinc-950 border-l-zinc-800 text-white overflow-y-auto">
                <SheetHeader>
                    <SheetTitle className="text-white">Edit Tenant</SheetTitle>
                    <SheetDescription className="text-zinc-400">
                        Update details for {tenant.full_name}.
                    </SheetDescription>
                </SheetHeader>
                <div className="grid gap-6 py-6">
                    <div className="grid gap-2">
                        <Label>Full Name</Label>
                        <Input
                            className="bg-zinc-900 border-zinc-800 focus:ring-indigo-500"
                            value={fullName}
                            onChange={(e) => setFullName(e.target.value)}
                        />
                    </div>
                    <div className="grid gap-2">
                        <Label>Email</Label>
                        <Input
                            className="bg-zinc-900 border-zinc-800"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>
                    <div className="grid gap-2">
                        <Label>Phone</Label>
                        <Input
                            className="bg-zinc-900 border-zinc-800"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                        />
                    </div>
                    <div className="grid gap-2">
                        <Label>Status</Label>
                        <Select value={status} onValueChange={setStatus}>
                            <SelectTrigger className="bg-zinc-900 border-zinc-800">
                                <SelectValue placeholder="Select status" />
                            </SelectTrigger>
                            <SelectContent className="bg-zinc-900 border-zinc-800 text-white">
                                <SelectItem value="Active">Active</SelectItem>
                                <SelectItem value="Past">Past</SelectItem>
                                <SelectItem value="Evicted">Evicted</SelectItem>
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
                        {saving ? "Saving..." : "Save Changes"}
                    </Button>
                </SheetFooter>
            </SheetContent>
        </Sheet>
    );
}
