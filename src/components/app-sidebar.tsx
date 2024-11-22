"use client";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import Image from "next/image";
import logoText from "../../public/text-black.svg";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import Link from "next/link";

// Authenticated Menu items.
const authenticatedItems = [
  {
    title: "Subir sesión",
    url: "/sessions/upload",
  },
  {
    title: "Mis sesiones",
    url: "/sessions",
  },
  {
    title: "Mi mapa",
    url: "#",
  },
  {
    title: "Mi cuenta",
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

export function AppSidebar() {
  const { status } = useSession();
  const [items, setItems] = useState<{ title: string; url: string }[]>([]);

  useEffect(() => {
    const displayItems =
      status === "authenticated" ? authenticatedItems : unauthenticatedItems;
    setItems(displayItems);
  }, [status]);

  return (
    <Sidebar>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="flex justify-center mt-5 mb-5">
            {" "}
            <Image src={logoText} alt="surfvault text" className="pr-1 pl-1" />
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton>
                    <Link href={item.url} prefetch={false}>
                      {/* <item.icon /> */}
                      {item.title}
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
