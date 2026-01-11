import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
    const { searchParams, origin } = new URL(request.url);
    const code = searchParams.get("code");
    const next = searchParams.get("next") ?? "/";

    if (code) {
        const cookieStore = request.cookies;
        const response = NextResponse.redirect(`${origin}${next}`);

        const supabase = createServerClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
            {
                cookies: {
                    get(name: string) {
                        return cookieStore.get(name)?.value;
                    },
                    set(name: string, value: string, options: CookieOptions) {
                        response.cookies.set({
                            name,
                            value,
                            ...options,
                        });
                    },
                    remove(name: string, options: CookieOptions) {
                        response.cookies.delete({
                            name,
                            ...options,
                        });
                    },
                },
            }
        );

        const { error } = await supabase.auth.exchangeCodeForSession(code);

        if (!error) {
            // SUCCESS: Session established.
            // OPTIONAL: Check or Create Profile to ensure they are "Homeless" but valid
            const { data: { user } } = await supabase.auth.getUser();

            if (user) {
                // Idempotent Profile Creation: Try to create, ignore if exists
                // This handles the "Profile already exists" case silently
                const { error: profileError } = await supabase
                    .from('profiles')
                    .upsert({ id: user.id, email: user.email }, { onConflict: 'id', ignoreDuplicates: true });

                if (profileError) {
                    console.error("Callback Profile Warning:", profileError);
                }
            }

            return response;
        } else {
            console.error("Auth Exchange Error:", error);
        }
    }

    // Only redirect to error page if we truly failed to get a session
    return NextResponse.redirect(`${origin}/auth/auth-code-error`);
}