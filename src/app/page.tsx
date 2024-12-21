"use client";

import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

export default function Page() {
  const router = useRouter();

  return (
    <div className="flex pt-24 justify-center min-h-screen">
      <div className="text-center space-y-6 p-8 max-w-2xl">
        <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl">
          Bienvenido a <strong>SurfVault</strong>
        </h1>
        <p className="text-xl text-muted-foreground">
          Cada ola es &uacute;nica: reg&iacute;strala, est&uacute;diala y vuelve
          a ella cuando quieras.
        </p>
        <Button
          size="lg"
          className="text-lg px-8 py-6"
          onClick={() => router.push("auth/sign-up")}
        >
          Empieza aqu&iacute;
        </Button>
      </div>
    </div>
  );
}
