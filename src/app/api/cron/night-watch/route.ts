import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { checkCompliance } from '@/lib/nightWatchEngine';

export const runtime = 'nodejs';

export async function POST(req: Request) {
    try {
        console.log("🚀 Manual Night Watch Triggered via API");

        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
        const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

        if (!supabaseUrl || !supabaseKey) {
            console.error("CRITICAL: Missing Supabase Keys in environment!");
            return NextResponse.json({ error: "Server Configuration Error: Missing Supabase Keys" }, { status: 500 });
        }

        const supabase = createClient(supabaseUrl, supabaseKey);

        // Execute the Engine
        const result = await checkCompliance(supabase);

        return NextResponse.json({
            success: true,
            data: result,
            message: `Scan Complete. Found ${result.violationCount} violations.`
        });

    } catch (err: any) {
        console.error("❌ Night Watch API Failed:", err);
        return NextResponse.json(
            { success: false, error: err.message },
            { status: 500 }
        );
    }
}
