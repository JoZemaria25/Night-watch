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

    const { data: properties } = await supabase.from('properties').select('*').eq('organization_id', orgId);
    const { data: tenants } = await supabase.from('tenants').select('*').eq('organization_id', orgId);

    if (!properties || properties.length === 0) {
        return { success: false, logs: ["❌ No properties found for this organization."] };
    }

    for (const prop of properties) {
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
            let emailType: 'inspection' | 'notice' = 'inspection'; // Default

            if (rule.metric === 'lease_end' && prop.lease_end) {
                const days = differenceInDays(new Date(prop.lease_end), new Date());
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

                // Skip if Safe (unless we want to log everything, but usually we only want alerts)
                if (zone === 'safe') continue;

                // Check against rule value if needed, or just rely on Zone
                // For this upgrade, Zone Logic overrides the simple value check for lease_end
                triggered = true;
                logMessage = `Lease Alert (${zone.toUpperCase()}): ${prop.address} (${days} days left)`;
                severity = zone === 'notice' ? 'warning' : 'info';
            }
            else if (rule.metric === 'rent_due') {
                const today = new Date().getDate();
                if (today >= parseInt(rule.value)) {
                    triggered = true;
                    logMessage = `Rent Due: ${prop.address}`;
                    severity = "info";
                    emailType = 'notice'; // Treat rent due as a notice
                }
            }

            // C. ACTION EXECUTION
            if (triggered) {
                logs.push(`🔔 ${logMessage}`);

                // 1. NOTIFY MANAGER (Browser Notification)
                if (rule.recipient === 'manager') {
                    if (typeof window !== 'undefined' && "Notification" in window && Notification.permission === "granted") {
                        new Notification("Night Watch Alert", { body: logMessage });
                    }
                }
                // 2. NOTIFY TENANT (Email)
                else if (rule.recipient === 'tenant') {
                    const tenant = tenants?.find(t => t.property_id === prop.id);
                    if (tenant) {
                        await sendEmail({
                            to: tenant.email,
                            name: tenant.full_name,
                            type: emailType,
                            address: prop.address,
                            daysRemaining: rule.metric === 'lease_end' ? differenceInDays(new Date(prop.lease_end!), new Date()) : undefined
                        });
                        logs.push(`✉️ Email sent to ${tenant.full_name}`);
                    } else {
                        logs.push(`⚠️ No tenant found for ${prop.address}`);
                    }
                }

                // 3. PERSIST TO DB
                console.log("Attempting DB Write for:", logMessage);
                const { error } = await supabase.from('asset_log').insert({
                    message: logMessage,
                    status: severity,
                    property_id: prop.id,
                    organization_id: orgId
                });

                if (error) {
                    console.error("❌ DATABASE WRITE FAILED:", error.message, error.details);
                    logs.push(`(DB Error: ${error.message})`);
                } else {
                    console.log("✅ Database Write Success");
                }
            }
        }
    }

    logs.push(`✅ SYNC COMPLETE.`);
    return { success: true, logs };
}