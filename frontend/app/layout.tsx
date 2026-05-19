import type { Metadata } from "next";
import { IBM_Plex_Sans } from "next/font/google";
import "./globals.css";
import AppShell from "./AppShell";
import { Toaster } from "@/components/ui/sonner";

const ibmPlexSans = IBM_Plex_Sans({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: [
    "300", // Light — used for subtle/secondary text
    "400", // Regular — used for body text
    "500", // Medium — used for labels and nav items
    "600", // Semi Bold — used for headings and card titles
    "700", // Bold — used for large numbers and emphasis
  ],
});

export const metadata: Metadata = {
  title: "TriMerge Comply",
  description: "HR Compliance Audit Platform for Government Clients",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${ibmPlexSans.variable} h-full antialiased`}>
      <body>
        <AppShell>{children}</AppShell>
        {/* Toast notifications */}
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              fontFamily: 'var(--font-sans)',
              background: '#f8fafc',
              border: '1px solid #e2e8f0',
              color: '#1e293b',
            },
            classNames: {
              success: 'border-l-4 border-l-green-500',
              error: 'border-l-4 border-l-red-500',
            }
          }}
        />
      </body>
    </html>
  );
}