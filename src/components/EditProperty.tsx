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

type Property = {
    id: string;
    address: string;
    city: string;
    lease_end?: string;
    rent_due_day?: number;
    next_inspection_date?: string;
    [key: string]: any; // Allow for other fields like image_url
};

export function EditProperty({ property }: { property: Property }) {
    const [open, setOpen] = useState(false);
    const [address, setAddress] = useState(property.address);
    const [city, setCity] = useState(property.city);
    // Handle both camelCase (from mapped) and snake_case (from raw) just in case, 
    // but based on AssetStream it spreads ...prop so it has snake_case keys too.
    const [leaseEnd, setLeaseEnd] = useState(property.lease_end || property.leaseEnd || "");
    const [rentDay, setRentDay] = useState(property.rent_due_day?.toString() || "");
    const [inspectionDate, setInspectionDate] = useState(property.next_inspection_date || "");
    const [saving, setSaving] = useState(false);

    async function handleSave() {
        setSaving(true);
        const { error } = await supabase
            .from('properties')
            .update({
                address,
                city,
                lease_end: leaseEnd,
                rent_due_day: rentDay ? parseInt(rentDay) : null,
                next_inspection_date: inspectionDate
            })
            .eq('id', property.id);

        setSaving(false);

        if (!error) {
            setOpen(false);
            window.location.reload(); // Quick refresh to show data
        } else {
            alert("Error updating property: " + error.message);
        }
    }

    return (
        <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-zinc-400 hover:text-white hover:bg-zinc-800">
                    <Pencil className="h-4 w-4" />
                </Button>
            </SheetTrigger>
            <SheetContent className="bg-zinc-950 border-l-zinc-800 text-white overflow-y-auto">
                <SheetHeader>
                    <SheetTitle className="text-white">Edit Asset</SheetTitle>
                    <SheetDescription className="text-zinc-400">
                        Update property details for {property.address}.
                    </SheetDescription>
                </SheetHeader>
                <div className="grid gap-6 py-6">
                    <div className="grid gap-2">
                        <Label>Property Address</Label>
                        <Input
                            className="bg-zinc-900 border-zinc-800 focus:ring-indigo-500"
                            value={address}
                            onChange={(e) => setAddress(e.target.value)}
                        />
                    </div>
                    <div className="grid gap-2">
                        <Label>City / Region</Label>
                        <Input
                            className="bg-zinc-900 border-zinc-800"
                            value={city}
                            onChange={(e) => setCity(e.target.value)}
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
                                value={rentDay}
                                onChange={(e) => setRentDay(e.target.value)}
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label>Lease End</Label>
                            <Input
                                type="date"
                                className="bg-zinc-900 border-zinc-800 invert-calendar-icon"
                                value={leaseEnd}
                                onChange={(e) => setLeaseEnd(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="grid gap-2">
                        <Label>Next Inspection</Label>
                        <Input
                            type="date"
                            className="bg-zinc-900 border-zinc-800 invert-calendar-icon"
                            value={inspectionDate}
                            onChange={(e) => setInspectionDate(e.target.value)}
                        />
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
