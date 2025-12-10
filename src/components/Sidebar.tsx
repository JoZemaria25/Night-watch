"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Building2, Users, Settings, LogOut, ShieldCheck } from "lucide-react";
import { createBrowserClient } from "@supabase/ssr";
import { useRouter } from "next/navigation";

export function Sidebar() {
    const pathname = usePathname();
    const router = useRouter();
    const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    // Hide sidebar on login page
    if (pathname === "/login") return null;

    const handleLogout = async () => {
        await supabase.auth.signOut();
        router.refresh();
        router.push("/login");
    };

    const links = [
        { name: "Dashboard", href: "/", icon: LayoutDashboard },
        { name: "Properties", href: "/properties", icon: Building2 },
        { name: "Tenants", href: "/tenants", icon: Users },
        { name: "Settings", href: "/settings", icon: Settings },
    ];

    return (
        <div className="w-64 h-screen bg-zinc-950 border-r border-zinc-800 flex flex-col shrink-0">
            {/* Logo Area */}
            <div className="p-6 border-b border-zinc-900">
                <div className="flex items-center gap-2 text-indigo-500 mb-1">
                    <ShieldCheck className="h-5 w-5" />
                </div>
                <h1 className="text-xl font-bold tracking-tighter text-white">
                    The Night Watch
                </h1>
                <p className="text-xs text-zinc-500">Command Deck</p>
            </div>

            {/* Navigation */}
            <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
                {links.map((link) => {
                    const Icon = link.icon;
                    const isActive = pathname === link.href;

                    return (
                        <Link
                            key={link.href}
                            href={link.href}
                            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${isActive
                                    ? "bg-zinc-900 text-white shadow-inner border border-zinc-800"
                                    : "text-zinc-500 hover:text-zinc-300 hover:bg-zinc-900/50"
                                }`}
                        >
                            <Icon className={`w-4 h-4 ${isActive ? "text-indigo-400" : "text-zinc-600"}`} />
                            {link.name}
                        </Link>
                    );
                })}
            </nav>

            {/* Action Area */}
            <div className="p-4 border-t border-zinc-900">
                <button
                    onClick={handleLogout}
                    className="flex items-center gap-3 w-full px-3 py-2.5 text-sm font-medium text-red-400 hover:bg-red-950/20 hover:text-red-300 rounded-lg transition-colors"
                >
                    <LogOut className="w-4 h-4" />
                    Disconnect
                </button>
            </div>
        </div>
    );
}
