"use client";

import { Button } from "@/components/ui/button";
import React from "react";
import { handleCredentialsSignIn } from "@/lib/auth/signInServerAction";
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
import { toast } from "sonner";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Link from "next/link";
import { DEFAULT_LOGIN_REDIRECT } from "@/routes";

export default function SignInPage() {
  const form = useForm<SignIn>({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  const onSubmit = async () => {
    const result = await handleCredentialsSignIn(form.getValues());

    if (result.error) {
      toast.error("Error de inicio de sesión", {
        description: result.error,
      });
    } else {
      toast.success(result.success);
      window.location.href = DEFAULT_LOGIN_REDIRECT;
    }
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
