import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

export default function NotLoggedIn() {
  const router = useRouter();

  return (
    <div className="flex items-center justify-center min-h-auto p-4">
      <div className="w-full max-w-md">
        <div className="text-center">
          <div className="text-3xl font-bold">Bienvenido</div>
        </div>
        <div className="space-y-4 text-center">
          <p className="text-muted-foreground">
            Inicia sesi&oacute;n para acceder a tu cuenta. Si a&uacute;n no
            est&aacute;s registrado, crea tu cuenta.
          </p>
          <Button
            className="w-full text-lg py-6"
            size="lg"
            onClick={() => router.push("/auth/sign-in")}
          >
            Inicia Sesi&oacute;n
          </Button>
          <Button
            className="w-full text-lg py-6"
            size="lg"
            onClick={() => router.push("/auth/sign-up")}
          >
            Reg&iacute;strate
          </Button>
        </div>
      </div>
    </div>
  );
}
