import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import Sidebar from "@/components/sharedComponents/Sidebar";

const geistSans = Geist({
  variable: "--font-geist-sans",
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
    <html lang="en" className={`${geistSans.variable} h-full antialiased`}>
      <body className="flex flex-row bg-slate-50 h-screen overflow-hidden">

        {/* Sidebar */}
        <Sidebar />

        {/* Main content area */}
        <main className="flex-1 flex flex-col overflow-y-auto">
          <div className="p-6 flex-1">
            {children}
          </div>
        </main>

      </body>
    </html>
  );
}