"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createBrowserClient } from "@supabase/ssr";
import { Loader2, ShieldCheck, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function LoginPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [isSignUp, setIsSignUp] = useState(false); // Toggle between Login/Signup
    const [error, setError] = useState<string | null>(null);
    const [message, setMessage] = useState<string | null>(null);

    // Form Data
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    const handleAuth = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setMessage(null);

        if (isSignUp) {
            // --- SIGN UP LOGIC ---
            const { error } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    emailRedirectTo: `${location.origin}/auth/callback`,
                },
            });

            if (error) {
                setError(error.message);
            } else {
                setMessage("Account created! Check your email to verify.");
            }
        } else {
            // --- SIGN IN LOGIC ---
            const { error } = await supabase.auth.signInWithPassword({
                email,
                password,
            });

            if (error) {
                setError(error.message);
            } else {
                router.refresh();
                router.push("/"); // Enter the fortress
            }
        }
        setLoading(false);
    };

    return (
        <div className="min-h-screen w-full flex items-center justify-center bg-zinc-950 relative overflow-hidden">

            {/* 1. Cinematic Background Effects */}
            <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] bg-indigo-500/20 rounded-full blur-[128px] opacity-40 pointer-events-none" />
            <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] bg-emerald-500/10 rounded-full blur-[128px] opacity-40 pointer-events-none" />
            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none"></div>

            {/* 2. The Glass Card */}
            <div className="w-full max-w-md p-8 relative z-10">
                <div className="absolute inset-0 bg-zinc-900/40 backdrop-blur-xl border border-white/5 rounded-3xl shadow-2xl"></div>

                <div className="relative z-20 space-y-6 p-2">

                    {/* Header */}
                    <div className="text-center space-y-2">
                        <div className="inline-flex items-center justify-center p-3 rounded-2xl bg-zinc-900 border border-zinc-800 shadow-inner mb-4">
                            <ShieldCheck className="w-8 h-8 text-emerald-500" />
                        </div>
                        <h1 className="text-2xl font-bold tracking-tight text-white">
                            {isSignUp ? "Initialize Access" : "The Night Watch"}
                        </h1>
                        <p className="text-sm text-zinc-400">
                            {isSignUp ? "Create your secure identity." : "Enter credentials to access command deck."}
                        </p>
                    </div>

                    {/* Alert Messages */}
                    {error && (
                        <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs text-center">
                            {error}
                        </div>
                    )}
                    {message && (
                        <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs text-center">
                            {message}
                        </div>
                    )}

                    {/* The Form */}
                    <form onSubmit={handleAuth} className="space-y-4">
                        <div className="space-y-2">
                            <Input
                                type="email"
                                placeholder="Manager ID (Email)"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="bg-zinc-950/50 border-zinc-800 text-white placeholder:text-zinc-600 focus:ring-emerald-500/20 focus:border-emerald-500/50 h-11"
                                required
                            />
                            <Input
                                type="password"
                                placeholder="Passcode"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="bg-zinc-950/50 border-zinc-800 text-white placeholder:text-zinc-600 focus:ring-emerald-500/20 focus:border-emerald-500/50 h-11"
                                required
                            />
                        </div>

                        <Button
                            type="submit"
                            disabled={loading}
                            className="w-full h-11 bg-white text-black hover:bg-zinc-200 font-medium transition-all"
                        >
                            {loading ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                                <span className="flex items-center">
                                    {isSignUp ? "Register Account" : "Access System"}
                                    <ArrowRight className="ml-2 w-4 h-4 opacity-50" />
                                </span>
                            )}
                        </Button>
                    </form>

                    {/* The Toggle Switch */}
                    <div className="text-center pt-2">
                        <button
                            onClick={() => setIsSignUp(!isSignUp)}
                            className="text-xs text-zinc-500 hover:text-white transition-colors"
                        >
                            {isSignUp ? "Already have access? Log In" : "New to the watch? Create Account"}
                        </button>
                    </div>

                </div>
            </div>
        </div>
    );
}