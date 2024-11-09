import { Sheet, SheetTrigger, SheetContent } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { JSX, SVGProps } from "react";
import SessionAvatar from "./sessionAvatar";
import { checkIsAuthenticated } from "@/lib/auth/checkIsAuthenticated";

export default async function Navbar() {
  const isSignedIn = await checkIsAuthenticated();

  return (
    <header className="flex h-20 w-full shrink-0 items-center px-4 md:px-6 justify-between">
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="outline" size="icon">
            <MenuIcon className="h-6 w-6" aria-label="menu" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left">
          <nav className="grid gap-2 py-6">
            <Link
              href="#"
              className="flex w-full items-center py-2 text-lg font-semibold"
              prefetch={false}
            >
              Subir sesi&oacute;n
            </Link>
            <Link
              href="#"
              className="flex w-full items-center py-2 text-lg font-semibold"
              prefetch={false}
            >
              Mis sesiones
            </Link>
            <Link
              href="#"
              className="flex w-full items-center py-2 text-lg font-semibold"
              prefetch={false}
            >
              Mi mapa
            </Link>
            <Link
              href="#"
              className="flex w-full items-center py-2 text-lg font-semibold"
              prefetch={false}
            >
              Mi cuenta
            </Link>
          </nav>
        </SheetContent>
      </Sheet>
      <SessionAvatar isSignedIn={isSignedIn} />
    </header>
  );
}

function MenuIcon(props: JSX.IntrinsicAttributes & SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <line x1="4" x2="20" y1="12" y2="12" />
      <line x1="4" x2="20" y1="6" y2="6" />
      <line x1="4" x2="20" y1="18" y2="18" />
    </svg>
  );
}
