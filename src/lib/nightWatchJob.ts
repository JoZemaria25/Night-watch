
import { createClient } from '@supabase/supabase-js';
import { addDays, differenceInDays, subDays } from 'date-fns';
import { sendSMS, sendEmail } from '@/lib/notifications';

// Initialize Supabase with Service Role Key
const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function runNightWatchJob() {
    const logs: string[] = [];
    logs.push('🚀 Starting Night Watch Job (Manual/Cron)...');

    try {
        const today = new Date();
        const ninetyDaysFromNow = addDays(today, 90);
        const sevenDaysAgo = subDays(today, 7).toISOString();

        // Query Properties
        const { data: properties, error: propError } = await supabase
            .from('properties')
            .select('id, address, lease_end, organization_id')
            .lte('lease_end', ninetyDaysFromNow.toISOString())
            .gte('lease_end', today.toISOString());

        if (propError) throw propError;
        if (!properties || properties.length === 0) {
            logs.push('ℹ️ No expiring leases found.');
            return { success: true as const, logs, processed: 0 };
        }

        logs.push(`Found ${properties.length} properties with expiring leases.`);

        let processedCount = 0;

        for (const prop of properties) {
            const daysRemaining = differenceInDays(new Date(prop.lease_end), today);

            // Find Tenant
            const { data: tenants, error: tenantError } = await supabase
                .from('tenants')
                .select('*')
                .eq('property_id', prop.id)
                .is('status', 'Active') // Assuming 'Active' or handle nulls if needed, wait. "status" might be text.
            // Re-checking schema: status TEXT CHECK (status IN ('Active'...))

            // To be safe against "Active" vs "active" casing or nulls? 
            // The check constraint enforces 'Active'.

            if (tenantError) {
                console.error(`Error fetching tenant for ${prop.address}:`, tenantError);
                continue;
            }

            if (!tenants || tenants.length === 0) continue;

            for (const tenant of tenants) {
                if (tenant.status !== 'Active') continue; // Double check

                // Check Logs
                const { data: recentLogs } = await supabase
                    .from('asset_log')
                    .select('id')
                    .eq('property_id', prop.id)
                    .gt('created_at', sevenDaysAgo)
                    .ilike('message', '%Lease Expiration Warning%');

                if (recentLogs && recentLogs.length > 0) {
                    logs.push(`Skipping ${tenant.full_name} (Already notified).`);
                    continue;
                }

                // Notifications
                const subject = `URGENT: Lease Expiration Warning - ${prop.address}`;
                const body = `Hi ${tenant.full_name},\n\nYour lease at ${prop.address} expires in ${daysRemaining} days.\nPlease contact us to renew.`;
                const htmlBody = `<p>Hi ${tenant.full_name},</p><p>Your lease at <strong>${prop.address}</strong> expires in <strong>${daysRemaining} days</strong>.</p><p>Please contact us to renew.</p>`;

                let notified = false;

                if (tenant.phone) {
                    const sms = await sendSMS(tenant.phone, body);
                    if (sms.success) notified = true;
                }

                if (tenant.email) {
                    const email = await sendEmail(tenant.email, subject, htmlBody);
                    if (email.success) notified = true;
                }

                if (notified) {
                    const message = `Lease Expiration Warning sent to ${tenant.full_name} (${daysRemaining} days left)`;
                    logs.push(message);

                    await supabase.from('asset_log').insert({
                        message,
                        status: 'warning',
                        property_id: prop.id,
                        organization_id: prop.organization_id
                    });
                    processedCount++;
                }
            }
        }

        logs.push('✅ Job Complete.');
        return { success: true as const, logs, processed: processedCount };

    } catch (error: any) {
        console.error('Night Watch Job Failed:', error);
        return { success: false as const, error: error.message, logs };
    }
}
