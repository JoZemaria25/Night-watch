"use client";

import { useState, useEffect } from "react";
import { Wrench, AlertCircle } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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

export function TenantRequest() {
    const [issueType, setIssueType] = useState<"Repair" | "Inspection">("Repair");
    const [propertyId, setPropertyId] = useState("");
    const [description, setDescription] = useState("");
    const [properties, setProperties] = useState<Property[]>([]);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        async function fetchProperties() {
            const { data } = await supabase.from("properties").select("id, address");
            if (data) setProperties(data);
        }
        fetchProperties();
    }, []);

    async function handleSubmit() {
        if (!propertyId || !description) return alert("Please fill in all fields.");

        setSaving(true);
        const { error } = await supabase.from("maintenance_requests").insert({
            issue_type: issueType,
            description,
            status: "Open",
            property_id: propertyId,
        });
        setSaving(false);

        if (!error) {
            window.location.reload();
        } else {
            alert("Error submitting request: " + error.message);
        }
    }

    return (
        <Sheet>
            <SheetTrigger asChild>
                <Button variant="outline" className="bg-zinc-950 text-zinc-400 hover:text-white border-zinc-800 hover:bg-zinc-900">
                    <Wrench className="mr-2 h-4 w-4" /> Report Issue
                </Button>
            </SheetTrigger>
            <SheetContent className="bg-zinc-950 border-l-zinc-800 text-white">
                <SheetHeader>
                    <SheetTitle className="text-white">Report Maintenance Issue</SheetTitle>
                    <SheetDescription className="text-zinc-400">
                        Submit a new request for repairs or inspection.
                    </SheetDescription>
                </SheetHeader>
                <div className="grid gap-6 py-6">

                    {/* Issue Type Toggle */}
                    <div className="grid gap-2">
                        <Label>Issue Type</Label>
                        <div className="grid grid-cols-2 gap-2">
                            <Button
                                variant={issueType === "Repair" ? "default" : "outline"}
                                className={issueType === "Repair" ? "bg-amber-600 hover:bg-amber-700" : "border-zinc-800 text-zinc-400"}
                                onClick={() => setIssueType("Repair")}
                            >
                                Repair
                            </Button>
                            <Button
                                variant={issueType === "Inspection" ? "default" : "outline"}
                                className={issueType === "Inspection" ? "bg-indigo-600 hover:bg-indigo-700" : "border-zinc-800 text-zinc-400"}
                                onClick={() => setIssueType("Inspection")}
                            >
                                Inspection
                            </Button>
                        </div>
                    </div>

                    {/* Property Select */}
                    <div className="grid gap-2">
                        <Label>Affected Unit</Label>
                        <Select onValueChange={setPropertyId}>
                            <SelectTrigger className="bg-zinc-900 border-zinc-800">
                                <SelectValue placeholder="Select your unit" />
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

                    {/* Description */}
                    <div className="grid gap-2">
                        <Label>Description</Label>
                        <Textarea
                            className="bg-zinc-900 border-zinc-800 min-h-[100px]"
                            placeholder="Please describe the issue in detail..."
                            onChange={(e) => setDescription(e.target.value)}
                        />
                    </div>

                </div>
                <SheetFooter>
                    <Button
                        onClick={handleSubmit}
                        disabled={saving}
                        className="w-full bg-white text-black hover:bg-zinc-200"
                    >
                        {saving ? "Submitting..." : "Submit Request"}
                    </Button>
                </SheetFooter>
            </SheetContent>
        </Sheet>
    );
}
