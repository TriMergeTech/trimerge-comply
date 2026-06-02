"use client";
import { usePathname } from "next/navigation";
import Sidebar from "@/components/sharedComponents/Sidebar";
import { UserProvider } from "@/lib/context/UserContext";

const AUTH_PATHS = ["/login", "/signup", "/forgot-password", "/reset-password", "/verify-otp", "/security"];
const PUBLIC_PATHS = ["/", "/landing-page", "/about"];

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isNoShell =
    PUBLIC_PATHS.some((p) => pathname === p || pathname.startsWith(p + "/")) ||
    AUTH_PATHS.some((p) => pathname.startsWith(p));

  if (isNoShell) return <>{children}</>;


  return (
    <UserProvider>
      <div className="flex flex-row h-screen overflow-hidden bg-slate-50">
        <Sidebar />
        <main className="flex-1 flex flex-col overflow-y-auto">
          <div className="p-6 pt-16 md:pt-6 flex-1">{children}</div>
        </main>
      </div>
    </UserProvider>
  );
}