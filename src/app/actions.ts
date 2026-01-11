"use server";

import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

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

    // 2. Create Organization
    const { data: orgData, error: orgError } = await supabase
        .from("organizations")
        .insert({ name: name, created_at: new Date().toISOString() })
        .select()
        .single();

    if (orgError) {
        console.error("Create Org Error:", orgError);
        return { success: false, message: "Failed to create organization. It usually means an error with database permissions or constraints." };
    }

    // 3. Link User to Organization and set as Admin
    const { error: profileError } = await supabase
        .from("profiles")
        .update({
            organization_id: orgData.id,
            role: 'admin' // Granting full command
        })
        .eq("id", user.id);

    if (profileError) {
        console.error("Link Profile Error:", profileError);
        return { success: false, message: "Organization created but failed to link profile." };
    }

    console.log(`Organization '${name}' created by user ${user.id}`);

    // 4. Revalidate and complete
    revalidatePath("/");
    return { success: true, message: "Organization initialized." };
}
