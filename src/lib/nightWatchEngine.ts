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
// ------------------------------------------------------------------
// COMPLIANCE CHECKER (Server-Side Logic for Actions)
// ------------------------------------------------------------------
export type ComplianceResult = {
    checkedCount: number;
    violationCount: number;
    violations: any[];
};

export async function checkCompliance(supabase: any) {
    console.log("🔍 STARTING COMPLIANCE CHECK (JS DATE LOGIC - MULTI-TENANT)...");

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const violations: any[] = [];
    let checkedCount = 0;
    let violationCount = 0;

    // Fetch Active Tenants with Property details
    const { data: tenants, error } = await supabase
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
        return { checkedCount: 0, violationCount: 0, violations: [] };
    }

    if (!tenants) return { checkedCount: 0, violationCount: 0, violations: [] };

    console.log(`Checking ${tenants.length} tenants...`);

    for (const tenant of tenants) {
        checkedCount++;
        const prop = tenant.properties;

        // Skip if no property or no lease end date
        if (!prop || !tenant.lease_end) continue;

        const leaseEnd = new Date(tenant.lease_end);
        leaseEnd.setHours(0, 0, 0, 0);

        const isValid = !isNaN(leaseEnd.getTime());

        // Calculate days remaining
        const daysRemaining = differenceInDays(leaseEnd, today);

        // Violation Condition: If days_remaining <= 30 AND days_remaining >= 0
        const isViolation = isValid && daysRemaining <= 30 && daysRemaining >= 0;

        if (isViolation) {
            console.log(`⚠️ Violation found for ${tenant.full_name}: ${daysRemaining} days remaining.`);

            const ticketTitle = `Lease Expiring: ${tenant.full_name} at ${prop.address}`;
            const description = `SYSTEM AUTOMATION:\nLease for ${tenant.full_name} at ${prop.address} ends on ${tenant.lease_end} (${daysRemaining} days left).\n\nAction Required: Renew or vacate.\n\n[Triggered by Night Watch]`;

            // IDEMPOTENCY CHECK: Don't create if OPEN ticket exists
            // We need to use the passed supabase client
            const { data: existing } = await supabase
                .from('maintenance_requests')
                .select('id')
                .eq('unit_id', prop.id)
                .eq('title', ticketTitle)
                .neq('status', 'closed') // Check against non-closed tickets
                .maybeSingle();

            if (!existing) {
                // INSERT TICKET
                const { error: insertError } = await supabase
                    .from('maintenance_requests')
                    .insert({
                        title: ticketTitle,
                        priority: "high",
                        status: "open",
                        unit_id: prop.id, // Assuming unit_id links to property
                        description: description
                        // created_by is usually handled by RLS server-side or default
                    });

                if (insertError) {
                    console.error(`❌ Failed to create ticket:`, insertError);
                } else {
                    violationCount++;
                    violations.push({
                        tenant: tenant.full_name,
                        daysRemaining,
                        ticketTitle
                    });
                    console.log(`🚨 Created Ticket: ${ticketTitle}`);
                }
            } else {
                console.log(`ℹ️ Ticket already exists (ID: ${existing.id}), skipping.`);
            }
        }
    }

    return { checkedCount, violationCount, violations };
}