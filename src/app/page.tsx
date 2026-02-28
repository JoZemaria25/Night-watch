"use client";

import { useState } from "react";
import { Wrench, Play, Plus, X } from "lucide-react";

// ✅ Named exports
import { SystemStatus } from "../components/SystemStatus";
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

  // Widget State
  const [properties, setProperties] = useState([
    { id: 1, name: "", limit: 0 }
  ]);

  const handleLimitChange = (id: number, newValue: string) => {
    // Only allow numbers
    const numValue = parseInt(newValue.replace(/\D/g, ''), 10) || 0;
    setProperties(properties.map(p => p.id === id ? { ...p, limit: numValue } : p));
  };

  const handleNameChange = (id: number, newName: string) => {
    setProperties(properties.map(p => p.id === id ? { ...p, name: newName } : p));
  };

  const handleAddProperty = () => {
    const newId = properties.length > 0 ? Math.max(...properties.map(p => p.id)) + 1 : 1;
    setProperties([...properties, { id: newId, name: "", limit: 0 }]);
  };

  const handleRemoveProperty = (id: number) => {
    setProperties(properties.filter(p => p.id !== id));
  };

  const handleSaveLimit = () => {
    alert("Budget updated");
  };

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
              type="button" // Prevent form submission
              onClick={async () => {
                try {
                  const response = await fetch('/api/cron/night-watch', { method: 'POST' });
                  const data = await response.json();

                  if (response.ok && data.success) {
                    if (data.data?.errors && data.data.errors.length > 0) {
                      // Success with warnings/errors
                      alert(`Scan Complete, BUT the database rejected ticket creation:\n\n${data.data.errors.join("\n")}`);
                    } else {
                      // Pure Success
                      alert(`Night Watch Complete! ✅\nGenerated ${data.data?.violationCount || 0} tickets.`);
                    }
                    // REMOVED: window.location.reload(); 
                  } else {
                    alert(`Night Watch Failed ❌\nError: ${data.data?.error || data.error || 'Unknown Error'}`);
                  }
                } catch (err: any) {
                  alert(`Network Error ❌\n${err.message}`);
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

            {/* Portfolio Maintenance Limits Widget */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-lg shadow-black/40 h-full">
              <div className="mb-6">
                <h3 className="text-xl font-bold text-white">Portfolio Maintenance Limits</h3>
                <p className="text-sm text-slate-400 mt-1">Auto-approval financial thresholds for vendor matchmaking.</p>
              </div>

              <div className="max-h-64 overflow-y-auto pr-2 custom-scrollbar space-y-2">
                {properties.map((property) => (
                  <div key={property.id} className="flex items-center justify-between py-3 border-b border-slate-800/50 last:border-0 group">
                    <div className="flex-1 mr-4">
                      <input
                        type="text"
                        placeholder="Property Name"
                        value={property.name}
                        onChange={(e) => handleNameChange(property.id, e.target.value)}
                        className="w-full bg-transparent text-slate-300 font-medium outline-none border-b border-transparent focus:border-emerald-500/50 transition-colors py-1 px-2 rounded hover:bg-slate-800/30"
                      />
                    </div>

                    <div className="flex items-center gap-2">
                      <div className="flex items-center bg-slate-900/50 hover:bg-slate-800 border border-transparent hover:border-slate-700 transition-colors rounded-lg px-3 py-1.5 focus-within:border-emerald-500 focus-within:ring-1 focus-within:ring-emerald-500">
                        <span className="text-slate-500 mr-2">₦</span>
                        <input
                          type="text"
                          value={property.limit.toLocaleString()}
                          onChange={(e) => handleLimitChange(property.id, e.target.value)}
                          className="bg-transparent text-white font-bold text-lg outline-none w-28 text-right focus:ring-0"
                        />
                      </div>

                      <button
                        onClick={() => handleRemoveProperty(property.id)}
                        className="p-1.5 text-slate-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all rounded hover:bg-red-900/20"
                        title="Remove"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <button
                onClick={handleAddProperty}
                className="w-full mt-4 py-2 flex items-center justify-center gap-2 text-slate-400 hover:text-emerald-400 hover:bg-slate-800/50 border border-dashed border-slate-700 rounded-lg transition-colors text-sm font-medium"
              >
                <Plus className="h-4 w-4" /> Add Property
              </button>
              <button
                onClick={handleSaveLimit}
                className="w-full mt-4 bg-slate-800 hover:bg-emerald-600 text-white py-3 rounded-lg font-medium transition-all shadow-md"
              >
                Save Adjustments
              </button>
            </div>

          </div>
          <SystemStatus />
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

      {/* Report Issue Modal */}
      <ReportIssueModal
        isOpen={isMaintenanceOpen}
        onClose={() => setIsMaintenanceOpen(false)}
        onSuccess={() => console.log("Request submitted!")}
      />

    </div>
  );
}