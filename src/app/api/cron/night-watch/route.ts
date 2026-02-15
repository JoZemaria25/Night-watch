import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { checkCompliance } from '@/lib/nightWatchEngine';

export const runtime = 'nodejs';

export async function POST(req: Request) {
    try {
        console.log("🚀 Manual Night Watch Triggered via API");

        // Initialize Supabase Admin Client (Service Role) to bypass RLS for the engine
        const supabase = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY!
        );

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
