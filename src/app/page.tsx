"use client";

import { useState } from "react";
import { Wrench, Play } from "lucide-react";

// ✅ Named exports
import { PortfolioPulse } from "../components/PortfolioPulse";
import { AssetStream } from "../components/AssetStream";
import { TenantList } from "../components/TenantList";
import { TenantRequest } from "../components/dashboard/TenantRequest";
import { PolicyBuilder } from "../components/PolicyBuilder";
import { AddProperty } from "../components/AddProperty";
import { AddTenant } from "../components/AddTenant";
import { PolicyRow } from "../lib/nightWatchEngine";
import { triggerNightWatchManually } from "./actions";

// ✅ IMPORT YOUR NEW MODAL
import ReportIssueModal from "../components/dashboard/ReportIssueModal";

export default function DashboardPage() {
  const [isMaintenanceOpen, setIsMaintenanceOpen] = useState(false);
  const [policies, setPolicies] = useState<PolicyRow[]>([
    { id: 1, scope: "global", metric: "lease_end", operator: "<", value: "30", recipient: "manager" }
  ]);

  return (
    <div className="flex-1 relative overflow-y-auto bg-[#0a0a0a] text-white min-h-screen">
      <div className="p-8 pb-20 gap-8 max-w-7xl mx-auto font-[family-name:var(--font-geist-sans)]">

        {/* HEADER */}
        <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
              <span className="text-purple-400">COMPLIANCE ENGINE</span>{" "}
              <span className="text-zinc-500 text-lg">V1.0</span>
            </h1>
            <p className="text-zinc-400 mt-1 text-sm sm:text-base">
              The Night Watch — Automated Property Compliance
            </p>
          </div>

          {/* ACTION BUTTONS */}
          <div className="flex flex-wrap gap-2">
            <AddProperty />
            <AddTenant />

            {/* Report Issue Button */}
            <button
              onClick={() => setIsMaintenanceOpen(true)}
              className="flex items-center gap-2 px-4 py-2 bg-amber-600/20 hover:bg-amber-600/30 border border-amber-600/50 text-amber-400 rounded-lg text-sm font-medium transition-all duration-200"
            >
              <Wrench className="w-4 h-4" />
              Report Issue
            </button>

            {/* Run Button */}
            <button
              onClick={async () => {
                const result = await triggerNightWatchManually();
                if (result.success) {
                  alert(`Night Watch Complete! ✅\nProcessed: ${result.processed} properties.`);
                } else {
                  alert(`Night Watch Failed ❌\nError: ${result.error}`);
                }
              }}
              className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-500 rounded-lg text-sm font-medium transition-all duration-200 shadow-lg shadow-purple-600/25"
            >
              <Play className="w-4 h-4" />
              Run
            </button>
          </div>
        </header>

        {/* ROW 1: Stats */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          <div className="lg:col-span-2">
            <PortfolioPulse />
          </div>
          <div className="bg-[#111] border border-[#222] rounded-xl p-6">
            <h3 className="text-lg font-semibold mb-4 text-zinc-100">System Status</h3>
            <div className="text-green-400 flex items-center gap-2 text-sm">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
              Operational
            </div>
            <p className="text-zinc-500 text-sm mt-4">All systems running normally.</p>
            <div className="mt-6 space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-zinc-400">Engine</span>
                <span className="text-green-400">Online</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-zinc-400">Database</span>
                <span className="text-green-400">Connected</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-zinc-400">Notifications</span>
                <span className="text-green-400">Active</span>
              </div>
            </div>
          </div>
        </div>

        {/* ROW 2: Logic Builder */}
        <div className="mb-6">
          <PolicyBuilder policies={policies} setPolicies={setPolicies} />
        </div>

        {/* ROW 3: Assets */}
        <div className="mb-6">
          <div className="bg-[#111] border border-[#222] rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-zinc-100">Live Assets</h3>
              <span className="px-2 py-1 bg-green-500/20 text-green-400 text-xs font-medium rounded-full border border-green-500/30">
                LIVE
              </span>
            </div>
            <AssetStream limit={5} />
          </div>
        </div>

        {/* ROW 4: Tenants + Requests */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-[#111] border border-[#222] rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-zinc-100">Tenants</h3>
              <span className="px-2 py-1 bg-purple-500/20 text-purple-400 text-xs font-medium rounded-full border border-purple-500/30">
                ACTIVE
              </span>
            </div>
            <TenantList limit={6} />
          </div>
          <div className="bg-[#111] border border-[#222] rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-zinc-100">Tenant Requests</h3>
              <span className="px-2 py-1 bg-purple-500/20 text-purple-400 text-xs font-medium rounded-full border border-purple-500/30">
                REQUESTS
              </span>
            </div>
            <TenantRequest />
          </div>
        </div>

      </div>

      {/* ✅ REPLACED THE 100 LINES OF HARDCODED FORM WITH THIS ONE COMPONENT 
        This will now load the "Orange Button" modal you built.
      */}
      <ReportIssueModal
        isOpen={isMaintenanceOpen}
        onClose={() => setIsMaintenanceOpen(false)}
        onSuccess={() => {
          // Optional: You can force a refresh here if needed
          console.log("Request submitted!");
        }}
      />

    </div>
  );
}