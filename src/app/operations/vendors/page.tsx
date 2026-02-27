import React from 'react';
import {
    ShieldCheck,
    Clock,
    AlertTriangle,
    MoreHorizontal,
    Edit,
    Ban
} from 'lucide-react';

interface Vendor {
    id: string;
    name: string;
    primary_category: string;
    verification_status: 'Pending' | 'Verified' | 'Suspended';
    tax_id: string;
    insurance_provider: string;
    insurance_policy_number: string;
    insurance_expiration: string;
    bank_name: string;
    bank_account_number: string;
    rating: number;
}

const mockVendors: Vendor[] = [
    {
        id: 'v1',
        name: 'Apex Security Solutions',
        primary_category: 'Security Guards',
        verification_status: 'Verified',
        tax_id: 'XX-XXXXX12',
        insurance_provider: 'Guardian Shield Insurance',
        insurance_policy_number: 'POL-998234-A',
        insurance_expiration: '2027-01-15T00:00:00Z',
        bank_name: 'Chase Corporate',
        bank_account_number: '1234567890',
        rating: 4.8,
    },
    {
        id: 'v2',
        name: 'Night Owl Surveillance',
        primary_category: 'CCTV Monitoring',
        verification_status: 'Pending',
        tax_id: 'XX-XXXXX34',
        insurance_provider: 'TechSure Policies',
        insurance_policy_number: 'POL-112345-B',
        insurance_expiration: '2026-06-10T00:00:00Z',
        bank_name: 'Wells Fargo',
        bank_account_number: '0987654321',
        rating: 4.2,
    },
    {
        id: 'v3',
        name: 'Rapid Response Patrol',
        primary_category: 'Mobile Patrol',
        verification_status: 'Suspended',
        tax_id: 'XX-XXXXX56',
        insurance_provider: 'National Risk Mgt',
        insurance_policy_number: 'POL-445566-C',
        insurance_expiration: '2026-03-05T00:00:00Z', // Expiring/expired soon
        bank_name: 'Bank of America',
        bank_account_number: '1122334455',
        rating: 3.5,
    },
    {
        id: 'v4',
        name: 'Elite Perimeter Defense',
        primary_category: 'Access Control',
        verification_status: 'Verified',
        tax_id: 'XX-XXXXX78',
        insurance_provider: 'SecureCo Coverage',
        insurance_policy_number: 'POL-778899-D',
        insurance_expiration: '2026-11-20T00:00:00Z',
        bank_name: 'Citibank',
        bank_account_number: '5544332211',
        rating: 4.9,
    }
];

export default function VendorControlRoom() {
    const today = new Date();

    const isExpiringSoon = (dateString: string) => {
        const expiryDate = new Date(dateString);
        const diffTime = expiryDate.getTime() - today.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays <= 30; // Flags any vendor expiring within 30 days (or already expired)
    };

    const totalActive = mockVendors.filter(v => v.verification_status === 'Verified').length;
    const pendingVerification = mockVendors.filter(v => v.verification_status === 'Pending').length;
    const expiringSoonCount = mockVendors.filter(v => isExpiringSoon(v.insurance_expiration)).length;

    const maskAccount = (accountNumber: string) => {
        return `•••• ${accountNumber.slice(-4)}`;
    };

    const renderBadge = (status: Vendor['verification_status']) => {
        switch (status) {
            case 'Verified':
                return (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-900/30 text-emerald-400 border border-emerald-800/50">
                        {status}
                    </span>
                );
            case 'Pending':
                return (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-900/30 text-amber-400 border border-amber-800/50">
                        {status}
                    </span>
                );
            case 'Suspended':
                return (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-900/30 text-red-400 border border-red-800/50">
                        {status}
                    </span>
                );
        }
    };

    return (
        <div className="bg-[#0f172a] min-h-screen p-8 text-slate-200">
            <div className="max-w-7xl mx-auto space-y-8">

                {/* Top Bar */}
                <div className="flex justify-between items-center">
                    <h1 className="text-3xl font-bold tracking-tight text-white">Vendor Control Room</h1>
                    <button className="bg-emerald-600 hover:bg-emerald-500 text-white px-5 py-2.5 rounded-lg text-sm font-semibold transition-colors shadow-lg shadow-emerald-600/20">
                        + Onboard Vendor
                    </button>
                </div>

                {/* Status Metrics */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Active Vendors */}
                    <div className="bg-slate-900 border border-slate-800 rounded-xl shadow-lg shadow-black/40 p-6 flex items-center space-x-4">
                        <div className="bg-emerald-900/40 p-3 rounded-lg border border-emerald-800/50 text-emerald-400">
                            <ShieldCheck className="h-6 w-6" />
                        </div>
                        <div>
                            <p className="text-slate-400 text-sm font-medium">Active Vendors</p>
                            <h2 className="text-3xl font-bold text-white">{totalActive}</h2>
                        </div>
                    </div>

                    {/* Pending Verification */}
                    <div className="bg-slate-900 border border-slate-800 rounded-xl shadow-lg shadow-black/40 p-6 flex items-center space-x-4">
                        <div className="bg-amber-900/40 p-3 rounded-lg border border-amber-800/50 text-amber-400">
                            <Clock className="h-6 w-6" />
                        </div>
                        <div>
                            <p className="text-slate-400 text-sm font-medium">Pending Verification</p>
                            <h2 className="text-3xl font-bold text-white">{pendingVerification}</h2>
                        </div>
                    </div>

                    {/* Insurance Expiring Soon */}
                    <div className="bg-slate-900 border border-slate-800 rounded-xl shadow-lg shadow-black/40 p-6 flex items-center space-x-4">
                        <div className="bg-red-900/40 p-3 rounded-lg border border-red-800/50 text-red-400">
                            <AlertTriangle className="h-6 w-6" />
                        </div>
                        <div>
                            <p className="text-slate-400 text-sm font-medium">Insurance Expiring Soon</p>
                            <h2 className="text-3xl font-bold text-white">{expiringSoonCount}</h2>
                        </div>
                    </div>
                </div>

                {/* Main Data Table */}
                <div className="bg-slate-900 border border-slate-800 rounded-xl shadow-lg shadow-black/40 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr>
                                    <th className="px-6 py-4 text-xs font-semibold text-slate-400 uppercase tracking-wider border-b border-slate-800 pb-3">Vendor</th>
                                    <th className="px-6 py-4 text-xs font-semibold text-slate-400 uppercase tracking-wider border-b border-slate-800 pb-3">Status</th>
                                    <th className="px-6 py-4 text-xs font-semibold text-slate-400 uppercase tracking-wider border-b border-slate-800 pb-3">Compliance</th>
                                    <th className="px-6 py-4 text-xs font-semibold text-slate-400 uppercase tracking-wider border-b border-slate-800 pb-3">Insurance Expiry</th>
                                    <th className="px-6 py-4 text-xs font-semibold text-slate-400 uppercase tracking-wider border-b border-slate-800 pb-3">Financials</th>
                                    <th className="px-6 py-4 text-xs font-semibold text-slate-400 uppercase tracking-wider border-b border-slate-800 pb-3 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-800/50">
                                {mockVendors.map((vendor) => {
                                    const hasExpiringIssue = isExpiringSoon(vendor.insurance_expiration);
                                    const formattedDate = new Date(vendor.insurance_expiration).toLocaleDateString('en-US', {
                                        year: 'numeric',
                                        month: 'short',
                                        day: 'numeric'
                                    });

                                    return (
                                        <tr key={vendor.id} className="hover:bg-slate-800/30 transition-colors">
                                            {/* Column 1: Vendor */}
                                            <td className="px-6 py-4">
                                                <div className="font-bold text-slate-200">{vendor.name}</div>
                                                <div className="text-sm text-slate-400 mt-1">{vendor.primary_category}</div>
                                                <div className="text-xs text-slate-500 mt-0.5">Rating: <span className="text-slate-300 font-medium">{vendor.rating}</span>/5.0</div>
                                            </td>

                                            {/* Column 2: Status */}
                                            <td className="px-6 py-4">
                                                {renderBadge(vendor.verification_status)}
                                            </td>

                                            {/* Column 3: Compliance */}
                                            <td className="px-6 py-4">
                                                <div className="text-sm text-slate-300">{vendor.insurance_provider}</div>
                                                <div className="text-xs text-slate-500 mt-1 border border-slate-700 w-fit px-1.5 py-0.5 rounded">Tax ID: {vendor.tax_id}</div>
                                            </td>

                                            {/* Column 4: Insurance Expiry */}
                                            <td className="px-6 py-4">
                                                <div className={`text-sm font-medium flex items-center gap-1.5 ${hasExpiringIssue ? 'text-red-400' : 'text-slate-300'}`}>
                                                    {hasExpiringIssue && <AlertTriangle className="h-3.5 w-3.5" />}
                                                    {formattedDate}
                                                </div>
                                                <div className="text-xs text-slate-500 mt-1 truncate max-w-[120px]" title={vendor.insurance_policy_number}>
                                                    {vendor.insurance_policy_number}
                                                </div>
                                            </td>

                                            {/* Column 5: Financials */}
                                            <td className="px-6 py-4">
                                                <div className="text-sm text-slate-300">{vendor.bank_name}</div>
                                                <div className="text-xs font-mono text-slate-500 mt-1">{maskAccount(vendor.bank_account_number)}</div>
                                            </td>

                                            {/* Column 6: Actions */}
                                            <td className="px-6 py-4">
                                                <div className="flex items-center justify-end space-x-2">
                                                    <button className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors" title="Edit">
                                                        <Edit className="h-4 w-4" />
                                                    </button>
                                                    <button className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-900/30 rounded-lg transition-colors" title="Suspend">
                                                        <Ban className="h-4 w-4" />
                                                    </button>
                                                    <button className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors" title="More">
                                                        <MoreHorizontal className="h-4 w-4" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>

            </div>
        </div>
    );
}
