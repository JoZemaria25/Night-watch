"use client";

import { useState, useEffect } from "react";
import { Wrench, AlertCircle, Loader2, CheckCircle2 } from "lucide-react";
import { createBrowserClient } from "@supabase/ssr";
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
import { cn } from "@/lib/utils";

type Property = {
    id: string;
    address: string;
};

export function TenantRequest() {
    const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    const [issueType, setIssueType] = useState<"Repair" | "Inspection">("Repair");
    const [propertyId, setPropertyId] = useState("");
    const [description, setDescription] = useState("");
    const [properties, setProperties] = useState<Property[]>([]);

    // Safety & Loading State
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [organizationId, setOrganizationId] = useState<string | null>(null);

    useEffect(() => {
        async function init() {
            setLoading(true);
            try {
                const { data: { user } } = await supabase.auth.getUser();
                if (user) {
                    const { data: profile } = await supabase
                        .from('profiles')
                        .select('organization_id')
                        .eq('id', user.id)
                        .maybeSingle();

                    if (profile?.organization_id) {
                        setOrganizationId(profile.organization_id);

                        // Only fetch properties if we have a valid Org ID
                        const { data } = await supabase
                            .from("properties")
                            .select("id, address")
                            .eq('organization_id', profile.organization_id);

                        if (data) setProperties(data);
                    }
                }
            } catch (error) {
                console.error("Failed to load request dependencies:", error);
            } finally {
                setLoading(false);
            }
        }
        init();
    }, []);

    async function handleSubmit() {
        if (!propertyId || !description) return alert("Please fill in all fields.");
        if (!organizationId) return alert("System Error: No Organization Linked.");

        setSaving(true);
        const { error } = await supabase.from("maintenance_requests").insert({
            issue_type: issueType,
            description,
            status: "Open",
            property_id: propertyId,
            organization_id: organizationId // Explicitly link to org
        });
        setSaving(false);

        if (!error) {
            window.location.reload();
        } else {
            alert("Error submitting request: " + error.message);
        }
    }

    // Guard: If still loading, show a loading button state
    // Guard: If no Organization ID, disable the flow
    const isDisabled = loading || !organizationId;

    return (
        <Sheet>
            <SheetTrigger asChild>
                <Button
                    variant="outline"
                    disabled={isDisabled}
                    className={cn(
                        "bg-zinc-950 text-zinc-400 border-zinc-800 hover:bg-zinc-900 border",
                        isDisabled && "opacity-50 cursor-not-allowed"
                    )}
                >
                    {loading ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                        <Wrench className="mr-2 h-4 w-4" />
                    )}
                    {loading ? "Syncing..." : "Report Issue"}
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

                    {/* Status Indicator */}
                    {!loading && !organizationId && (
                        <div className="p-3 bg-red-950/20 border border-red-900/50 rounded-md flex items-center gap-3 text-red-400 text-sm">
                            <AlertCircle className="h-4 w-4" />
                            <span>Finish Onboarding to report issues.</span>
                        </div>
                    )}

                    {/* Issue Type Toggle */}
                    <div className="grid gap-2">
                        <Label>Issue Type</Label>
                        <div className="grid grid-cols-2 gap-2">
                            <Button
                                variant={issueType === "Repair" ? "default" : "outline"}
                                className={cn(
                                    "transition-all",
                                    issueType === "Repair"
                                        ? "bg-amber-600 hover:bg-amber-700 text-white border-transparent"
                                        : "bg-transparent border-zinc-800 text-zinc-400 hover:text-zinc-200"
                                )}
                                onClick={() => setIssueType("Repair")}
                            >
                                Repair
                            </Button>
                            <Button
                                variant={issueType === "Inspection" ? "default" : "outline"}
                                className={cn(
                                    "transition-all",
                                    issueType === "Inspection"
                                        ? "bg-indigo-600 hover:bg-indigo-700 text-white border-transparent"
                                        : "bg-transparent border-zinc-800 text-zinc-400 hover:text-zinc-200"
                                )}
                                onClick={() => setIssueType("Inspection")}
                            >
                                Inspection
                            </Button>
                        </div>
                    </div>

                    {/* Property Select */}
                    <div className="grid gap-2">
                        <Label>Affected Unit</Label>
                        <Select onValueChange={setPropertyId} disabled={isDisabled}>
                            <SelectTrigger className="bg-zinc-900 border-zinc-800">
                                <SelectValue placeholder={
                                    properties.length === 0 ? "No properties available" : "Select your unit"
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

                    {/* Description */}
                    <div className="grid gap-2">
                        <Label>Description</Label>
                        <Textarea
                            className="bg-zinc-900 border-zinc-800 min-h-[100px] focus:ring-indigo-500/50"
                            placeholder="Please describe the issue in detail..."
                            onChange={(e) => setDescription(e.target.value)}
                        />
                    </div>

                </div>
                <SheetFooter>
                    <Button
                        onClick={handleSubmit}
                        disabled={saving || isDisabled}
                        className="w-full bg-white text-black hover:bg-zinc-200"
                    >
                        {saving ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Submitting...
                            </>
                        ) : "Submit Request"}
                    </Button>
                </SheetFooter>
            </SheetContent>
        </Sheet>
    );
}
