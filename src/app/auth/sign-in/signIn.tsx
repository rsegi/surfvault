"use client";

import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Icons } from "@/components/icons";
import React, { useEffect } from "react";
import { handleGoogleSignIn } from "@/lib/auth/signInServerAction";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { SignIn, signInSchema } from "@/lib/zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useSession, signIn } from "next-auth/react";
import { toast } from "sonner";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Link from "next/link";

export default function SignInPage() {
  const router = useRouter();
  const { status } = useSession();

  useEffect(() => {
    if (status === "authenticated") {
      router.push("/sessions");
    }
  }, [router, status]);

  const form = useForm<SignIn>({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      name: "default",
      username: "",
      password: "",
    },
  });

  const onSubmit = async () => {
    const result = await signIn("credentials", {
      ...form.getValues(),
      redirect: false,
    });

    if (result?.error) {
      if (result.error === "CredentialsSignin") {
        toast.error("Error de inicio de sesión", {
          description: "Credenciales inválidas",
        });
      } else {
        toast.error("Error de inicio de sesión", {
          description: result.error,
        });
      }
      return;
    }

    toast.success("Inicio de sesión exitoso");
    router.push("/sessions");
  };

  return (
    <div className="flex justify-center p-8 pt-24">
      <Card className="w-full max-w-md font-sans">
        <CardHeader>
          <CardTitle className="text-3xl font-bold text-center">
            Iniciar Sesi&oacute;n
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-8 text-sm text-foreground">
          <p className="text-muted-foreground text-center">
            Selecciona un m&eacute;todo
          </p>
          <Button
            variant="outline"
            className="w-full font-semibold"
            onClick={() => handleGoogleSignIn()}
          >
            <Icons.google className="mr-2 h-4 w-4" />
            Continuar con Google
          </Button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <Separator className="w-full" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">
                O continuar con
              </span>
            </div>
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="username"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Usuario</FormLabel>
                    <FormControl>
                      <Input id="username" type="text" required {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Contrase&ntilde;a</FormLabel>
                    <FormControl>
                      <Input
                        id="password"
                        type="password"
                        required
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button
                disabled={form.formState.isSubmitting}
                type="submit"
                className="w-full text-lg"
              >
                {form.formState.isSubmitting ? "Iniciando sesión" : "Continuar"}
              </Button>
            </form>
          </Form>
        </CardContent>
        <CardFooter className="flex justify-center">
          <p className="text-sm text-muted-foreground">
            ¿No tienes una cuenta?{" "}
            <Link href="/auth/sign-up" className="text-primary hover:underline">
              Regístrate aquí
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
