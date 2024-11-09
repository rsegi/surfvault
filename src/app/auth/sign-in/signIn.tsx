"use client";

import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Icons } from "@/components/icons";
import React, { useState } from "react";
import {
  handleCredentialsSignIn,
  handleGoogleSignIn,
} from "@/lib/auth/signInServerAction";
import {
  Form,
  FormControl,
  FormDescription,
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
import CustomNotification from "@/components/notification";
import { useSession } from "next-auth/react";

export default function SignInPage() {
  const [message, setMessage] = useState("");
  const [errors, setErrors] = useState({});

  const router = useRouter();

  const form = useForm<SignIn>({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      name: "",
      username: "",
      password: "",
    },
  });

  const { status } = useSession();
  if (status === "authenticated") {
    router.push("/sessions");
    return null;
  }

  const onSubmit = async () => {
    setMessage("");
    setErrors({});
    const result = await handleCredentialsSignIn(form.getValues());
    if (result.errors) {
      setMessage(result.message);
      setErrors(result.errors);
      return;
    }

    setMessage(result.message);
    router.push("/sessions");
  };

  return (
    <div className="w-full max-w-md space-y-8 p-8">
      {message && (
        <CustomNotification
          title={message}
          description={Object.keys(errors).length ? Object.keys(errors)[0] : ""}
          type={errors ? "error" : "success"}
        />
      )}
      <div className="space-y-2 text-center">
        <h1 className="text-3xl font-bold">Iniciar Sesi&oacute;n</h1>
        <p className="text-muted-foreground">Selecciona un m&eacute;todo</p>
      </div>
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
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <FormField
            control={form.control}
            name="username"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Usuario</FormLabel>
                <FormControl>
                  <Input id="username" type="text" required {...field} />
                </FormControl>
                <FormDescription>
                  El nombre &uacute;nico a registrar
                </FormDescription>
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
                <FormDescription>Tu nombre</FormDescription>
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
                  <Input id="password" type="password" required {...field} />
                </FormControl>
                <FormDescription>
                  Contrase&ntilde;a con la que autenticarte
                </FormDescription>
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
    </div>
  );
}
