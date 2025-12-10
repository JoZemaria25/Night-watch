"use client";

import { AssetStream } from "@/components/AssetStream";
import { PolicyBuilder } from "@/components/PolicyBuilder";
import { ActivityFeed } from "@/components/ActivityFeed";
import { AddProperty } from "@/components/AddProperty"; // <--- THIS WAS MISSING
import { AddTenant } from "@/components/AddTenant";
import { TenantList } from "@/components/TenantList";
import { TenantRequest } from "@/components/TenantRequest";
import { MaintenanceList } from "@/components/MaintenanceList";
import { Button } from "@/components/ui/button";
import { Play, ShieldCheck } from "lucide-react";
import { runNightWatch } from "@/lib/nightWatchEngine";
import { useState } from "react";
import { PortfolioPulse } from "@/components/PortfolioPulse";

export default function Home() {
  const [running, setRunning] = useState(false);

  const handleRunEngine = async () => {
    setRunning(true);
    const result = await runNightWatch();
    setRunning(false);
    if (result.success) {
      alert(`Night Watch Complete!\n\n${result.logs.join("\n")}`);
      window.location.reload();
    }
  };

  return (
    <main className="min-h-screen relative">
      <div className="max-w-6xl mx-auto py-12 px-6 space-y-12">

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-indigo-400 mb-2">
              <ShieldCheck className="h-5 w-5" />
              <span className="text-xs font-bold tracking-widest uppercase">Compliance Engine v1.0</span>
            </div>
            <h1 className="text-4xl font-extrabold tracking-tight text-white">
              The Night Watch
            </h1>
            <p className="text-zinc-400 max-w-lg text-lg">
              Automated risk mitigation for your property portfolio.
            </p>
          </div>

          {/* Action Area */}
          <div className="flex items-center gap-3">
            {/* The Add Asset Button */}
            <AddProperty />

            {/* The Add Tenant Button */}
            <AddTenant />

            {/* The Report Issue Button */}
            <TenantRequest />

            {/* The Run Button */}
            <Button
              onClick={handleRunEngine}
              disabled={running}
              className="bg-zinc-800 hover:bg-zinc-700 text-white border border-zinc-700 h-10 px-4"
            >
              <Play className={`mr-2 h-4 w-4 ${running ? "animate-spin" : ""}`} />
              {running ? "Running..." : "Run Sequence"}
            </Button>
          </div>
        </div>

        {/* Portfolio Pulse */}
        <PortfolioPulse />

        {/* The Control Deck */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <PolicyBuilder />
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-white">Live Assets</h2>
              <a href="/properties" className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors">View All</a>
            </div>
            <AssetStream limit={5} />
            <div className="flex items-center justify-between mb-4 mt-8">
              <h2 className="text-xl font-semibold text-white">Tenants</h2>
              <a href="/tenants" className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors">View All</a>
            </div>
            <TenantList limit={5} />
          </div>

          <div className="lg:col-span-1">
            <div className="sticky top-10">
              <MaintenanceList />
              <ActivityFeed />
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

