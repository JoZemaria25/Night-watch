import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// 1. Force Node.js Runtime (Stable)
export const runtime = 'nodejs';

export async function GET(req: Request) {
    try {
        // 2. Security Check
        if (req.headers.get('authorization') !== `Bearer ${process.env.CRON_SECRET}`) {
            return new NextResponse('Unauthorized', { status: 401 });
        }

        // 3. Init Supabase
        // Note: We use the SERVICE_ROLE key if available to bypass RLS, otherwise Anon
        const supabase = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
        );

        console.log("------------------------------------------------");
        console.log("🚀 NIGHT WATCH: ACTIVE SCAN STARTED");

        // 4. Fetch Data (Using the ROBUST method we proved works)
        const { data: tenants, error } = await supabase
            .from('tenants')
            .select(`
        id, 
        full_name, 
        lease_end, 
        status, 
        properties (*) 
      `);

        if (error) throw new Error(error.message);

        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const ticketsToCreate: any[] = [];

        // 5. Analyze Tenants
        tenants?.forEach(t => {
            // Skip if no date
            if (!t.lease_end) return;

            // Safe Property Name Resolution
            const propData = Array.isArray(t.properties) ? t.properties[0] : t.properties;
            const safeProp = propData as any;
            const propertyName = safeProp?.name || safeProp?.title || safeProp?.address || safeProp?.street || "Unknown Property";

            // Date Math
            const [y, m, d] = t.lease_end.split('-').map(Number);
            const leaseDate = new Date(y, m - 1, d);
            const diffTime = leaseDate.getTime() - today.getTime();
            const days = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

            // 6. THE TRIGGER: If 30 days or less, Create Ticket
            if (days <= 30) {
                console.log(`🚨 ALERT: ${t.full_name} has ${days} days left.`);

                ticketsToCreate.push({
                    tenant_id: t.id,
                    title: `Lease Expiry: ${t.full_name}`,
                    description: `Lease ends on ${t.lease_end} (${days} days remaining). Property: ${propertyName}`,
                    status: 'Open',
                    priority: days < 7 ? 'Urgent' : 'High', // Urgent if < 1 week
                    category: 'Compliance' // Or 'Lease', depending on your DB options
                });
            }
        });

        // 7. Execute Actions (Write to DB)
        if (ticketsToCreate.length > 0) {
            console.log(`📝 Creating ${ticketsToCreate.length} tickets...`);

            const { error: insertError } = await supabase
                .from('maintenance_requests')
                .insert(ticketsToCreate);

            if (insertError) {
                console.error("❌ Failed to create tickets:", insertError.message);
                // Don't crash, just log it
            } else {
                console.log("✅ Tickets created successfully.");
            }
        } else {
            console.log("✅ No expiring leases found today.");
        }

        // 8. Log the Run to 'asset_log' (The Heartbeat)
        await supabase.from('asset_log').insert({
            event_type: 'cron_compliance_scan',
            details: `Scanned ${tenants?.length} tenants. Created ${ticketsToCreate.length} alerts.`,
            status: 'success'
        });

        console.log("------------------------------------------------");
        return NextResponse.json({ success: true, tickets: ticketsToCreate.length });

    } catch (err: any) {
        console.error("🔥 FATAL ERROR:", err.message);
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}