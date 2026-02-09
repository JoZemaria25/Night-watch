export const runtime = 'edge'; // ⚡ Runs instantly on the edge

export async function GET(req: Request) {
    // 1. Verify Vercel sent the request
    if (req.headers.get('authorization') !== `Bearer ${process.env.CRON_SECRET}`) {
        return new Response('Unauthorized', { status: 401 });
    }

    // 2. Forward the call directly to Supabase
    // We reuse the same CRON_SECRET for simplicity
    const response = await fetch('https://zycjghzzlecjyotonqvt.supabase.co/functions/v1/lease-ends-checker', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${process.env.CRON_SECRET}`,
            'Content-Type': 'application/json'
        }
    });

    // 3. Return Supabase's response exactly as is
    const data = await response.json();
    return Response.json(data);
}