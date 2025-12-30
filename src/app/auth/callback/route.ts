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
                        // This writes the cookie to the Response object we created above
                        response.cookies.set({
                            name,
                            value,
                            ...options,
                        });
                    },
                    remove(name: string, options: CookieOptions) {
                        // This removes the cookie from the Response object
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
            return response;
        }
    }

    // Return the user to an error page with instructions
    return NextResponse.redirect(`${origin}/auth/auth-code-error`);
}