import type { Metadata } from "next";
import { Inter, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import { GlobalNav } from "@/components/GlobalNav";
import { cookies } from "next/headers";
import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { CreateOrganizationForm } from "@/components/dashboard/create-organization-form";
import { redirect } from "next/navigation";

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-fallback",
});

export const metadata: Metadata = {
  title: "The Night Watch",
  description: "Automated Compliance Scheduler",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        remove(name: string, options: CookieOptions) {
          // Needed for server client but we are only reading
        },
        set(name: string, value: string, options: CookieOptions) {
          // Needed for server client but we are only reading
        }
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();
  let isHomeless = false;

  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("organization_id")
      .eq("id", user.id)
      .single();

    if (!profile?.organization_id) {
      isHomeless = true;
    }
  }

  // Quarantine Logic
  if (isHomeless) {
    return (
      <html lang="en" suppressHydrationWarning>
        <body
          className={cn(
            "min-h-screen font-sans antialiased",
            "bg-zinc-950 text-zinc-50",
            "selection:bg-indigo-500/10 selection:text-indigo-600",
            plusJakarta.variable,
            inter.variable
          )}
        >
          <div className="flex min-h-screen items-center justify-center p-4 relative">
            {/* Quarantine Atmosphere */}
            <div className="fixed inset-0 -z-10 h-full w-full bg-zinc-950 bg-[linear-gradient(to_right,#27272a_1px,transparent_1px),linear-gradient(to_bottom,#27272a_1px,transparent_1px)] bg-[size:6rem_4rem]">
              <div className="absolute bottom-0 left-0 right-0 top-0 bg-[radial-gradient(circle_800px_at_50%_200px,#18181b,transparent)] opacity-40"></div>
            </div>

            <div className="w-full max-w-md">
              <CreateOrganizationForm />
              <div className="text-center mt-8">
                <form action={async () => {
                  "use server";
                  const supabase = createServerClient(
                    process.env.NEXT_PUBLIC_SUPABASE_URL!,
                    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
                    {
                      cookies: {
                        get(name: string) { return cookieStore.get(name)?.value; },
                        set(name: string, value: string, options: CookieOptions) { cookieStore.set(name, value, options); },
                        remove(name: string, options: CookieOptions) { cookieStore.delete(name); },
                      },
                    }
                  );
                  await supabase.auth.signOut();
                  redirect("/login");
                }}>
                  <button className="text-sm text-zinc-500 hover:text-zinc-300 underline underline-offset-4">
                    Sign out
                  </button>
                </form>
              </div>
            </div>
          </div>
        </body>
      </html>
    );
  }

  // Standard Layout
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={cn(
          "min-h-screen font-sans antialiased",
          "bg-zinc-950 text-zinc-50",
          "selection:bg-indigo-500/10 selection:text-indigo-600", // Custom highlight color
          plusJakarta.variable,
          inter.variable
        )}
      >
        <GlobalNav />
        <div className="flex min-h-screen">
          <main className="flex-1 w-full relative">
            {/* The Background Mesh (Atmosphere) */}
            <div className="fixed inset-0 -z-10 h-full w-full bg-zinc-950 bg-[linear-gradient(to_right,#27272a_1px,transparent_1px),linear-gradient(to_bottom,#27272a_1px,transparent_1px)] bg-[size:6rem_4rem]">
              <div className="absolute bottom-0 left-0 right-0 top-0 bg-[radial-gradient(circle_500px_at_50%_200px,#18181b,transparent)] opacity-40"></div>
            </div>

            <div className="max-w-7xl mx-auto p-4 md:p-8">
              {children}
            </div>
          </main>
        </div>
      </body>
    </html>
  );
}
