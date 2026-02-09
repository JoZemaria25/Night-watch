import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const runtime = 'nodejs'; // Use Node.js for stability

export async function GET(req: Request) {
    // 1. Verify Vercel
    if (req.headers.get('authorization') !== `Bearer ${process.env.CRON_SECRET}`) {
        return new NextResponse('Unauthorized', { status: 401 });
    }

    // 2. Initialize Supabase Admin
    const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY! // We use ANON for now to test visibility
    );

    console.log("------------------------------------------------");
    console.log("🔍 DIAGNOSTIC RUN STARTED");

    // 3. Fetch ALL Tenants (No filters, just get the raw data)
    const { data: tenants, error } = await supabase
        .from('tenants')
        .select('id, name, lease_end, status, properties (id, name)');

    if (error) {
        console.log("❌ DB Error:", error.message);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    console.log(`📊 Found ${tenants?.length || 0} total tenants.`);

    let ticketsCreated = 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const report = tenants?.map(t => {
        // A. Check for missing data
        if (!t.lease_end) return { name: t.name, status: "SKIPPED (No Date)" };

        // B. Parse Date (Assume YYYY-MM-DD)
        const [y, m, d] = t.lease_end.split('-').map(Number);
        const leaseDate = new Date(y, m - 1, d);

        // C. Calculate Days
        const diffTime = leaseDate.getTime() - today.getTime();
        const days = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        // D. The Logic Check
        let action = "NONE";

        // CHANGED: We now flag anything less than 30 days, even if negative (expired)
        if (days <= 30) {
            action = "🚨 FLAG (Expiring/Expired)";
            ticketsCreated++;
            // (We aren't creating real tickets in this test run, just counting)
        }

        return {
            name: t.name,
            status: t.status,
            lease: t.lease_end,
            days_left: days,
            result: action
        };
    });

    console.log("📋 TENANT REPORT:");
    console.table(report); // This prints a beautiful table in your logs
    console.log("------------------------------------------------");

    return NextResponse.json({
        message: "Diagnostic Complete",
        scanned: tenants?.length,
        potential_tickets: ticketsCreated,
        report: report
    });
}