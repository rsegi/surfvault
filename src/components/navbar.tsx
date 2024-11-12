import SessionAvatar from "./sessionAvatar";
import Image from "next/image";
import logoFull from "../../public/logo-text.svg";
import { SidebarTrigger } from "@/components/ui/sidebar";

export default function Navbar() {
  return (
    <header className="flex h-20 shrink-0 items-center px-4 md:px-6 justify-between bg-primary">
      <div className="flex items-center">
        <SidebarTrigger className="bg-primary text-white hover:bg-secondary hover:text-black p-2 rounded-md mr-4" />
        <Image src={logoFull} alt="surfvault logo and text" />
      </div>
      <SessionAvatar />
    </header>
  );
}
