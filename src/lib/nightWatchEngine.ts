import { supabase } from "@/lib/supabase";

type Property = {
    id: string;
    address: string;
    lease_end?: string;
    rent_due_day?: number;
    next_inspection_date?: string;
};

export async function runNightWatch() {
    console.log("🌙 Night Watch Started...");

    // 1. Fetch Active Policies
    const { data: policies } = await supabase.from('policies').select('*');
    if (!policies?.length) return { success: false, logs: ["❌ No Policies Defined"] };

    // 2. Fetch Properties
    const { data: properties } = await supabase.from('properties').select('*');
    if (!properties?.length) return { success: false, logs: ["❌ No Properties Found"] };

    const logs: string[] = [];
    let actionsTriggered = 0;
    const today = new Date();
    const currentDay = today.getDate();

    // 3. THE BRAIN: Loop through every property
    for (const property of properties as Property[]) {

        // --- CHECK 1: RENT REMINDER ---
        if (property.rent_due_day && property.rent_due_day === currentDay) {
            actionsTriggered++;
            const msg = `💰 RENT DUE: ${property.address} (Day ${currentDay})`;
            logs.push(msg);
            await logAction(property.id, 'rent_reminder', msg);
        }

        // --- CHECK 2: INSPECTION REMINDER (30 Days Out) ---
        if (property.next_inspection_date) {
            const inspectionDate = new Date(property.next_inspection_date);
            const diffTime = inspectionDate.getTime() - today.getTime();
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

            if (diffDays === 30) {
                actionsTriggered++;
                const msg = `🔍 INSPECTION: ${property.address} is in 30 days.`;
                logs.push(msg);
                await logAction(property.id, 'schedule_inspection', msg);
            }
        }

        // --- CHECK 3: LEASE POLICIES (Existing Logic) ---
        if (property.lease_end) {
            const leaseDate = new Date(property.lease_end);
            const diffTime = leaseDate.getTime() - today.getTime();
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

            for (const policy of policies) {
                if (diffDays === policy.days_offset) {
                    actionsTriggered++;
                    const msg = `✅ POLICY MATCH: ${property.address} is exactly ${diffDays} days away from lease end.`;
                    logs.push(msg);
                    await logAction(property.id, policy.event_trigger, msg);
                }
            }
        }
    }

    if (actionsTriggered === 0) {
        logs.push(`ℹ️ Scan Complete. No actions triggered for ${properties.length} properties.`);
    }

    return {
        success: true,
        count: actionsTriggered,
        logs: logs
    };
}

// Helper to log to Supabase
async function logAction(propertyId: string, policyName: string, status: string) {
    await supabase.from('asset_log').insert({
        property_id: propertyId,
        policy_name: policyName,
        status: 'Sent', // In a real app, this might be 'Pending' until email is sent
        created_at: new Date().toISOString()
    });
}