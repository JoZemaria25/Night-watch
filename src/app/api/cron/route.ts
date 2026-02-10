import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const runtime = 'nodejs';

export async function GET(req: Request) {
    try {
        // 1. Auth Check
        if (req.headers.get('authorization') !== `Bearer ${process.env.CRON_SECRET}`) {
            return new NextResponse('Unauthorized', { status: 401 });
        }

        const supabase = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
        );

        console.log("------------------------------------------------");
        console.log("🚀 NIGHT WATCH: ACTIVE SCAN STARTED");

        // 2. Fetch Tenants & Existing Tickets
        const [tenantsResponse, ticketsResponse] = await Promise.all([
            supabase.from('tenants').select('id, full_name, lease_end, status, properties (*)'),
            supabase.from('maintenance_requests').select('*').neq('status', 'Resolved')
        ]);

        if (tenantsResponse.error) throw new Error(tenantsResponse.error.message);

        const tenants = tenantsResponse.data || [];
        const existingTickets = ticketsResponse.data || [];

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const ticketsToCreate: any[] = [];
        let processedCount = 0;

        // 3. Analyze Tenants
        tenants.forEach(t => {
            if (!t.lease_end) return;

            // Safe Property Resolution
            const propData = Array.isArray(t.properties) ? t.properties[0] : t.properties;
            const safeProp = propData as any;
            const propertyName = safeProp?.name || safeProp?.title || safeProp?.address || "Unknown Property";
            const propertyId = safeProp?.id;

            // Date Math
            const [y, m, d] = t.lease_end.split('-').map(Number);
            const leaseDate = new Date(y, m - 1, d);
            const diffTime = leaseDate.getTime() - today.getTime();
            const days = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

            if (days <= 30) {
                // 4. DUPLICATE CHECK (Now using the robust ID check!)
                const alreadyHasTicket = existingTickets.some(ticket =>
                    ticket.tenant_id === t.id && // Matching ID is 100% accurate
                    ticket.issue_type === 'Compliance'
                );

                if (alreadyHasTicket) {
                    console.log(`ℹ️ SKIPPING: ${t.full_name} (Ticket already exists)`);
                } else {
                    console.log(`🚨 ALERT: ${t.full_name} has ${days} days left. Queueing ticket.`);

                    ticketsToCreate.push({
                        tenant_id: t.id, // ✅ The new column!
                        property_id: propertyId,

                        issue_type: 'Compliance',
                        title: `Lease Expiry: ${t.full_name}`,
                        description: `Lease ends on ${t.lease_end} (${days} days remaining).`,
                        status: 'Open',
                        priority: days < 7 ? 'urgent' : 'normal',
                    });
                }
            }
            processedCount++;
        });

        // 5. Create Tickets
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
            console.log("✅ No new tickets needed.");
        }

        // 6. Log Run
        await supabase.from('asset_log').insert({
            event_type: 'cron_compliance_scan',
            details: `Scanned ${processedCount} tenants. Created ${ticketsToCreate.length} new alerts.`,
            status: 'success'
        });

        console.log("------------------------------------------------");
        return NextResponse.json({ success: true, new_tickets: ticketsToCreate.length });

    } catch (err: any) {
        console.error("🔥 FATAL ERROR:", err.message);
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}