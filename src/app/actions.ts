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

    // Pass the supabase client into the checkCompliance function
    const result = await checkCompliance(supabase);

    revalidatePath("/");

    // Return detailed string message as requested
    // "message: Checked ${result.checkedCount} tenants. Found ${result.violationCount} expiring leases."

    // Note: The previous return type was complex { success: true, logs: ..., processed: ... }
    // The user asked: "Return: Instead of just { success: true }, return a detailed string: message: ..."
    // This implies changing the return type significantly.
    // However, existing clients might depend on `success`.
    // I will return an object with success AND the message, to be safe, or just the object if adhering strictly.
    // User Instructions: "Return: Instead of just `{ success: true }`, return a detailed string: `message: ...`"
    // This might mean: return { success: true, message: ... } or just { message: ... }?
    // Usually actions return objects. I'll return { success: true, message: ... }.

    return {
        success: true,
        message: `Checked ${result.checkedCount} tenants. Found ${result.violationCount} expiring leases.`
    };
}
