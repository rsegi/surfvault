import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import { signOut } from "next-auth/react";

export default function AccountContent() {
  return (
    <div className="grid gap-4">
      <h3 className="font-semibold text-center">Mi cuenta</h3>
      <Button
        variant="outline"
        className="w-full flex items-center justify-center gap-2"
        onClick={() => signOut({ redirectTo: "/" })}
      >
        <LogOut className="h-4 w-4" />
        Cerrar sesión
      </Button>
    </div>
  );
}
