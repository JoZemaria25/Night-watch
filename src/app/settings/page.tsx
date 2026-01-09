"use client";

import { useState, useEffect } from "react";
import { createBrowserClient } from "@supabase/ssr";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Building2, Copy, Check, Shield } from "lucide-react";
import { Separator } from "@/components/ui/separator";

export default function SettingsPage() {
    const [loading, setLoading] = useState(true);
    const [profile, setProfile] = useState<any>(null);
    const [organization, setOrganization] = useState<any>(null);
    const [orgName, setOrgName] = useState("");
    const [creating, setCreating] = useState(false);
    const [copied, setCopied] = useState(false);

    const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            const { data: profileData, error: profileError } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', user.id)
                .single();

            if (profileError) throw profileError;
            setProfile(profileData);

            if (profileData.organization_id) {
                const { data: orgData, error: orgError } = await supabase
                    .from('organizations')
                    .select('*')
                    .eq('id', profileData.organization_id)
                    .single();

                if (orgError) throw orgError;
                setOrganization(orgData);
            }
        } catch (error) {
            console.error("Error fetching settings:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateOrganization = async (e: React.SyntheticEvent) => {
        e.preventDefault();
        setCreating(true);

        try {
            // Call the Database Function (RPC)
            const { data, error } = await supabase
                .rpc('create_organization_and_link', {
                    org_name: orgName
                });

            if (error) throw error;

            console.log("Success:", data);

            // Reload to reflect changes
            window.location.reload();

        } catch (err: any) {
            console.error("RPC Error:", err);
            alert(`Failed to create organization: ${err.message}`);
        } finally {
            setCreating(false);
        }
    };

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    if (loading) {
        return <div className="p-8 text-zinc-400">Loading settings...</div>;
    }

    return (
        <main className="max-w-4xl mx-auto py-12 px-6 space-y-8">
            <div className="space-y-2">
                <h1 className="text-3xl font-bold text-white tracking-tight">Settings</h1>
                <p className="text-zinc-400">Manage your workspace and account preferences.</p>
            </div>

            <Separator className="bg-zinc-800" />

            {organization ? (
                /* SCENARIO A: HAS ORGANIZATION */
                <Card className="bg-zinc-900/50 border-zinc-800">
                    <CardHeader>
                        <div className="flex items-center gap-2 text-indigo-400 mb-2">
                            <Building2 className="h-5 w-5" />
                            <span className="text-xs font-bold tracking-widest uppercase">Workspace</span>
                        </div>
                        <CardTitle className="text-xl text-white">Organization Details</CardTitle>
                        <CardDescription className="text-zinc-400">
                            You are currently managing the following organization.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="grid gap-4 md:grid-cols-2">
                            <div className="space-y-2">
                                <Label className="text-zinc-500 text-xs uppercase tracking-wider">Organization Name</Label>
                                <div className="text-lg font-medium text-white">{organization.name}</div>
                            </div>
                            <div className="space-y-2">
                                <Label className="text-zinc-500 text-xs uppercase tracking-wider">Membership Status</Label>
                                <div className="flex items-center gap-2 text-white">
                                    <Shield className="h-4 w-4 text-emerald-500" />
                                    <span>Admin</span>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-2 pt-4 border-t border-zinc-800/50">
                            <Label className="text-zinc-500 text-xs uppercase tracking-wider">Organization ID</Label>
                            <div className="flex items-center gap-2">
                                <code className="bg-black/50 px-3 py-2 rounded text-zinc-300 font-mono text-sm flex-1 border border-zinc-800">
                                    {organization.id}
                                </code>
                                <Button
                                    variant="outline"
                                    size="icon"
                                    onClick={() => copyToClipboard(organization.id)}
                                    className="border-zinc-700 hover:bg-zinc-800 text-zinc-400"
                                >
                                    {copied ? <Check className="h-4 w-4 text-emerald-500" /> : <Copy className="h-4 w-4" />}
                                </Button>
                            </div>
                            <p className="text-xs text-zinc-500">
                                Use this ID when inviting other team members or configuring API access.
                            </p>
                        </div>
                    </CardContent>
                </Card>
            ) : (
                /* SCENARIO B: NO ORGANIZATION */
                <Card className="bg-zinc-900/50 border-zinc-800 border-dashed">
                    <CardHeader>
                        <div className="flex items-center gap-2 text-amber-500 mb-2">
                            <Building2 className="h-5 w-5" />
                            <span className="text-xs font-bold tracking-widest uppercase">Setup Required</span>
                        </div>
                        <CardTitle className="text-xl text-white">Create Organization</CardTitle>
                        <CardDescription className="text-zinc-400">
                            You are not linked to any organization. Create one to start managing assets.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid gap-4 max-w-md">
                            <div className="space-y-2">
                                <Label htmlFor="orgName" className="text-white">Organization Name</Label>
                                <Input
                                    id="orgName"
                                    placeholder="e.g. Wayne Enterprises"
                                    className="bg-zinc-950 border-zinc-800 text-white focus:ring-indigo-500"
                                    value={orgName}
                                    onChange={(e) => setOrgName(e.target.value)}
                                />
                            </div>
                        </div>
                    </CardContent>
                    <CardFooter>
                        <Button
                            onClick={handleCreateOrganization}
                            disabled={creating || !orgName.trim()}
                            className="bg-indigo-600 hover:bg-indigo-700 text-white"
                        >
                            {creating ? "Creating..." : "Create & Link Organization"}
                        </Button>
                    </CardFooter>
                </Card>
            )}

            <div className="text-center text-xs text-zinc-600 pt-8">
                <p>Night Watch Scheduler v1.1 • Secure Environment</p>
            </div>
        </main>
    );
}
