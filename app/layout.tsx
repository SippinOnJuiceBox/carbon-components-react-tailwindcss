import { GeistSans } from "geist/font/sans";
import "./globals.css";
import { Metadata } from "next";
import { BottomNavigation } from "@/components/BottomNavigation";
import { createClient } from "@/utils/supabase/client";

const defaultUrl = process.env.VERCEL_URL
  ? `https://${process.env.VERCEL_URL}`
  : "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(defaultUrl),
  title: "Swibe",
  description: "Swibe PWA",
  generator: "Next.js",
  manifest: "/manifest.json",
  keywords: ["nextjs", "nextjs13", "next13", "pwa", "next-pwa"],
  themeColor: [{ media: "(prefers-color-scheme: dark)", color: "#fff" }],
  authors: [
    { name: "Eshan Betrabet" },
    {
      name: "Eshan Betrabet",
      url: "https://www.eshanb.com",
    },
  ],
  icons: [
    { rel: "apple-touch-icon", url: "icons/icon-128x128.png" },
    { rel: "icon", url: "icons/icon-128x128.png" },
  ],
};

const supabase = createClient();

// const {
//   data: { user },
// } = await supabase.auth.getUser();

const user = supabase.auth.getUser();

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={GeistSans.className}>
      <body className="bg-background text-foreground max-w-sm mx-auto min-h-screen light">
        <main className="w-full h-full flex max-w-sm mx-auto flex-col items-center">
          {children}
          {(await user) && <BottomNavigation />}
        </main>
      </body>
    </html>
  );
}
