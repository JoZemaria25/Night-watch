export const runtime = 'edge';

export async function GET(req: Request) {
    const authHeader = req.headers.get('authorization');
    const mySecret = process.env.CRON_SECRET;

    // DEBUG LOGGING (Check your Vercel Logs for these!)
    console.log("🔒 DEBUG CHECK:");
    console.log("   - Header Received:", authHeader ? "YES" : "NO"); // Should be YES
    console.log("   - My Secret Set:", mySecret ? "YES" : "NO");     // Should be YES
    console.log("   - Secret Match:", authHeader === `Bearer ${mySecret}` ? "MATCH" : "MISMATCH");

    // 1. Verify the caller is Vercel
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
        return new Response('Unauthorized: Vercel Handshake Failed', { status: 401 });
    }

    // 2. Forward to Supabase
    const result = await fetch('https://zycjghzzlecjyotonqvt.supabase.co/functions/v1/lease-ends-checker', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${process.env.CRON_SECRET}`,
            'Content-Type': 'application/json'
        }
    });

    const data = await result.json();

    // Check if SUPABASE rejected us
    if (result.status === 401) {
        return new Response('Unauthorized: Supabase Rejected the Key', { status: 401 });
    }

    return Response.json(data);

}