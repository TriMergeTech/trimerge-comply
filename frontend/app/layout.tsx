import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import Sidebar from "@/components/sharedComponents/Sidebar";


// Geist font configuration
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

// App metadata — update title and description for TriMerge Comply
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
    <html
      lang="en"
      className={`${geistSans.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-row bg-slate-50">

        {/* Sidebar — visible on all pages */}
        <Sidebar />

        {/* Main content area — changes per route */}
        <main className="flex-1 flex flex-col overflow-auto">
          {/* Header — visible on all pages */}
          {/* Page content */}
          <div className="p-6 flex-1">
            {children}
          </div>
        </main>

      </body>
    </html>
  );
}