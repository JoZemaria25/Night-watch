"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { Loader2, Building2, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createOrganizationAction } from "@/app/actions";
import { useState } from "react";

// Initial State for the form
const initialState = {
    success: false,
    message: "",
};

function SubmitButton() {
    const { pending } = useFormStatus();

    return (
        <Button
            type="submit"
            disabled={pending}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium"
        >
            {pending ? (
                <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Initializing Sector...
                </>
            ) : (
                <>
                    Launch Interface
                    <ArrowRight className="ml-2 h-4 w-4 opacity-50" />
                </>
            )}
        </Button>
    );
}

export function CreateOrganizationForm() {
    // using hook for server action state
    const [state, formAction] = useActionState(createOrganizationAction, initialState);

    // Local state just for visual feedback logic if needed or just rely on server state
    // We can rely on server state.

    return (
        <div className="w-full max-w-md mx-auto p-1">
            <div className="bg-zinc-900/50 backdrop-blur-xl border border-zinc-800 rounded-2xl p-8 shadow-2xl relative overflow-hidden">

                {/* Decorative Background Elements */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>
                <div className="absolute bottom-0 left-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-3xl -ml-16 -mb-16 pointer-events-none"></div>

                <div className="relative z-10 space-y-6">
                    <div className="text-center space-y-2">
                        <div className="inline-flex items-center justify-center p-3 rounded-xl bg-zinc-900 border border-zinc-800 shadow-inner mb-2">
                            <Building2 className="w-6 h-6 text-indigo-400" />
                        </div>
                        <h2 className="text-xl font-bold text-white">Setup Command Center</h2>
                        <p className="text-sm text-zinc-400">
                            Establish a new organization to begin monitoring your assets.
                        </p>
                    </div>

                    <form action={formAction} className="space-y-4">
                        <div className="space-y-2">
                            <label htmlFor="name" className="text-xs font-medium text-zinc-500 uppercase tracking-wider ml-1">
                                Organization Name
                            </label>
                            <Input
                                id="name"
                                name="name"
                                placeholder="e.g. Wayne Enterprises"
                                required
                                className="bg-zinc-950/50 border-zinc-800 focus:ring-indigo-500/30 focus:border-indigo-500/50 text-white h-11"
                            />
                        </div>

                        {state?.message && !state.success && (
                            <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs">
                                ⚠️ {state.message}
                            </div>
                        )}

                        {state?.success && (
                            <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs">
                                ✅ {state.message} - Redirecting...
                            </div>
                        )}

                        <SubmitButton />
                    </form>
                </div>
            </div>
        </div>
    );
}
