"use server";

import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { runNightWatchJob } from "@/lib/nightWatchJob";

export async function createOrganizationAction(prevState: any, formData: FormData) {
    const name = formData.get("name") as string;

    if (!name || name.trim().length === 0) {
        return { success: false, message: "Organization name is required." };
    }

    const cookieStore = await cookies();

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                get(name: string) {
                    return cookieStore.get(name)?.value;
                },
                set(name: string, value: string, options: CookieOptions) {
                    // Mutations in Server Actions typically don't need to set request cookies 
                    // unless dealing with auth refresh, but required for client construction
                },
                remove(name: string, options: CookieOptions) {
                },
            },
        }
    );

    // 1. Authenticate
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        return { success: false, message: "Unauthorized" };
    }

    // 2. Create Organization via RPC (Handles RLS and Admin Rules)
    const { error: rpcError } = await supabase.rpc('create_organization_for_me', {
        org_name: name
    });

    if (rpcError) {
        console.error("RPC Error:", rpcError);
        return { success: false, message: "System failed to initialize sector. " + rpcError.message };
    }

    console.log(`Organization '${name}' created by user ${user.id}`);

    // 4. Revalidate and complete
    revalidatePath("/");
    return { success: true, message: "Organization initialized." };
}

export async function triggerNightWatchManually() {
    const cookieStore = await cookies();

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                get(name: string) {
                    return cookieStore.get(name)?.value;
                },
                set(name: string, value: string, options: CookieOptions) {
                },
                remove(name: string, options: CookieOptions) {
                },
            },
        }
    );

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        return { success: false as const, error: "Unauthorized" };
    }

    console.log(`User ${user.id} manually triggered Night Watch.`);

    // 1. Run the standard notification job
    const jobResult = await runNightWatchJob();

    // 2. Run the Compliance Engine (Create Ticket Logic)
    // We utilize the same supabase client (server-side)
    const { checkCompliance } = await import('@/lib/nightWatchEngine');
    const violations = await checkCompliance(supabase);

    let ticketsCreated = 0;

    for (const v of violations) {
        // Idempotency Check: Don't create if open ticket exists for this property + lease expiry
        // (Simple check: Just check if we recently made one for this lease end? 
        //  For V1, we just create it. User can close it.)

        // Check if an OPEN ticket already exists for this property to avoid spam
        const { data: existing } = await supabase
            .from('maintenance_requests')
            .select('id')
            .eq('unit_id', v.propertyId)
            .eq('title', "Compliance Alert: Lease Expiring")
            .eq('status', 'open')
            .single();

        if (!existing) {
            await supabase.from('maintenance_requests').insert({
                title: "Compliance Alert: Lease Expiring",
                priority: "high",
                status: "open",
                unit_id: v.propertyId,
                description: `SYSTEM AUTOMATION:\nLease for ${v.tenantName} at ${v.address} ends on ${v.leaseEnd} (${v.daysRemaining} days left).\n\nAction Required: Renew or vacate.`
            });
            ticketsCreated++;
        }
    }

    revalidatePath("/");

    return {
        success: true as const,
        logs: jobResult.logs,
        processed: (jobResult.processed || 0) + ticketsCreated
    };
}
