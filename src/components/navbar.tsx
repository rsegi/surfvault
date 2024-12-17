"use client";

import { useEffect, useState } from "react";
import SessionAvatar from "./sessionAvatar";
import Image from "next/image";
import logoFull from "../../public/logo-text.svg";
import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import Link from "next/link";
import { useSession } from "next-auth/react";

// Authenticated Menu items.
const authenticatedItems = [
  {
    title: "Mis sesiones",
    url: "/sessions",
  },
  {
    title: "Mi cuenta",
    url: "/account",
  },
  {
    title: "Mi mapa",
    url: "#",
  },
];

// Unauthenticated Menu items
const unauthenticatedItems = [
  {
    title: "Iniciar sesión",
    url: "/auth/sign-in",
  },
];

export default function Navbar() {
  const { status } = useSession();
  const [items, setItems] = useState<{ title: string; url: string }[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const displayItems =
      status === "authenticated" ? authenticatedItems : unauthenticatedItems;
    setItems(displayItems);
  }, [status]);

  return (
    <header className="relative flex h-20 shrink-0 items-center px-4 md:px-6 bg-primary">
      <div className="flex items-center">
        <Popover open={isOpen} onOpenChange={setIsOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="text-white hover:bg-secondary hover:text-black"
            >
              <Menu />
              <span className="sr-only">Abrir men&uacute;</span>
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-56 mt-2" align="end">
            <nav className="flex flex-col space-y-2">
              {items.map((link) => (
                <Link
                  key={link.url}
                  href={link.url}
                  className="px-4 py-2 hover:bg-secondary rounded-md transition-colors"
                  onClick={() => setIsOpen(false)}
                >
                  {link.title}
                </Link>
              ))}
            </nav>
          </PopoverContent>
        </Popover>
      </div>
      <div className="absolute left-1/2 transform -translate-x-1/2">
        <Image
          src={logoFull}
          alt="logo y texto surfvault"
          className="h-12 w-auto"
        />
      </div>
      <div className="ml-auto flex items-center">
        <SessionAvatar />
      </div>
    </header>
  );
}
