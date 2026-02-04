import { createBrowserClient } from "@supabase/ssr";
import { differenceInDays } from "date-fns";
import { sendEmail } from "@/lib/emailService";

export type PolicyRow = {
    id: number;
    scope: string;
    metric: string;
    operator: string;
    value: string;
    recipient: string;
};

export async function runNightWatch(policies: PolicyRow[]) {
    const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    // 1. Permission Check (Browser only)
    if (typeof window !== 'undefined' && "Notification" in window) {
        if (Notification.permission !== "granted") {
            await Notification.requestPermission();
        }
    }

    const logs: string[] = [];
    logs.push(`🚀 STARTING DIAGNOSTIC SCAN...`);

    // Fetch Current User & Organization
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        return { success: false, logs: ["❌ No authenticated user found."] };
    }

    const { data: profile } = await supabase
        .from('profiles')
        .select('organization_id')
        .eq('id', user.id)
        .single();

    if (!profile?.organization_id) {
        return { success: false, logs: ["❌ No organization found for user."] };
    }

    const orgId = profile.organization_id;
    logs.push(`🏢 Organization ID: ${orgId}`);

    // Fetch Tenants (Primary Entity for Leases) & Properties (For Context)
    const { data: tenants } = await supabase.from('tenants').select('*, properties(*)').eq('organization_id', orgId).eq('status', 'Active');
    const { data: properties } = await supabase.from('properties').select('*').eq('organization_id', orgId);

    if (!properties || properties.length === 0) {
        return { success: false, logs: ["❌ No properties found for this organization."] };
    }

    // Iterate through Tenants for Lease Logic
    if (tenants) {
        for (const tenant of tenants) {
            const prop = tenant.properties; // Joined property data
            if (!prop) continue;

            for (const rule of policies) {
                // A. SCOPE CHECK
                const propType = prop.type || 'residential';
                const isGlobal = rule.scope === 'global';
                const isTypeMatch = rule.scope === propType;
                const isExactMatch = rule.scope === String(prop.id);

                if (!isGlobal && !isTypeMatch && !isExactMatch) continue;

                // B. TRIGGER CHECK (ZONE LOGIC)
                let triggered = false;
                let logMessage = "";
                let severity = "info";
                let emailType: 'inspection' | 'notice' = 'inspection';

                if (rule.metric === 'lease_end' && tenant.lease_end) {
                    const days = differenceInDays(new Date(tenant.lease_end), new Date());
                    let zone = 'safe';

                    // ZONE A: INSPECTION (60-90 Days)
                    if (days <= 90 && days > 30) {
                        zone = 'inspection';
                        emailType = 'inspection';
                    }
                    // ZONE B: CRITICAL NOTICE (< 30 Days)
                    else if (days <= 30) {
                        zone = 'notice';
                        emailType = 'notice';
                    }

                    if (zone === 'safe') continue;

                    triggered = true;
                    logMessage = `Lease Alert (${zone.toUpperCase()}): ${tenant.full_name} at ${prop.address} (${days} days left)`;
                    severity = zone === 'notice' ? 'warning' : 'info';
                }

                // C. ACTION EXECUTION
                if (triggered) {
                    logs.push(`🔔 ${logMessage}`);

                    // 1. NOTIFY MANAGER (Browser)
                    if (rule.recipient === 'manager') {
                        if (typeof window !== 'undefined' && "Notification" in window && Notification.permission === "granted") {
                            new Notification("Night Watch Alert", { body: logMessage });
                        }
                    }
                    // 2. NOTIFY TENANT (Email)
                    else if (rule.recipient === 'tenant') {
                        await sendEmail({
                            to: tenant.email,
                            name: tenant.full_name,
                            type: emailType,
                            address: prop.address,
                            daysRemaining: rule.metric === 'lease_end' ? differenceInDays(new Date(tenant.lease_end!), new Date()) : undefined
                        });
                        logs.push(`✉️ Email sent to ${tenant.full_name}`);
                    }

                    // 3. PERSIST TO DB
                    const { error } = await supabase.from('asset_log').insert({
                        message: logMessage,
                        status: severity,
                        property_id: prop.id,
                        organization_id: orgId
                    });

                    if (error) logs.push(`(DB Error: ${error.message})`);
                }
            }
        }
    }

    // Run Property-Level Checks (like Rent Due)
    // Note: Rent Due might be property level or tenant level depending on design, 
    // assuming property level for now as per original code, or skipping if not primary focus.
    // Original code checked 'rent_due' on property. We'll leave that structure if needed, 
    // but the prompt focused on Leases. 

    logs.push(`✅ SYNC COMPLETE.`);
    return { success: true, logs };
}

// ------------------------------------------------------------------
// COMPLIANCE CHECKER (Server-Side Logic for Actions)
// ------------------------------------------------------------------
export type ComplianceViolation = {
    type: 'lease_expiry';
    propertyId: string;
    unitId: string;
    tenantName: string;
    daysRemaining: number;
    leaseEnd: string;
    address: string;
    ticketTitle: string; // NEW: Pre-formatted title
};

export async function checkCompliance(supabaseClient: any): Promise<ComplianceViolation[]> {
    console.log("🔍 STARTING COMPLIANCE CHECK (JS DATE LOGIC - MULTI-TENANT)...");

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const thresholdDate = new Date(today);
    thresholdDate.setDate(today.getDate() + 30);

    const violations: ComplianceViolation[] = [];

    // Fetch Active Tenants with Property details
    const { data: tenants, error } = await supabaseClient
        .from('tenants')
        .select(`
            *,
            properties (
                id,
                address,
                owner_name
            )
        `)
        .eq('status', 'Active');

    if (error) {
        console.error("❌ Error fetching tenants:", error);
        return [];
    }

    if (!tenants) return [];

    for (const tenant of tenants) {
        const prop = tenant.properties;
        if (!prop || !tenant.lease_end) continue;

        const leaseEnd = new Date(tenant.lease_end);
        leaseEnd.setHours(0, 0, 0, 0);

        const isValid = !isNaN(leaseEnd.getTime());
        const isExpiringSoon = leaseEnd <= thresholdDate;
        const isFutureOrToday = leaseEnd >= today;

        if (isValid && isExpiringSoon && isFutureOrToday) {
            const daysRemaining = differenceInDays(leaseEnd, today);

            violations.push({
                type: 'lease_expiry',
                propertyId: prop.id,
                unitId: prop.id,
                tenantName: tenant.full_name,
                daysRemaining,
                leaseEnd: tenant.lease_end,
                address: prop.address,
                ticketTitle: `Lease Expiring: ${tenant.full_name} at ${prop.address}`
            });

            console.log(`🚨 Violation Found: ${tenant.full_name} (${daysRemaining} days left)`);
        }
    }

    return violations;
}