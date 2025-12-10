"use client";

import { AssetStream } from "@/components/AssetStream";
import { AddProperty } from "@/components/AddProperty";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function PropertiesPage() {
    return (
        // Changed <main> to <div> and removed bg-color (handled by layout)
        <div className="max-w-6xl mx-auto space-y-8">

            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="space-y-1">
                    <Link href="/" className="flex items-center gap-2 text-zinc-500 hover:text-white transition-colors mb-4 text-sm">
                        <ArrowLeft className="w-4 h-4" />
                        Back to Dashboard
                    </Link>
                    <h1 className="text-3xl font-bold text-white tracking-tight">All Assets</h1>
                    <p className="text-zinc-400">Manage your complete property portfolio.</p>
                </div>
                <AddProperty />
            </div>

            {/* Full List (No limit prop = Unlimited) */}
            <AssetStream />
        </div>
    );
}
