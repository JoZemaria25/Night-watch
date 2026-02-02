
import { NextRequest, NextResponse } from 'next/server';
import { runNightWatchJob } from '@/lib/nightWatchJob';

// Force dynamic execution for caching strategies
export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
    // 1. Security Check
    const authHeader = req.headers.get('Authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
        return new NextResponse('Unauthorized', { status: 401 });
    }

    try {
        console.log('🚀 Triggering Cron via API Route...');
        const result = await runNightWatchJob();
        return NextResponse.json(result);
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
