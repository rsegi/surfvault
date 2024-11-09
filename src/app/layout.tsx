import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/navbar";
import { SessionProvider } from "next-auth/react";
import { auth } from "@/lib/auth/auth";

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
          <Navbar />
          {children}
        </SessionProvider>
      </body>
    </html>
  );
}
