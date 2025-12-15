"use client";

import React, { useState } from "react";
import { Menu, X, ShieldCheck } from "lucide-react";
import { Sidebar } from "@/components/Sidebar";
import { Button } from "@/components/ui/button";
import { usePathname } from "next/navigation";

export function GlobalNav() {
    const [isOpen, setIsOpen] = useState(false);
    const pathname = usePathname();

    // Hide on login page
    if (pathname === "/login") return null;

    return (
        <>
            {/* Sticky Top Bar */}
            <header className="sticky top-0 z-40 w-full border-b border-zinc-800 bg-zinc-950/80 backdrop-blur-md">
                <div className="flex h-16 items-center px-4 md:px-6">
                    <Button
                        variant="ghost"
                        size="icon"
                        className="mr-4 text-zinc-400 hover:text-white hover:bg-zinc-800"
                        onClick={() => setIsOpen(true)}
                    >
                        <Menu className="h-6 w-6" />
                        <span className="sr-only">Toggle Menu</span>
                    </Button>

                    <div className="flex items-center gap-2">
                        <ShieldCheck className="h-6 w-6 text-indigo-500" />
                        <span className="text-lg font-bold tracking-tight text-white">
                            The Night Watch
                        </span>
                    </div>
                </div>
            </header>

            {/* The Drawer (Overlay) */}
            {isOpen && (
                <div className="fixed inset-0 z-50 flex">
                    {/* Backdrop */}
                    <div
                        className="fixed inset-0 bg-black/80 backdrop-blur-sm transition-opacity"
                        onClick={() => setIsOpen(false)}
                    />

                    {/* Sidebar Container */}
                    <div className="relative flex w-full max-w-xs flex-1 flex-col bg-zinc-950 border-r border-zinc-800 pt-5 pb-4 shadow-2xl transition-transform duration-300 ease-in-out">

                        {/* Close Button */}
                        <div className="absolute top-0 right-0 -mr-12 pt-2">
                            <Button
                                variant="ghost"
                                size="icon"
                                className="ml-1 flex h-10 w-10 items-center justify-center rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white text-white"
                                onClick={() => setIsOpen(false)}
                            >
                                <X className="h-6 w-6" />
                                <span className="sr-only">Close sidebar</span>
                            </Button>
                        </div>

                        {/* Reuse Existing Sidebar Logic */}
                        {/* We wrap it in a div to override some specific sidebar styles if needed, 
                            but Sidebar.tsx is self-contained. 
                            NOTE: Sidebar.tsx has its own logo header which might be redundant inside the drawer 
                            if we already have the top bar, but for now we keep it for consistency.
                        */}
                        <div className="flex-1 h-full overflow-y-auto">
                            {/* 
                                We need to make sure the Sidebar component fits well here. 
                                The existing Sidebar has w-64 and h-screen. 
                                We might need to adjust it to be w-full h-full if it's inside a container.
                                However, for this task, we will just render it. 
                                Ideally, we should pass a prop to Sidebar to make it flexible, 
                                but let's see how it looks first.
                             */}
                            <Sidebar />
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
