"use client";

import React, { useState } from "react";
import { Plus, Save, Wand2, Loader2, Check } from "lucide-react";
import { supabase } from "@/lib/supabase"; // Import the connection
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function PolicyBuilder() {
    // 1. STATE: These variables hold the user's choices
    const [trigger, setTrigger] = useState("lease_end");
    const [days, setDays] = useState("90");
    const [action, setAction] = useState("renewal_email");

    // UI States
    const [isSaving, setIsSaving] = useState(false);
    const [isSaved, setIsSaved] = useState(false);

    // 2. THE LOGIC: Send data to Supabase
    async function handleCertify() {
        setIsSaving(true);

        // The "Write" Operation
        const { error } = await supabase
            .from('policies')
            .insert([
                {
                    event_trigger: trigger,
                    days_offset: parseInt(days),
                    action_type: action
                }
            ]);

        setIsSaving(false);

        if (error) {
            console.error("Failed to save:", error);
            alert("Error saving rule. Check console.");
        } else {
            // Success Feedback
            setIsSaved(true);
            // Reset the "Success" state after 3 seconds so they can add another
            setTimeout(() => setIsSaved(false), 3000);
        }
    }

    return (
        <Card className="w-full border-zinc-200 shadow-sm bg-white">
            <CardHeader>
                <div className="flex items-center gap-2">
                    <div className="p-2 bg-zinc-100 rounded-lg">
                        <Wand2 className="h-5 w-5 text-zinc-900" />
                    </div>
                    <div>
                        <CardTitle className="text-lg font-medium text-zinc-900">
                            Automation Logic
                        </CardTitle>
                        <CardDescription>
                            Define the rules that trigger the Night Watch.
                        </CardDescription>
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                <div className="p-6 bg-zinc-50/50 rounded-xl border border-zinc-100">
                    <div className="flex flex-wrap items-center gap-3 text-lg text-zinc-600 font-light leading-relaxed">
                        <span>When a</span>

                        {/* Variable 1: TRIGGER */}
                        <Select onValueChange={setTrigger} defaultValue={trigger}>
                            <SelectTrigger className="w-[180px] bg-white border-zinc-200 font-medium text-zinc-900 h-10 shadow-sm">
                                <SelectValue placeholder="Select Event" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="lease_end">Lease Ends</SelectItem>
                                <SelectItem value="rent_due">Rent is Due</SelectItem>
                                <SelectItem value="inspection">Inspection Due</SelectItem>
                            </SelectContent>
                        </Select>

                        <span>is</span>

                        {/* Variable 2: DAYS */}
                        <div className="flex items-center gap-2">
                            <Input
                                type="number"
                                value={days}
                                onChange={(e) => setDays(e.target.value)}
                                className="w-20 bg-white border-zinc-200 font-medium text-zinc-900 h-10 text-center shadow-sm"
                            />
                            <span className="font-medium text-zinc-900">Days</span>
                        </div>

                        <span>away, automatically send</span>

                        {/* Variable 3: ACTION */}
                        <Select onValueChange={setAction} defaultValue={action}>
                            <SelectTrigger className="w-[240px] bg-white border-zinc-200 font-medium text-indigo-600 h-10 shadow-sm">
                                <SelectValue placeholder="Select Action" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="renewal_email">Renewal Notice (Email)</SelectItem>
                                <SelectItem value="sms_reminder">Payment Reminder (SMS)</SelectItem>
                                <SelectItem value="create_task">Create Admin Task</SelectItem>
                            </SelectContent>
                        </Select>

                        <span>to the Tenant.</span>
                    </div>
                </div>
            </CardContent>
            <CardFooter className="flex justify-between border-t border-zinc-100 bg-zinc-50/30 px-6 py-4 rounded-b-xl">
                <Button variant="ghost" className="text-zinc-500 hover:text-zinc-900">
                    <Plus className="mr-2 h-4 w-4" /> Add Condition
                </Button>

                {/* THE ACTIVE BUTTON */}
                <Button
                    onClick={handleCertify}
                    disabled={isSaving || isSaved}
                    className={isSaved ? "bg-emerald-600 text-white" : "bg-zinc-900 text-white hover:bg-zinc-800 shadow-md"}
                >
                    {isSaving ? (
                        <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...
                        </>
                    ) : isSaved ? (
                        <>
                            <Check className="mr-2 h-4 w-4" /> Rule Active
                        </>
                    ) : (
                        <>
                            <Save className="mr-2 h-4 w-4" /> Certify Rule
                        </>
                    )}
                </Button>
            </CardFooter>
        </Card>
    );
}