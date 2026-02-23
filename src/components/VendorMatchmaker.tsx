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
        <div className="w-full max-w-4xl mx-auto p-4 sm:p-6 space-y-8 animate-in fade-in zoom-in-95 duration-500 bg-slate-900 border border-slate-800 rounded-2xl text-slate-100 shadow-xl">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-6">
                <div>
                    <h2 className="text-2xl font-bold flex items-center gap-2 text-slate-100">
                        <Wrench className="w-6 h-6 text-blue-500" />
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
                    <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-3 text-sm">
                        <p className="text-blue-400 font-medium mb-1 flex items-center gap-1">
                            <ShieldCheck className="w-4 h-4" /> NIESV Baseline
                        </p>
                        <p className="text-xl font-bold text-slate-200">
                            {formatNaira(niesvBaseline)}
                        </p>
                    </div>
                    <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-3 text-sm">
                        <p className="text-purple-400 font-medium mb-1 flex items-center gap-1">
                            <Award className="w-4 h-4" /> Landlord Budget
                        </p>
                        <p className="text-xl font-bold text-slate-200">
                            {formatNaira(landlordBudget)}
                        </p>
                    </div>
                </div>
            </div>

            {/* Recommended Vendor Section */}
            <div className="relative bg-emerald-900/20 border-2 border-emerald-500/50 rounded-2xl p-6 shadow-sm overflow-hidden">
                <div className="absolute top-0 right-0 bg-emerald-500/20 text-emerald-400 border-l border-b border-emerald-500/30 px-4 py-1 rounded-bl-xl font-medium text-sm flex items-center gap-1 shadow-sm">
                    <CheckCircle2 className="w-4 h-4" /> Recommended Vendor
                </div>

                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mt-2">
                    <div className="space-y-4">
                        <div>
                            <h3 className="text-2xl font-extrabold text-emerald-50">
                                {recommendedVendor.name}
                            </h3>
                            <div className="flex items-center gap-4 mt-2 text-emerald-200/80 text-sm font-medium">
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
                            <div className="text-3xl font-black text-emerald-400 tracking-tight">
                                {formatNaira(recommendedVendor.cost)}
                            </div>
                            {recommendedVendor.cost < niesvBaseline && (
                                <span className="mb-1 text-xs font-semibold px-2 py-1 bg-emerald-900/50 text-emerald-300 border border-emerald-500/30 rounded-full flex items-center gap-1">
                                    <TrendingDown className="w-3 h-3" /> Below Baseline
                                </span>
                            )}
                        </div>
                    </div>

                    <button
                        onClick={() => setAssignedVendorId(recommendedVendor.id)}
                        disabled={assignedVendorId === recommendedVendor.id}
                        className={`px-8 py-3 rounded-xl font-bold text-lg shadow-sm transition-all flex items-center gap-2 ${assignedVendorId === recommendedVendor.id
                            ? "bg-emerald-600/50 text-emerald-100 cursor-default border border-emerald-500/50"
                            : "bg-emerald-600 hover:bg-emerald-500 hover:shadow-lg hover:shadow-emerald-900/50 text-white hover:-translate-y-0.5 border border-emerald-500/50"
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
            <div className="space-y-4 pt-4 border-t border-slate-800">
                <h3 className="text-lg font-bold text-slate-200 flex items-center gap-2">
                    Alternative Bids <span className="text-slate-500 font-normal text-sm">({otherVendors.length})</span>
                </h3>

                <div className="grid gap-3">
                    {otherVendors.map((vendor) => {
                        const isOverBudget = vendor.cost > landlordBudget;

                        return (
                            <div
                                key={vendor.id}
                                className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-slate-800/50 border border-slate-700/50 rounded-xl hover:bg-slate-800 hover:border-slate-700 transition-colors gap-4"
                            >
                                <div className="flex-1">
                                    <div className="flex items-center gap-2">
                                        <h4 className="font-semibold text-slate-200">{vendor.name}</h4>
                                        {isOverBudget ? (
                                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-red-900/30 text-red-400 border border-red-900/50">
                                                <TrendingUp className="w-3 h-3" /> Over Budget
                                            </span>
                                        ) : (
                                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-slate-700/50 text-slate-400 border border-slate-700">
                                                Under Budget
                                            </span>
                                        )}
                                    </div>

                                    <div className="flex items-center gap-3 mt-1.5 text-sm text-slate-400">
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
                                            className={`font-bold text-lg ${isOverBudget ? "text-red-400" : "text-slate-300"
                                                }`}
                                        >
                                            {formatNaira(vendor.cost)}
                                        </div>
                                        {isOverBudget && (
                                            <div className="text-xs text-red-500/80 font-medium flex items-center justify-end gap-1">
                                                <AlertCircle className="w-3 h-3" />
                                                {formatNaira(vendor.cost - landlordBudget)} over
                                            </div>
                                        )}
                                    </div>

                                    <button
                                        onClick={() => setAssignedVendorId(vendor.id)}
                                        className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors border ${assignedVendorId === vendor.id
                                            ? "bg-slate-700 text-white border-slate-600"
                                            : "bg-slate-900/50 text-slate-300 border-slate-700 hover:bg-slate-800 hover:text-white hover:border-slate-600"
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
