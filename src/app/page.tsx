"use client";

// ✅ VERIFIED IMPORTS - All use named exports (curly braces required)
// All files are in src/components/ (not in a dashboard subfolder)
import { ActivityFeed } from "../components/ActivityFeed";
import { PortfolioPulse } from "../components/PortfolioPulse";
import { AssetStream } from "../components/AssetStream";
import { TenantList } from "../components/TenantList";
import { MaintenanceList } from "../components/MaintenanceList";

export default function DashboardPage() {
  return (
    <div className="flex-1 relative overflow-y-auto bg-[#0a0a0a] text-white min-h-screen">
      <div className="p-8 pb-20 gap-8 max-w-7xl mx-auto font-[family-name:var(--font-geist-sans)]">

        {/* HEADER */}
        <header className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Command Deck</h1>
            <p className="text-gray-400 mt-1">
              Live overview of your organization.
            </p>
          </div>
        </header>

        {/* TOP ROW: PortfolioPulse (2/3) + System Status (1/3) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="lg:col-span-2">
            <PortfolioPulse />
          </div>
          <div className="bg-[#111] border border-[#222] rounded-xl p-6">
            <h3 className="text-lg font-semibold mb-4">System Status</h3>
            <div className="text-green-400 flex items-center gap-2">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
              Operational
            </div>
            <p className="text-zinc-500 text-sm mt-4">All systems running normally.</p>
          </div>
        </div>

        {/* MIDDLE ROW: AssetStream (Left) + ActivityFeed (Right) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="bg-[#111] border border-[#222] rounded-xl p-6">
            <AssetStream limit={5} />
          </div>
          <div>
            <ActivityFeed />
          </div>
        </div>

        {/* BOTTOM ROW: TenantList (Left) + MaintenanceList (Right) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-[#111] border border-[#222] rounded-xl p-6">
            <TenantList limit={6} />
          </div>
          <div className="bg-[#111] border border-[#222] rounded-xl p-6">
            <MaintenanceList />
          </div>
        </div>

      </div>
    </div>
  );
}