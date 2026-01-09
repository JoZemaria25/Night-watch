"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import { Building2 } from "lucide-react";

interface Props {
    isOpen: boolean;
}

export function OnboardingModal({ isOpen }: Props) {
    const [orgName, setOrgName] = useState("");
    const [loading, setLoading] = useState(false);

    const handleCreate = async () => {
        if (!orgName.trim()) return;
        setLoading(true);

        try {
            // 1. Create Organization
            const { data: org, error: orgError } = await supabase
                .from("organizations")
                .insert({ name: orgName })
                .select()
                .single();

            if (orgError) throw orgError;

            // 2. Update User Profile
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error("No user found");

            const { error: profileError } = await supabase
                .from("profiles")
                .update({ organization_id: org.id })
                .eq("id", user.id);

            if (profileError) throw profileError;

            // 3. Refresh to unlock dashboard
            window.location.reload();

        } catch (error: any) {
            alert("Error creating organization: " + error.message);
            setLoading(false);
        }
    };

    return (
        <Dialog open={isOpen}>
            <DialogContent className="bg-zinc-950 border-zinc-800 text-white sm:max-w-[425px] [&>button]:hidden">
                <DialogHeader>
                    <div className="flex items-center gap-2 text-indigo-400 mb-2">
                        <Building2 className="h-5 w-5" />
                        <span className="text-xs font-bold tracking-widest uppercase">Setup Required</span>
                    </div>
                    <DialogTitle className="text-2xl">Welcome to The Night Watch</DialogTitle>
                    <DialogDescription className="text-zinc-400">
                        To begin monitoring your portfolio, please register your organization.
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                        <Label htmlFor="name" className="text-zinc-300">Organization Name</Label>
                        <Input
                            id="name"
                            placeholder="e.g. Wayne Enterprises"
                            className="bg-zinc-900 border-zinc-800 focus:ring-indigo-500"
                            value={orgName}
                            onChange={(e) => setOrgName(e.target.value)}
                        />
                    </div>
                </div>
                <DialogFooter>
                    <Button
                        onClick={handleCreate}
                        disabled={loading || !orgName.trim()}
                        className="w-full bg-indigo-600 hover:bg-indigo-700 text-white"
                    >
                        {loading ? "Establishing..." : "Create Workspace"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
