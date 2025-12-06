"use client";

import { useState } from "react";
import { Plus, Building } from "lucide-react";
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
  SheetClose
} from "@/components/ui/sheet";

export function AddProperty() {
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [leaseEnd, setLeaseEnd] = useState("");
  const [rentDay, setRentDay] = useState("");
  const [inspectionDate, setInspectionDate] = useState("");
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    setSaving(true);
    const { error } = await supabase.from('properties').insert({
      address,
      city,
      lease_end: leaseEnd,
      rent_due_day: rentDay ? parseInt(rentDay) : null,
      next_inspection_date: inspectionDate
    });
    setSaving(false);

    if (!error) {
      window.location.reload(); // Quick refresh to show data
    } else {
      alert("Error saving property: " + error.message);
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
        <div className="grid gap-6 py-6">
          <div className="grid gap-2">
            <Label>Property Address</Label>
            <Input
              className="bg-zinc-900 border-zinc-800 focus:ring-indigo-500"
              placeholder="e.g. 12 Lekki Phase 1"
              onChange={(e) => setAddress(e.target.value)}
            />
          </div>
          <div className="grid gap-2">
            <Label>City / Region</Label>
            <Input
              className="bg-zinc-900 border-zinc-800"
              placeholder="e.g. Lagos"
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
                placeholder="e.g. 25"
                onChange={(e) => setRentDay(e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label>Lease End</Label>
              <Input
                type="date"
                className="bg-zinc-900 border-zinc-800 invert-calendar-icon"
                onChange={(e) => setLeaseEnd(e.target.value)}
              />
            </div>
          </div>

          <div className="grid gap-2">
            <Label>Next Inspection</Label>
            <Input
              type="date"
              className="bg-zinc-900 border-zinc-800 invert-calendar-icon"
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
            {saving ? "Encrypting..." : "Initialize Asset"}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}