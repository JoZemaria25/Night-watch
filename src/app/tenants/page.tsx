"use client";

import { TenantList } from "@/components/TenantList";
import { AddTenant } from "@/components/AddTenant";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function TenantsPage() {
    return (
        // Changed <main> to <div>
        <div className="max-w-6xl mx-auto space-y-8">

            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="space-y-1">
                    <Link href="/" className="flex items-center gap-2 text-zinc-500 hover:text-white transition-colors mb-4 text-sm">
                        <ArrowLeft className="w-4 h-4" />
                        Back to Dashboard
                    </Link>
                    <h1 className="text-3xl font-bold text-white tracking-tight">Tenant Roster</h1>
                    <p className="text-zinc-400">Overview of all active lease agreements.</p>
                </div>
                <AddTenant />
            </div>

            {/* Full List (No limit prop = Unlimited) */}
            <TenantList />
        </div>
    );
}
