"use client";

import { useState, useMemo } from "react";
import {
    Search,
    Plus,
    Shield,
    Briefcase,
    MoreVertical,
    Building2,
    WalletCards,
    Wrench,
    CheckCircle2,
    Clock,
    AlertCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

// --- Types ---
type UserRole = 'Super Admin' | 'Accountant' | 'Property Manager' | 'Maintenance';
type UserStatus = 'Active' | 'Suspended' | 'Invite Pending';

interface User {
    id: string;
    name: string;
    email: string;
    role: UserRole;
    status: UserStatus;
    last_active: string;
    impact_metric: string;
    avatar: string;
}

// --- Mock Narrative Data ---
const MOCK_USERS: User[] = [
    {
        id: "USR-001",
        name: "Eleanor Vance",
        email: "eleanor@nightwatch.hq",
        role: "Super Admin",
        status: "Active",
        last_active: "2 mins ago",
        impact_metric: "System Architecture & Global Command",
        avatar: "EV"
    },
    {
        id: "USR-002",
        name: "Marcus Thorne",
        email: "m.thorne@nightwatch.hq",
        role: "Super Admin",
        status: "Active",
        last_active: "1 hour ago",
        impact_metric: "Policy Enforcement & Security",
        avatar: "MT"
    },
    {
        id: "USR-003",
        name: "Sarah Jenkins",
        email: "sarah.j@nightwatch.finance",
        role: "Accountant",
        status: "Active",
        last_active: "4 hours ago",
        impact_metric: "Managing 3 Master Ledgers",
        avatar: "SJ"
    },
    {
        id: "USR-004",
        name: "David Chen",
        email: "d.chen@nightwatch.finance",
        role: "Accountant",
        status: "Invite Pending",
        last_active: "Never",
        impact_metric: "Assigned to Escrow Reconciliation",
        avatar: "DC"
    },
    {
        id: "USR-005",
        name: "Olivia Reynolds",
        email: "olivia.r@nightwatch.ops",
        role: "Property Manager",
        status: "Active",
        last_active: "Just now",
        impact_metric: "Overseeing 12 High-Yield Properties",
        avatar: "OR"
    },
    {
        id: "USR-006",
        name: "James Wilson",
        email: "j.wilson@nightwatch.ops",
        role: "Property Manager",
        status: "Active",
        last_active: "Yesterday",
        impact_metric: "Overseeing 8 Commercial Units",
        avatar: "JW"
    },
    {
        id: "USR-007",
        name: "Michael Chang",
        email: "m.chang@nightwatch.ops",
        role: "Property Manager",
        status: "Suspended",
        last_active: "2 weeks ago",
        impact_metric: "Portfolio Reassignment Pending",
        avatar: "MC"
    },
    {
        id: "USR-008",
        name: "Carlos Rodriguez",
        email: "carlos.r@nightwatch.field",
        role: "Maintenance",
        status: "Active",
        last_active: "15 mins ago",
        impact_metric: "Assigned to 4 Urgent Tickets",
        avatar: "CR"
    }
];

// --- Grouping Configuration ---
const ROLE_GROUPS: { role: UserRole; label: string; icon: React.ElementType; colorClass: string }[] = [
    {
        role: "Super Admin",
        label: "Command Level (Super Admins)",
        icon: Shield,
        colorClass: "text-indigo-400 bg-indigo-500/10 border-indigo-500/20"
    },
    {
        role: "Accountant",
        label: "Financial Operations (Accountants)",
        icon: WalletCards,
        colorClass: "text-amber-400 bg-amber-500/10 border-amber-500/20"
    },
    {
        role: "Property Manager",
        label: "Portfolio Management (Property Managers)",
        icon: Building2,
        colorClass: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20"
    },
    {
        role: "Maintenance",
        label: "Field Operations (Maintenance)",
        icon: Wrench,
        colorClass: "text-blue-400 bg-blue-500/10 border-blue-500/20"
    }
];

export default function IdentityAndAccessPage() {
    const [searchQuery, setSearchQuery] = useState("");
    const [users] = useState<User[]>(MOCK_USERS);

    // Filter users based on search
    const filteredUsers = useMemo(() => {
        if (!searchQuery.trim()) return users;
        const query = searchQuery.toLowerCase();
        return users.filter(
            u => u.name.toLowerCase().includes(query) || u.email.toLowerCase().includes(query)
        );
    }, [users, searchQuery]);

    // Helper for Status UI
    const getStatusUI = (status: UserStatus) => {
        switch (status) {
            case 'Active':
                return {
                    icon: CheckCircle2,
                    className: "bg-emerald-900/30 text-emerald-400 border-emerald-800/50 shadow-[0_0_10px_rgba(52,211,153,0.1)]"
                };
            case 'Suspended':
                return {
                    icon: AlertCircle,
                    className: "bg-red-900/30 text-red-400 border-red-800/50 shadow-[0_0_10px_rgba(248,113,113,0.1)]"
                };
            case 'Invite Pending':
                return {
                    icon: Clock,
                    className: "bg-amber-900/30 text-amber-400 border-amber-800/50 shadow-[0_0_10px_rgba(251,191,36,0.1)]"
                };
        }
    };

    return (
        <main className="min-h-screen bg-[#0B0F19] text-gray-100 p-6 md:p-12 font-sans selection:bg-indigo-500/30">
            <div className="max-w-6xl mx-auto space-y-10">

                {/* Header Section */}
                <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b border-gray-800/60 pb-8">
                    <div className="space-y-3 max-w-2xl">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-400 text-xs font-semibold tracking-wide border border-indigo-500/20 shadow-[0_0_15px_rgba(99,102,241,0.15)] mb-2">
                            <Shield className="h-3.5 w-3.5" />
                            <span>SECURITY & CLEARANCE</span>
                        </div>
                        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-white drop-shadow-sm">
                            Identity & Access
                        </h1>
                        <p className="text-gray-400 text-lg leading-relaxed">
                            Control the operational keys to the platform. Manage personnel clearances, assign portfolio jurisdictions, and monitor system impact across all organizational levels.
                        </p>
                    </div>

                    <Button className="bg-indigo-600 hover:bg-indigo-500 text-white shadow-[0_0_20px_rgba(99,102,241,0.3)] hover:shadow-[0_0_25px_rgba(99,102,241,0.5)] transition-all duration-300 border border-indigo-400/30 gap-2 h-11 px-6 rounded-lg font-medium">
                        <Plus className="h-5 w-5" />
                        Provision New User
                    </Button>
                </header>

                {/* Search & Action Bar */}
                <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <Search className="h-5 w-5 text-gray-500 group-focus-within:text-emerald-400 transition-colors" />
                    </div>
                    <Input
                        type="search"
                        placeholder="Search personnel by name or email clearance..."
                        className="w-full bg-[#0f172a]/50 border-gray-800 h-14 pl-12 pr-4 text-white text-lg rounded-xl focus:bg-[#0f172a] focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 transition-all duration-300 shadow-inner"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>

                {/* Role-Based Sections */}
                <div className="space-y-12 pb-20">
                    {ROLE_GROUPS.map((group) => {
                        const groupUsers = filteredUsers.filter(u => u.role === group.role);
                        if (groupUsers.length === 0) return null;

                        const GroupIcon = group.icon;

                        return (
                            <section key={group.role} className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
                                {/* Section Header */}
                                <div className="flex items-center gap-3">
                                    <div className={cn("p-2.5 rounded-lg border", group.colorClass)}>
                                        <GroupIcon className="h-5 w-5" />
                                    </div>
                                    <h2 className="text-2xl font-bold text-gray-100 tracking-tight">
                                        {group.label}
                                    </h2>
                                    <div className="h-px flex-1 bg-gradient-to-r from-gray-800/80 to-transparent ml-4"></div>
                                </div>

                                {/* User Cards List */}
                                <div className="grid gap-4">
                                    {groupUsers.map((user) => {
                                        const { icon: StatusIcon, className: statusClasses } = getStatusUI(user.status);

                                        return (
                                            <div
                                                key={user.id}
                                                className="group relative flex flex-col md:flex-row items-start md:items-center justify-between gap-6 p-5 rounded-2xl bg-gray-900/40 border border-gray-800/60 backdrop-blur-md hover:bg-gray-800/60 hover:border-gray-700/80 transition-all duration-300 hover:shadow-lg"
                                            >
                                                {/* Left: Identity */}
                                                <div className="flex items-center gap-5 min-w-[300px]">
                                                    <div className="h-12 w-12 rounded-full bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700 flex items-center justify-center text-gray-300 font-bold text-lg shadow-inner group-hover:border-indigo-500/30 group-hover:text-indigo-200 transition-colors">
                                                        {user.avatar}
                                                    </div>
                                                    <div>
                                                        <h3 className="text-lg font-semibold text-gray-100 group-hover:text-white transition-colors">
                                                            {user.name}
                                                        </h3>
                                                        <p className="text-sm text-gray-500 font-mono">
                                                            {user.email}
                                                        </p>
                                                    </div>
                                                </div>

                                                {/* Middle: Narrative Impact */}
                                                <div className="flex-1 px-4 border-l border-gray-800/50 hidden md:flex items-center gap-3">
                                                    <Briefcase className="h-4 w-4 text-gray-600" />
                                                    <span className="text-gray-400 text-sm font-medium">
                                                        {user.impact_metric}
                                                    </span>
                                                </div>

                                                {/* Right: Status & Actions */}
                                                <div className="flex items-center gap-4 w-full md:w-auto justify-between md:justify-end border-t md:border-t-0 border-gray-800/50 pt-4 md:pt-0">
                                                    <div className="flex flex-col items-end gap-1.5 min-w-[120px]">
                                                        <Badge variant="outline" className={cn("gap-1.5 py-1 px-3 text-xs font-semibold uppercase tracking-wider", statusClasses)}>
                                                            <StatusIcon className="h-3.5 w-3.5" />
                                                            {user.status}
                                                        </Badge>
                                                        <span className="text-[11px] text-gray-600 mr-1 flex items-center gap-1">
                                                            <Clock className="h-3 w-3" />
                                                            {user.last_active}
                                                        </span>
                                                    </div>

                                                    <Button variant="ghost" size="icon" className="text-gray-500 hover:text-white hover:bg-gray-800 h-9 w-9 rounded-full border border-transparent hover:border-gray-700 transition-all">
                                                        <MoreVertical className="h-5 w-5" />
                                                        <span className="sr-only">Manage Access</span>
                                                    </Button>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </section>
                        );
                    })}

                    {filteredUsers.length === 0 && (
                        <div className="text-center py-24 border-2 border-dashed border-gray-800 rounded-3xl bg-gray-900/20">
                            <Search className="h-12 w-12 text-gray-700 mx-auto mb-4" />
                            <h3 className="text-xl font-semibold text-gray-300">No personnel found</h3>
                            <p className="text-gray-500 mt-2 max-w-sm mx-auto">
                                We couldn't find any users matching your clearance search string.
                            </p>
                        </div>
                    )}
                </div>

            </div>
        </main>
    );
}
