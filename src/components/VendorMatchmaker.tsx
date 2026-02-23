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
        <div className="w-full max-w-4xl mx-auto p-4 sm:p-6 space-y-8 animate-in fade-in zoom-in-95 duration-500">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b pb-6">
                <div>
                    <h2 className="text-2xl font-bold flex items-center gap-2 text-gray-900">
                        <Wrench className="w-6 h-6 text-blue-600" />
                        Vendor Matchmaker
                    </h2>
                    <p className="text-gray-500 mt-1">
                        Analyzing optimal vendors for:{" "}
                        <span className="font-semibold text-gray-800">
                            {ticket.issue} ({ticket.category})
                        </span>
                    </p>
                </div>

                <div className="flex gap-4">
                    <div className="bg-blue-50 border border-blue-100 rounded-lg p-3 text-sm">
                        <p className="text-blue-600 font-medium mb-1 flex items-center gap-1">
                            <ShieldCheck className="w-4 h-4" /> NIESV Baseline
                        </p>
                        <p className="text-xl font-bold text-blue-900">
                            {formatNaira(niesvBaseline)}
                        </p>
                    </div>
                    <div className="bg-purple-50 border border-purple-100 rounded-lg p-3 text-sm">
                        <p className="text-purple-600 font-medium mb-1 flex items-center gap-1">
                            <Award className="w-4 h-4" /> Landlord Budget
                        </p>
                        <p className="text-xl font-bold text-purple-900">
                            {formatNaira(landlordBudget)}
                        </p>
                    </div>
                </div>
            </div>

            {/* Recommended Vendor Section */}
            <div className="relative bg-gradient-to-br from-green-50 to-emerald-100/50 border-2 border-green-500 rounded-2xl p-6 shadow-sm overflow-hidden">
                <div className="absolute top-0 right-0 bg-green-500 text-white px-4 py-1 rounded-bl-xl font-medium text-sm flex items-center gap-1 shadow-sm">
                    <CheckCircle2 className="w-4 h-4" /> Recommended Vendor
                </div>

                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mt-2">
                    <div className="space-y-4">
                        <div>
                            <h3 className="text-2xl font-extrabold text-green-950">
                                {recommendedVendor.name}
                            </h3>
                            <div className="flex items-center gap-4 mt-2 text-green-800/80 text-sm font-medium">
                                <span className="flex items-center gap-1">
                                    <Star className="w-4 h-4 fill-green-600 text-green-600" />
                                    {recommendedVendor.rating} Rating
                                </span>
                                <span className="flex items-center gap-1">
                                    <Phone className="w-4 h-4" />
                                    {recommendedVendor.contact}
                                </span>
                            </div>
                        </div>

                        <div className="flex items-end gap-3">
                            <div className="text-3xl font-black text-green-700 tracking-tight">
                                {formatNaira(recommendedVendor.cost)}
                            </div>
                            {recommendedVendor.cost < niesvBaseline && (
                                <span className="mb-1 text-xs font-semibold px-2 py-1 bg-green-200 text-green-800 rounded-full flex items-center gap-1">
                                    <TrendingDown className="w-3 h-3" /> Below Baseline
                                </span>
                            )}
                        </div>
                    </div>

                    <button
                        onClick={() => setAssignedVendorId(recommendedVendor.id)}
                        disabled={assignedVendorId === recommendedVendor.id}
                        className={`px-8 py-3 rounded-xl font-bold text-lg shadow-sm transition-all flex items-center gap-2 ${assignedVendorId === recommendedVendor.id
                                ? "bg-green-600 text-white shadow-green-600/20 cursor-default"
                                : "bg-green-600 hover:bg-green-700 hover:shadow-lg hover:shadow-green-600/30 text-white hover:-translate-y-0.5"
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
            <div className="space-y-4 pt-4">
                <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                    Alternative Bids <span className="text-gray-400 font-normal text-sm">({otherVendors.length})</span>
                </h3>

                <div className="grid gap-3">
                    {otherVendors.map((vendor) => {
                        const isOverBudget = vendor.cost > landlordBudget;

                        return (
                            <div
                                key={vendor.id}
                                className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-white border border-slate-200 rounded-xl hover:shadow-sm transition-shadow gap-4"
                            >
                                <div className="flex-1">
                                    <div className="flex items-center gap-2">
                                        <h4 className="font-semibold text-gray-900">{vendor.name}</h4>
                                        {isOverBudget ? (
                                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-700">
                                                <TrendingUp className="w-3 h-3" /> Over Budget
                                            </span>
                                        ) : (
                                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-600">
                                                Under Budget
                                            </span>
                                        )}
                                    </div>

                                    <div className="flex items-center gap-3 mt-1.5 text-sm text-gray-500">
                                        <span className="flex items-center gap-1">
                                            <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
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
                                            className={`font-bold text-lg ${isOverBudget ? "text-red-600" : "text-gray-900"
                                                }`}
                                        >
                                            {formatNaira(vendor.cost)}
                                        </div>
                                        {isOverBudget && (
                                            <div className="text-xs text-red-500 font-medium flex items-center justify-end gap-1">
                                                <AlertCircle className="w-3 h-3" />
                                                {formatNaira(vendor.cost - landlordBudget)} over
                                            </div>
                                        )}
                                    </div>

                                    <button
                                        onClick={() => setAssignedVendorId(vendor.id)}
                                        className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${assignedVendorId === vendor.id
                                                ? "bg-slate-800 text-white"
                                                : "bg-slate-100 text-slate-700 hover:bg-slate-200"
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
