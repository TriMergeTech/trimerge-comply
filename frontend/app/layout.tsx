import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Sidebar from "@/components/sharedComponents/Sidebar";

const inter = Inter({
  variable: "--font-Inter",
  subsets: ["latin"],
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
    <html lang="en" className={`${inter.variable} h-full antialiased`}>
      <body className="flex flex-row h-screen overflow-hidden bg-slate-50">

        {/* Sidebar — client component, manages its own state */}
        <Sidebar />

        {/* Main content area */}
        <main className="flex-1 flex flex-col overflow-y-auto">
          <div className="p-6 pt-16 md:pt-6 flex-1">
            {children}
          </div>
        </main>

      </body>
    </html>
  )
}