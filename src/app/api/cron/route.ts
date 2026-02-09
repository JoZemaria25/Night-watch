import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// 1. Force Node.js Runtime for stability
export const runtime = 'nodejs';

export async function GET(req: Request) {
    try {
        // 2. Security Check: Verify Vercel Secret
        if (req.headers.get('authorization') !== `Bearer ${process.env.CRON_SECRET}`) {
            return new NextResponse('Unauthorized', { status: 401 });
        }

        // 3. Initialize Supabase (Use Service Role if available for full access)
        const supabase = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
        );

        console.log("------------------------------------------------");
        console.log("🚀 NIGHT WATCH: ACTIVE SCAN STARTED");

        // 4. Fetch Data (Using the Robust Method we proved works)
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

        // We will collect tickets here before sending them
        const ticketsToCreate: any[] = [];
        let processedCount = 0;

        // 5. Analyze Tenants
        tenants?.forEach(t => {
            if (!t.lease_end) return; // Skip if no date

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
                    category: 'Compliance'
                });
            }
            processedCount++;
        });

        // 7. Execute Actions (Write to DB)
        if (ticketsToCreate.length > 0) {
            console.log(`📝 Creating ${ticketsToCreate.length} tickets...`);

            const { error: insertError } = await supabase
                .from('maintenance_requests')
                .insert(ticketsToCreate);

            if (insertError) {
                console.error("❌ Failed to create tickets:", insertError.message);
            } else {
                console.log("✅ Tickets created successfully.");
            }
        } else {
            console.log("✅ No expiring leases found today.");
        }

        // 8. Log the Run to 'asset_log' (Heartbeat)
        // This confirms the job ran even if no tickets were created
        await supabase.from('asset_log').insert({
            event_type: 'cron_compliance_scan',
            details: `Scanned ${processedCount} tenants. Created ${ticketsToCreate.length} alerts.`,
            status: 'success'
        });

        console.log("------------------------------------------------");
        return NextResponse.json({ success: true, tickets_created: ticketsToCreate.length });

    } catch (err: any) {
        console.error("🔥 FATAL ERROR:", err.message);
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}