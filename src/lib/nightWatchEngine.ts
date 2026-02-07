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

// Placeholder for future alerting logic (Email/SMS)
export async function sendAlert(tenant: any, days: number) {
    console.log(`>> SENDING EMAIL TO MANAGER: Tenant ${tenant.full_name} expiring in ${days} days`);
}

// ------------------------------------------------------------------
// COMPLIANCE CHECKER (Server-Side Logic for Actions)
// ------------------------------------------------------------------
export type ComplianceResult = {
    checkedCount: number;
    violationCount: number;
    violations: any[];
};

export async function checkCompliance(supabase: any) {
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Start of today (Local Server Time)

    const violations: any[] = [];
    let checkedCount = 0;
    let violationCount = 0;

    // 1. QUERY: Fetch 'tenants' (Active status only).
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

    if (!tenants || tenants.length === 0) {
        return { checkedCount: 0, violationCount: 0, violations: [] };
    }

    // 2. LOOP: Check `tenant.lease_end` vs Today
    for (const tenant of tenants) {
        checkedCount++;
        const prop = tenant.properties;

        if (!tenant.lease_end) continue;

        // --- FIXED DATE LOGIC START ---
        // Split the YYYY-MM-DD string to avoid Timezone shifts
        const [year, month, day] = tenant.lease_end.split('-').map(Number);

        // Month is 0-indexed in JS Date
        const leaseEnd = new Date(year, month - 1, day);
        leaseEnd.setHours(23, 59, 59, 999); // End of the day

        const diffTime = leaseEnd.getTime() - today.getTime();
        const daysRemaining = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        // --- FIXED DATE LOGIC END ---

        // 3. RULE: If `days_remaining <= 30` and `days_remaining >= 0`, trigger a violation.
        const isViolation = daysRemaining <= 30 && daysRemaining >= 0;

        if (isViolation) {
            // 4. VIOLATION ACTION 1 (DB): Create a `maintenance_request`
            const ticketTitle = `Lease Expiring: ${tenant.full_name}`;
            const address = prop?.address || "Unknown Property";
            const unitId = prop?.id || null;

            const description = `SYSTEM AUTOMATION:\nLease for ${tenant.full_name} at ${address} ends on ${tenant.lease_end} (${daysRemaining} days left).\n\nAction Required: Renew or vacate.\n\n[Triggered by Night Watch]`;

            let existing = null;
            if (unitId) {
                const { data } = await supabase
                    .from('maintenance_requests')
                    .select('id')
                    .eq('unit_id', unitId)
                    .eq('title', ticketTitle)
                    .neq('status', 'closed')
                    .maybeSingle();
                existing = data;
            }

            if (!existing) {
                const { error: insertError } = await supabase
                    .from('maintenance_requests')
                    .insert({
                        title: ticketTitle,
                        priority: "high", // CONFIRMED: High Priority
                        status: "open",
                        unit_id: unitId,
                        description: description
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
                }
            }

            // 5. VIOLATION ACTION 2 (Future-Proofing): Call sendAlert placeholder
            await sendAlert(tenant, daysRemaining);
        }
    }

    return { checkedCount, violationCount, violations };
}

// Keeping for backward compatibility if needed
export async function runNightWatch(policies: PolicyRow[]) {
    return { success: true, logs: ["Client-side scan deprecated. Use Server Action."] };
}