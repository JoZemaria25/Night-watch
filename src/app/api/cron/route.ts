import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const runtime = 'nodejs';

export async function GET(req: Request) {
    if (req.headers.get('authorization') !== `Bearer ${process.env.CRON_SECRET}`) {
        return new NextResponse('Unauthorized', { status: 401 });
    }

    const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    console.log("------------------------------------------------");
    console.log("🔍 DIAGNOSTIC RUN STARTED");

    // 1. UPDATE: Change 'name' to 'full_name'
    // Note: Keep 'properties(id, ...)' whatever you fixed it to (I assumed 'name' here, but use 'address' or 'title' if that's what worked)
    const { data: tenants, error } = await supabase
        .from('tenants')
        .select('id, full_name, lease_end, status, properties (id, name)');

    if (error) {
        console.log("❌ DB Error:", error.message);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    console.log(`📊 Found ${tenants?.length || 0} total tenants.`);

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const report = tenants?.map(t => {
        if (!t.lease_end) return { name: t.full_name, status: "SKIPPED (No Date)" };

        const [y, m, d] = t.lease_end.split('-').map(Number);
        const leaseDate = new Date(y, m - 1, d);

        const diffTime = leaseDate.getTime() - today.getTime();
        const days = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        let action = "NONE";
        // Check for leases expiring in 30 days OR already expired
        if (days <= 30) {
            action = "🚨 FLAG (Expiring)";
        }

        return {
            name: t.full_name, // 2. UPDATE: Use full_name here too
            status: t.status,
            lease: t.lease_end,
            days_left: days,
            result: action
        };
    });

    console.log("📋 TENANT REPORT:", JSON.stringify(report, null, 2));
    console.log("------------------------------------------------");

    return NextResponse.json({ report });
}