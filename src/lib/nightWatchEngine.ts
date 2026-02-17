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
    // console.log(`>> SENDING EMAIL TO MANAGER: Tenant ${tenant.full_name} expiring in ${days} days`);
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
        return { checkedCount: 0, violationCount: 0, violations: [] }; // Fail silently for user
    }

    if (!tenants || tenants.length === 0) {
        return { checkedCount: 0, violationCount: 0, violations: [] };
    }

    // 2. DUPLICATE CHECK (Gatekeeper)
    const { data: openTickets } = await supabase
        .from('maintenance_requests')
        .select('title')
        .eq('issue_type', 'Compliance')
        .eq('status', 'Open');

    const existingTitles = new Set(openTickets?.map((t: any) => t.title) || []);

    // 3. LOOP: Check `tenant.lease_end` vs Today
    const dbErrors: string[] = []; // Changed: Collect errors here

    for (const tenant of tenants) {
        checkedCount++;
        const prop = tenant.properties;

        if (!tenant.lease_end) continue;

        // --- FIXED DATE LOGIC START ---
        const [year, month, day] = tenant.lease_end.split('-').map(Number);
        const leaseEnd = new Date(year, month - 1, day);
        leaseEnd.setHours(23, 59, 59, 999);

        const diffTime = leaseEnd.getTime() - today.getTime();
        const daysRemaining = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        // --- FIXED DATE LOGIC END ---

        // 3. RULE: If `days_remaining <= 30` and `days_remaining >= 0`, trigger a violation.
        const isViolation = daysRemaining <= 30 && daysRemaining >= 0;

        if (isViolation) {
            // INCREMENT IMMEDIATELY - We found one!
            violationCount++;

            // 4. VIOLATION ACTION 1 (DB): Create a `maintenance_request`
            const ticketTitle = `Lease Expiring: ${tenant.full_name}`;
            const address = prop?.address || "Unknown Property";
            // const unitId = prop?.id || null; // Not needed for ID check anymore, but good for record

            // --- GATEKEEPER CHECK ---
            if (existingTitles.has(ticketTitle)) {
                console.log(`⏸️ Skipped: Ticket already exists for ${tenant.full_name}`);
                continue;
            }

            const description = `SYSTEM AUTOMATION:\nLease for ${tenant.full_name} at ${address} ends on ${tenant.lease_end} (${daysRemaining} days left).\n\nAction Required: Renew or vacate.\n\n[Triggered by Night Watch]`;

            // Wrap DB interactions in try/catch so the loop continues even if one fails
            try {
                const { error: insertError } = await supabase
                    .from('maintenance_requests')
                    .insert({
                        title: ticketTitle,
                        priority: "high",
                        status: "open",
                        description: description,
                        issue_type: 'Compliance',
                        organization_id: tenant.organization_id,
                        unit_id: prop?.id // Keep linkage
                    });

                if (insertError) {
                    const errorMsg = `❌ DB INSERT FAILED for ${tenant.full_name}: ${JSON.stringify(insertError)}`;
                    console.error(errorMsg);
                    dbErrors.push(errorMsg);
                } else {
                    console.log(`✅ Ticket Created: ${ticketTitle}`);
                    violations.push({
                        tenant: tenant.full_name,
                        daysRemaining,
                        ticketTitle
                    });

                    // 5. VIOLATION ACTION 2 (EMAIL): Send Notification
                    // Only send if ticket creation used to prevent spam loop if DB fails but email succeeds (though atomic would be better)
                    await sendEmail({
                        to: tenant.email,
                        name: tenant.full_name,
                        type: 'notice',
                        address: address,
                        daysRemaining: daysRemaining
                    });
                }
            } catch (err) {
                console.error(`❌ Unexpected error processing ticket for ${tenant.full_name}:`, err);
            }

            // 5. VIOLATION ACTION 2 (Future-Proofing): Call sendAlert placeholder
            try {
                await sendAlert(tenant, daysRemaining);
            } catch (alertErr) {
                console.error("Alert failed:", alertErr);
            }
        }
    }

    // 6. LOGGING (The Pulse)
    let organizationId = null;

    // 0. Get User (Strict RLS Requirement)
    const { data: { user } } = await supabase.auth.getUser();

    // A. Try to get Org ID from tenants
    if (tenants.length > 0) {
        organizationId = tenants[0].organization_id;
    }

    // B. If no tenants, try to get from Auth (since this usually runs in user context)
    if (!organizationId && user) {
        const { data: profile } = await supabase.from('profiles').select('organization_id').eq('id', user.id).maybeSingle();
        organizationId = profile?.organization_id;
    }

    if (organizationId) {
        const logPayload = {
            organization_id: organizationId,
            event_type: 'compliance_scan',
            status: violationCount > 0 ? 'warning' : 'success',
            details: `Scanned ${checkedCount} tenants. Found ${violationCount} issues.`,
            message: `Night Watch Scan: ${violationCount} violations found in ${checkedCount} tenants.`,
            user_id: user?.id // <--- THE CRITICAL FIX (Signs the log)
        };

        const { error: logError } = await supabase.from('asset_log').insert(logPayload);
        if (logError) {
            console.error("❌ Failed to log Night Watch run:", logError);
        } else {
            console.log("✅ Night Watch run logged successfully.");
        }
    } else {
        console.warn("⚠️ Could not log Night Watch run: Missing Organization ID.");
    }

    return { checkedCount, violationCount, violations, errors: dbErrors };
}

// Keeping for backward compatibility if needed
export async function runNightWatch(policies: PolicyRow[]) {
    return { success: true, logs: ["Client-side scan deprecated. Use Server Action."] };
}