import { NextResponse } from 'next/server';

export const runtime = 'edge';

export async function GET(request: Request) {
    // 1. GET THE FULL LIST OF KEYS
    const envVars = Object.keys(process.env);

    console.log("------------------------------------------------");
    console.log("🔍 DEBUG: ENVIRONMENT DUMP");
    console.log("   - Total Variables:", envVars.length);
    console.log("   - Keys Available:", JSON.stringify(envVars)); // <--- THIS IS THE KEY
    console.log("   - Is CRON_SECRET present?", envVars.includes('CRON_SECRET') ? "YES" : "NO");
    console.log("------------------------------------------------");

    return NextResponse.json({
        status: 'Debug Complete',
        keys: envVars,
        hasSecret: envVars.includes('CRON_SECRET')
    });
}