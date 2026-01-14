"use client";

import { ActivityFeed } from "@/components/ActivityFeed";
import { PortfolioPulse } from "@/components/PortfolioPulse";

// ✅ RELATIVE PATHS (Bulletproof)
// We go "up" one level from "app" to "src", then down to "components"

export default function DashboardPage() {
  return (
    <div className="flex-1 relative overflow-y-auto bg-[#0a0a0a] text-white h-screen">
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

        {/* DASHBOARD CONTENT (Grid) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* MAIN CHART AREA */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-[#111] border border-[#222] rounded-xl p-6 min-h-[300px] flex items-center justify-center">
              {/* PortfolioPulse should now import correctly */}
              <PortfolioPulse />
            </div>

            <div className="bg-[#111] border border-[#222] rounded-xl p-6">
              <h3 className="text-lg font-semibold mb-4">Recent Activity</h3>
              <ActivityFeed />
            </div>
          </div>

          {/* SIDEBAR WIDGETS */}
          <div className="space-y-6">
            <div className="bg-[#111] border border-[#222] rounded-xl p-6">
              <h3 className="text-lg font-semibold mb-4">System Status</h3>
              <div className="text-green-400 flex items-center gap-2">
                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                Operational
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}