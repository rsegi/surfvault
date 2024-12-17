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
import { SignUp, signUpSchema } from "@/lib/zod";
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
import { signUp } from "@/lib/auth/signUpServerAction";
import { DEFAULT_LOGIN_REDIRECT } from "@/routes";

export default function SignUpPage() {
  const [isLoading, setIsLoading] = React.useState(false);

  const form = useForm<SignUp>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      name: "",
      username: "",
      password: "",
    },
  });

  const onSubmit = async (data: SignUp) => {
    try {
      setIsLoading(true);
      const result = await signUp(data);

      if (result?.error) {
        toast.error("Error de registro", {
          description: result.error,
        });
        return;
      }

      toast.success("Registro exitoso");
      await handleCredentialsSignIn(form.getValues());
    } catch {
      toast.error("Error de registro", {
        description: "Ha ocurrido un error inesperado",
      });
    } finally {
      setIsLoading(false);
      window.location.href = DEFAULT_LOGIN_REDIRECT;
    }
  };

  return (
    <div className="flex justify-center p-8 pt-24">
      <Card className="w-full max-w-md font-sans">
        <CardHeader>
          <CardTitle className="text-3xl font-bold text-center">
            Registrarse
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
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nombre</FormLabel>
                    <FormControl>
                      <Input {...field} />
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
                disabled={isLoading}
                type="submit"
                className="w-full text-lg"
              >
                {isLoading ? "Registrando..." : "Continuar"}
              </Button>
            </form>
          </Form>
        </CardContent>
        <CardFooter className="flex justify-center">
          <p className="text-sm text-muted-foreground">
            ¿Ya tienes una cuenta?{" "}
            <Link href="/auth/sign-in" className="text-primary hover:underline">
              Inicia sesi&oacute;n aqu&iacute;
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
