import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/navbar";
import { SessionProvider } from "next-auth/react";
import { auth } from "@/auth";
import { Toaster } from "sonner";
import { AppSidebar } from "@/components/app-sidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";

export const metadata: Metadata = {
  title: "SurfVault",
  description: "Tu rincón de sesiones de surf",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await auth();
  return (
    <html lang="es">
      <body>
        <SessionProvider session={session}>
          <SidebarProvider defaultOpen={false}>
            <AppSidebar />
            <SidebarInset>
              <Navbar />
              <div className="bg-gradient-to-br from-primary/10 to-secondary/10 min-h-screen">
                <div className="container mx-auto px-4">{children}</div>
              </div>
              <Toaster position="top-center" duration={4000} richColors />
            </SidebarInset>
          </SidebarProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
