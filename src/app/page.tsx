"use client";

import { useState } from "react";
import { Wrench, Play, X } from "lucide-react";

// ✅ Named exports from components
import { PortfolioPulse } from "../components/PortfolioPulse";
import { AssetStream } from "../components/AssetStream";
import { TenantList } from "../components/TenantList";
import { TenantRequest } from "../components/TenantRequest";
import { PolicyBuilder } from "../components/PolicyBuilder";
import { AddProperty } from "../components/AddProperty";
import { AddTenant } from "../components/AddTenant";
import { PolicyRow } from "../lib/nightWatchEngine";

export default function DashboardPage() {
  const [isMaintenanceOpen, setIsMaintenanceOpen] = useState(false);
  const [policies, setPolicies] = useState<PolicyRow[]>([
    { id: 1, scope: "global", metric: "lease_end", operator: "<", value: "30", recipient: "manager" }
  ]);
  const [maintenanceForm, setMaintenanceForm] = useState({
    title: "",
    description: "",
    priority: "medium",
    property: "",
  });

  const handleMaintenanceSubmit = () => {
    console.log("Maintenance Issue Reported:", maintenanceForm);
    // TODO: Submit to Supabase
    setIsMaintenanceOpen(false);
    setMaintenanceForm({ title: "", description: "", priority: "medium", property: "" });
  };

  return (
    <div className="flex-1 relative overflow-y-auto bg-[#0a0a0a] text-white min-h-screen">
      <div className="p-8 pb-20 gap-8 max-w-7xl mx-auto font-[family-name:var(--font-geist-sans)]">

        {/* ═══════════════════════════════════════════════════════════════════ */}
        {/* HEADER: "COMPLIANCE ENGINE V1.0" + "The Night Watch" */}
        {/* ═══════════════════════════════════════════════════════════════════ */}
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
            {/* Add Asset - Uses Sheet internally */}
            <AddProperty />

            {/* Add Tenant - Uses Sheet internally */}
            <AddTenant />

            {/* Report Issue (Wrench) */}
            <button
              onClick={() => setIsMaintenanceOpen(true)}
              className="flex items-center gap-2 px-4 py-2 bg-amber-600/20 hover:bg-amber-600/30 border border-amber-600/50 text-amber-400 rounded-lg text-sm font-medium transition-all duration-200"
            >
              <Wrench className="w-4 h-4" />
              Report Issue
            </button>

            {/* Run (Play) */}
            <button
              className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-500 rounded-lg text-sm font-medium transition-all duration-200 shadow-lg shadow-purple-600/25"
            >
              <Play className="w-4 h-4" />
              Run
            </button>
          </div>
        </header>

        {/* ═══════════════════════════════════════════════════════════════════ */}
        {/* ROW 1: PortfolioPulse (2/3) + SystemStatus (1/3) */}
        {/* ═══════════════════════════════════════════════════════════════════ */}
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

        {/* ═══════════════════════════════════════════════════════════════════ */}
        {/* ROW 2: Logic Builder (PolicyBuilder) */}
        {/* ═══════════════════════════════════════════════════════════════════ */}
        <div className="mb-6">
          <PolicyBuilder policies={policies} setPolicies={setPolicies} />
        </div>

        {/* ═══════════════════════════════════════════════════════════════════ */}
        {/* ROW 3: AssetStream (Full Width) */}
        {/* ═══════════════════════════════════════════════════════════════════ */}
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

        {/* ═══════════════════════════════════════════════════════════════════ */}
        {/* ROW 4: TenantList + TenantRequest */}
        {/* ═══════════════════════════════════════════════════════════════════ */}
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

      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/* INLINE MAINTENANCE MODAL */}
      {/* ═══════════════════════════════════════════════════════════════════ */}
      {isMaintenanceOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={() => setIsMaintenanceOpen(false)}
          />

          {/* Modal Content */}
          <div className="relative bg-[#111] border border-[#333] rounded-2xl p-6 w-full max-w-md mx-4 shadow-2xl shadow-purple-500/10">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-amber-500/20 rounded-lg">
                  <Wrench className="w-5 h-5 text-amber-400" />
                </div>
                <h2 className="text-xl font-semibold text-zinc-100">Report Issue</h2>
              </div>
              <button
                onClick={() => setIsMaintenanceOpen(false)}
                className="p-2 hover:bg-zinc-800 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-zinc-400" />
              </button>
            </div>

            {/* Form */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-zinc-400 mb-2">
                  Issue Title
                </label>
                <input
                  type="text"
                  value={maintenanceForm.title}
                  onChange={(e) => setMaintenanceForm({ ...maintenanceForm, title: e.target.value })}
                  placeholder="e.g., Broken HVAC Unit"
                  className="w-full px-4 py-3 bg-[#0a0a0a] border border-[#333] rounded-lg text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-400 mb-2">
                  Description
                </label>
                <textarea
                  value={maintenanceForm.description}
                  onChange={(e) => setMaintenanceForm({ ...maintenanceForm, description: e.target.value })}
                  placeholder="Describe the issue in detail..."
                  rows={4}
                  className="w-full px-4 py-3 bg-[#0a0a0a] border border-[#333] rounded-lg text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all resize-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-400 mb-2">
                  Priority
                </label>
                <select
                  value={maintenanceForm.priority}
                  onChange={(e) => setMaintenanceForm({ ...maintenanceForm, priority: e.target.value })}
                  className="w-full px-4 py-3 bg-[#0a0a0a] border border-[#333] rounded-lg text-zinc-100 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="critical">Critical</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-400 mb-2">
                  Property (Optional)
                </label>
                <input
                  type="text"
                  value={maintenanceForm.property}
                  onChange={(e) => setMaintenanceForm({ ...maintenanceForm, property: e.target.value })}
                  placeholder="e.g., 123 Main Street"
                  className="w-full px-4 py-3 bg-[#0a0a0a] border border-[#333] rounded-lg text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all"
                />
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setIsMaintenanceOpen(false)}
                className="flex-1 px-4 py-3 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 rounded-lg text-sm font-medium transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleMaintenanceSubmit}
                className="flex-1 px-4 py-3 bg-purple-600 hover:bg-purple-500 rounded-lg text-sm font-medium transition-all shadow-lg shadow-purple-600/25"
              >
                Submit Report
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}