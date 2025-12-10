"use client";
import { createBrowserClient } from "@supabase/ssr";
import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";

export function LogoutButton() {
    const router = useRouter();
    const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    const handleLogout = async () => {
        await supabase.auth.signOut();
        router.refresh();
        router.push("/login");
    };

    return (
        <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-red-400 bg-red-950/10 border border-red-900/20 rounded-md hover:bg-red-950/30 transition-colors"
        >
            <LogOut className="w-3 h-3" />
            Disconnect
        </button>
    );
}
