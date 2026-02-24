"use client";

import React, { useState } from "react";
import {
    CheckCircle2,
    AlertCircle,
    Star,
    Phone,
    Wrench,
    ShieldCheck,
    TrendingDown,
    TrendingUp,
    Award,
} from "lucide-react";

// Mock Data
const ticket = {
    issue: "Burst Pipe",
    category: "Breakdown",
};

const niesvBaseline = 35000;
const landlordBudget = 50000;

const allVendors = [
    {
        id: "v1",
        name: "Elite Pipeworks",
        cost: 45000,
        rating: 4.8,
        contact: "0801 234 5678",
    },
    {
        id: "v2",
        name: "QuickFix Maintenance",
        cost: 55000,
        rating: 4.2,
        contact: "0802 345 6789",
    },
    {
        id: "v3",
        name: "Ade Plumbing Services",
        cost: 34000,
        rating: 4.5,
        contact: "0803 456 7890",
    },
    {
        id: "v4",
        name: "Lagos Pro Plumbers",
        cost: 60000,
        rating: 4.9,
        contact: "0804 567 8901",
    },
    {
        id: "v5",
        name: "Naija Handyman",
        cost: 25000,
        rating: 3.5,
        contact: "0805 678 9012",
    },
];

// Helper to format currency
const formatNaira = (amount: number) => {
    return new Intl.NumberFormat("en-NG", {
        style: "currency",
        currency: "NGN",
        minimumFractionDigits: 0,
    }).format(amount);
};

export default function VendorMatchmaker() {
    const [assignedVendorId, setAssignedVendorId] = useState<string | null>(null);

    // Recommendation Logic
    const withinBudgetVendors = allVendors.filter(
        (vendor) => vendor.cost <= landlordBudget
    );

    const recommendedVendor = withinBudgetVendors.reduce((prev, current) =>
        prev.rating > current.rating ? prev : current
    );

    const otherVendors = allVendors.filter((v) => v.id !== recommendedVendor.id);

    return (
        <div className="w-full mx-auto bg-[#0f172a] border border-slate-800 rounded-2xl p-6 shadow-2xl shadow-black/50 animate-in fade-in zoom-in-95 duration-500">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800/50 pb-6 mb-6">
                <div>
                    <h2 className="text-2xl font-bold flex items-center gap-2 text-white">
                        <Wrench className="w-6 h-6 text-slate-400" />
                        Vendor Matchmaker
                    </h2>
                    <p className="text-slate-400 mt-1">
                        Analyzing optimal vendors for:{" "}
                        <span className="font-semibold text-slate-200">
                            {ticket.issue} ({ticket.category})
                        </span>
                    </p>
                </div>

                <div className="flex gap-4">
                    <div className="bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-3">
                        <p className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-2">
                            <ShieldCheck className="w-3.5 h-3.5" /> NIESV Baseline
                        </p>
                        <p className="text-lg font-bold text-white">
                            {formatNaira(niesvBaseline)}
                        </p>
                    </div>
                    <div className="bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-3">
                        <p className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-2">
                            <Award className="w-3.5 h-3.5" /> Landlord Budget
                        </p>
                        <p className="text-lg font-bold text-white">
                            {formatNaira(landlordBudget)}
                        </p>
                    </div>
                </div>
            </div>

            {/* Recommended Vendor Section */}
            <div className="bg-emerald-950/30 border-2 border-emerald-500/50 rounded-xl p-5 relative overflow-hidden mb-8">
                <div className="absolute top-0 right-0 bg-emerald-500/20 text-emerald-400 border-l border-b border-emerald-500/30 px-4 py-1 rounded-bl-xl font-medium text-xs flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Recommended Vendor
                </div>

                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mt-2">
                    <div className="space-y-4 w-full md:w-auto">
                        <div>
                            <h3 className="text-white text-xl font-bold tracking-tight">
                                {recommendedVendor.name}
                            </h3>
                            <div className="flex items-center gap-4 mt-2 text-emerald-200/70 text-sm">
                                <span className="flex items-center gap-1">
                                    <Star className="w-4 h-4 fill-emerald-500 text-emerald-500" />
                                    {recommendedVendor.rating} Rating
                                </span>
                                <span className="flex items-center gap-1">
                                    <Phone className="w-4 h-4" />
                                    {recommendedVendor.contact}
                                </span>
                            </div>
                        </div>

                        <div className="flex items-end gap-3">
                            <div className="text-emerald-400 text-3xl font-black">
                                {formatNaira(recommendedVendor.cost)}
                            </div>
                            {recommendedVendor.cost < niesvBaseline && (
                                <span className="mb-1 text-xs font-semibold px-2 py-0.5 bg-emerald-900/40 text-emerald-300 border border-emerald-500/30 rounded-full flex items-center gap-1">
                                    <TrendingDown className="w-3 h-3" /> Below Baseline
                                </span>
                            )}
                        </div>
                    </div>

                    <button
                        onClick={() => setAssignedVendorId(recommendedVendor.id)}
                        disabled={assignedVendorId === recommendedVendor.id}
                        className={`px-6 py-2.5 rounded-lg font-semibold transition-all flex items-center justify-center gap-2 w-full md:w-auto ${assignedVendorId === recommendedVendor.id
                            ? "bg-emerald-600/50 text-emerald-100 cursor-default"
                            : "bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-900/50"
                            }`}
                    >
                        {assignedVendorId === recommendedVendor.id ? (
                            <>
                                <CheckCircle2 className="w-5 h-5" /> Assigned
                            </>
                        ) : (
                            "Assign Vendor"
                        )}
                    </button>
                </div>
            </div>

            {/* Alternative Vendors Section */}
            <div>
                <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4">
                    Alternative Bids <span className="font-normal text-slate-500">({otherVendors.length})</span>
                </h3>

                <div className="space-y-3">
                    {otherVendors.map((vendor) => {
                        const isOverBudget = vendor.cost > landlordBudget;

                        return (
                            <div
                                key={vendor.id}
                                className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-colors hover:bg-slate-800/80"
                            >
                                <div className="flex-1">
                                    <div className="flex items-center gap-3">
                                        <h4 className="text-slate-200 font-semibold">{vendor.name}</h4>
                                        {isOverBudget ? (
                                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-red-950/40 text-red-400 border border-red-900/30">
                                                <TrendingUp className="w-3 h-3" /> Over Budget
                                            </span>
                                        ) : (
                                            <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-slate-800 text-slate-400 border border-slate-700">
                                                Under Budget
                                            </span>
                                        )}
                                    </div>

                                    <div className="flex items-center gap-4 mt-1.5 text-xs text-slate-400">
                                        <span className="flex items-center gap-1">
                                            <Star className="w-3.5 h-3.5 fill-amber-500/50 text-amber-500" />
                                            {vendor.rating}
                                        </span>
                                        <span className="flex items-center gap-1">
                                            <Phone className="w-3.5 h-3.5" />
                                            {vendor.contact}
                                        </span>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between sm:justify-end gap-6 sm:w-1/3">
                                    <div className="text-right">
                                        <div
                                            className={`${isOverBudget ? "text-red-400 font-bold" : "text-white font-bold"
                                                }`}
                                        >
                                            {formatNaira(vendor.cost)}
                                        </div>
                                        {isOverBudget && (
                                            <div className="text-[10px] text-red-500/70 font-medium uppercase tracking-wider mt-0.5 flex items-center justify-end gap-1">
                                                <AlertCircle className="w-3 h-3" />
                                                +{formatNaira(vendor.cost - landlordBudget)}
                                            </div>
                                        )}
                                    </div>

                                    <button
                                        onClick={() => setAssignedVendorId(vendor.id)}
                                        className={`px-4 py-2 border rounded-lg text-sm transition-all ${assignedVendorId === vendor.id
                                            ? "bg-slate-800 text-slate-500 border-slate-700 cursor-default"
                                            : "bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-600"
                                            }`}
                                    >
                                        {assignedVendorId === vendor.id ? "Assigned" : "Assign"}
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
