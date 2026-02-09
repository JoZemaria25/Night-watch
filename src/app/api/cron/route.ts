import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// 1. Force Node.js Runtime (Most stable for backend logic)
export const runtime = 'nodejs';

export async function GET(req: Request) {
    try {
        // 2. Security Gate: Verify the Vercel Secret
        if (req.headers.get('authorization') !== `Bearer ${process.env.CRON_SECRET}`) {
            return new NextResponse('Unauthorized', { status: 401 });
        }

        // 3. Initialize DB Connection
        const supabase = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
        );

        console.log("------------------------------------------------");
        console.log("🔍 SAFE DIAGNOSTIC RUN STARTED");

        // 4. Robust Data Fetching
        // We select `properties(*)` to safely grab whatever columns exist without crashing.
        const { data: tenants, error } = await supabase
            .from('tenants')
            .select(`
        id, 
        full_name, 
        lease_end, 
        status, 
        properties (*) 
      `);

        if (error) {
            console.error("❌ DB Error (Handled safely):", error.message);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        console.log(`📊 Found ${tenants?.length || 0} tenants to analyze.`);

        // 5. Safe Analysis Logic
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const report = tenants?.map(t => {
            // Robust Property Name Finder: Checks common column names safely
            // 'any' cast used here to prevent TypeScript from blocking unknown columns
            const propData = Array.isArray(t.properties) ? t.properties[0] : t.properties;
            const safeProp = propData as any;
            const propertyName = safeProp?.name || safeProp?.title || safeProp?.address || safeProp?.street || "Unknown Property";

            if (!t.lease_end) return {
                tenant: t.full_name,
                property: propertyName,
                status: "SKIPPED (No Date)"
            };

            // Date Math
            const [y, m, d] = t.lease_end.split('-').map(Number);
            const leaseDate = new Date(y, m - 1, d);
            const diffTime = leaseDate.getTime() - today.getTime();
            const days = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

            let action = "NONE";

            // Logic: Flag if expired OR expiring in next 30 days
            if (days <= 30) {
                action = "🚨 FLAG (Expiring/Expired)";
            }

            return {
                tenant: t.full_name,
                property: propertyName,
                lease_end: t.lease_end,
                days_left: days,
                result: action
            };
        });

        // 6. Output Results
        console.log("📋 REPORT SUMMARY (First 5 Rows):");
        if (report && report.length > 0) {
            console.table(report.slice(0, 5));
        } else {
            console.log("No tenants found.");
        }
        console.log("------------------------------------------------");

        return NextResponse.json({ success: true, scanned: tenants?.length, report });

    } catch (err: any) {
        // 7. Ultimate Safety Net: Catch unexpected crashes
        console.error("🔥 CRITICAL ERROR CAUGHT:", err.message);
        return NextResponse.json({ error: "Internal Script Error", details: err.message }, { status: 500 });
    }
}