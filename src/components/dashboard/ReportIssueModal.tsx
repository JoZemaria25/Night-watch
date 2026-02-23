"use client";

import { useState, useEffect } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import { X, Loader2, Wrench, AlertCircle } from 'lucide-react';

// Types
type Property = {
    id: string;
    address: string;
};

export default function ReportIssueModal({ isOpen, onClose, onSuccess }: { isOpen: boolean; onClose: () => void; onSuccess?: () => void }) {
    const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');

    // UI STATE
    const [issueType, setIssueType] = useState<'repair' | 'inspection'>('repair');
    const [unit, setUnit] = useState('');
    const [description, setDescription] = useState('');

    // Data State
    const [properties, setProperties] = useState<Property[]>([]);
    const [loadingProperties, setLoadingProperties] = useState(false);
    const [organizationId, setOrganizationId] = useState<string | null>(null);

    // Initial Fetch (Adapted from AddTenant.tsx)
    useEffect(() => {
        if (!isOpen) return;

        async function fetchProperties() {
            setLoadingProperties(true);
            try {
                const { data: { user } } = await supabase.auth.getUser();
                if (user) {
                    const { data: profile } = await supabase
                        .from('profiles')
                        .select('organization_id')
                        .eq('id', user.id)
                        .single();

                    if (profile?.organization_id) {
                        setOrganizationId(profile.organization_id);
                        const { data } = await supabase
                            .from("properties")
                            .select("id, address")
                            .eq('organization_id', profile.organization_id);

                        if (data) setProperties(data);
                    }
                }
            } catch (err) {
                console.error("Error fetching properties:", err);
            } finally {
                setLoadingProperties(false);
            }
        }
        fetchProperties();
    }, [isOpen, supabase]);

    if (!isOpen) return null;

    const handleSubmit = async () => {
        if (!unit) {
            setError("You must select a property for this request.");
            return;
        }

        if (!description) {
            setError("Please provide a description");
            return;
        }

        if (!organizationId) {
            setError("Organization scope is missing. Please refresh.");
            return;
        }

        setIsSubmitting(true);
        setError('');

        try {
            const title = issueType === 'repair' ? 'Repair Request' : 'Inspection Request';

            const payload = {
                title: title,
                description: description,
                priority: 'normal',
                status: 'Open',
                property_id: unit,
                issue_type: 'Maintenance',
                organization_id: organizationId
            };

            const { error: insertError } = await supabase
                .from('maintenance_requests')
                .insert([payload]); // Note: .insert() expects an array or object, passing as an array is standard for single row insert.

            if (insertError) throw insertError;

            onSuccess?.();
            onClose();

        } catch (err: any) {
            console.error('Submission failed:', err);
            setError(err.message || 'Failed to submit request. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
            <div className="bg-[#0A0A0A] border border-zinc-800 w-full max-w-md rounded-2xl p-6 shadow-2xl relative">

                {/* HEADER */}
                <div className="flex justify-between items-start mb-6">
                    <div>
                        <h2 className="text-xl font-bold text-white flex items-center gap-2">
                            <Wrench className="w-5 h-5 text-amber-500" />
                            Report Issue
                        </h2>
                        <p className="text-zinc-400 text-sm mt-1">Submit a maintenance ticket</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-zinc-800 rounded-lg transition-colors">
                        <X className="w-5 h-5 text-zinc-400" />
                    </button>
                </div>

                {/* ISSUE TYPE TOGGLE */}
                <div className="grid grid-cols-2 gap-2 mb-6 bg-zinc-900 p-1 rounded-lg">
                    <button
                        onClick={() => setIssueType('repair')}
                        className={`py-2 px-4 rounded-md text-sm font-medium transition-all ${issueType === 'repair'
                            ? 'bg-amber-600 text-white shadow-lg'
                            : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
                            }`}
                    >
                        Repair Need
                    </button>
                    <button
                        onClick={() => setIssueType('inspection')}
                        className={`py-2 px-4 rounded-md text-sm font-medium transition-all ${issueType === 'inspection'
                            ? 'bg-amber-600 text-white shadow-lg'
                            : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
                            }`}
                    >
                        Inspection
                    </button>
                </div>

                <div className="space-y-4">
                    {/* UNIT SELECT */}
                    <div>
                        <label className="block text-xs font-medium text-zinc-400 uppercase tracking-wider mb-2">
                            Affected Unit
                        </label>
                        <div className="relative">
                            <select
                                value={unit}
                                onChange={(e) => setUnit(e.target.value)}
                                disabled={loadingProperties}
                                className="w-full appearance-none bg-[#111] border border-zinc-800 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-amber-500 transition-colors"
                            >
                                <option value="">Select a property...</option>
                                {properties.map(p => (
                                    <option key={p.id} value={p.id}>{p.address}</option>
                                ))}
                            </select>
                            {loadingProperties && (
                                <div className="absolute right-3 top-3.5">
                                    <Loader2 className="w-4 h-4 animate-spin text-zinc-500" />
                                </div>
                            )}
                        </div>
                    </div>

                    {/* DESCRIPTION */}
                    <div>
                        <label className="block text-xs font-medium text-zinc-400 uppercase tracking-wider mb-2">
                            Description
                        </label>
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Please describe the issue in detail..."
                            rows={4}
                            className="w-full bg-[#111] border border-zinc-800 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-amber-500 transition-colors resize-none placeholder:text-zinc-600"
                        />
                    </div>
                </div>

                {/* ERROR */}
                {error && (
                    <div className="mt-4 p-3 bg-red-900/20 border border-red-900/50 rounded-lg flex items-center gap-2 text-red-500 text-sm">
                        <AlertCircle className="w-4 h-4" />
                        {error}
                    </div>
                )}

                {/* SUBMIT */}
                <button
                    onClick={handleSubmit}
                    disabled={isSubmitting}
                    className="w-full mt-6 bg-amber-600 hover:bg-amber-500 text-white font-medium py-3 rounded-lg transition-all flex justify-center items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {isSubmitting ? (
                        <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            Submitting...
                        </>
                    ) : (
                        'Submit Request'
                    )}
                </button>

            </div>
        </div>
    );
}
