import { NextResponse } from 'next/server';

// We use the Node.js runtime for better stability with Env Vars
export async function GET(req: Request) {
    const authHeader = req.headers.get('authorization');

    // 1. Verify Vercel sent the correct key
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
        return new NextResponse('Unauthorized', { status: 401 });
    }

    // 2. Forward the call to Supabase
    try {
        const response = await fetch('https://zycjghzzlecjyotonqvt.supabase.co/functions/v1/lease-ends-checker', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${process.env.CRON_SECRET}`,
                'Content-Type': 'application/json'
            }
        });

        const data = await response.json();
        return NextResponse.json(data);
    } catch (error) {
        return new NextResponse('Internal Error', { status: 500 });
    }
}