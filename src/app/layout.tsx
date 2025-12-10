import type { Metadata } from "next";
import { Inter, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import { Sidebar } from "@/components/Sidebar";

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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
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
        <div className="flex h-screen overflow-hidden bg-zinc-950 text-white">
          <Sidebar />
          <main className="flex-1 overflow-y-auto relative">
            {/* The Background Mesh (Atmosphere) - Moved here to be content-specific */}
            <div className="fixed inset-0 -z-10 h-full w-full bg-zinc-950 bg-[linear-gradient(to_right,#27272a_1px,transparent_1px),linear-gradient(to_bottom,#27272a_1px,transparent_1px)] bg-[size:6rem_4rem]">
              <div className="absolute bottom-0 left-0 right-0 top-0 bg-[radial-gradient(circle_500px_at_50%_200px,#18181b,transparent)] opacity-40"></div>
            </div>

            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
