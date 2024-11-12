"use server";

import { signIn } from "@/auth";
import { SignIn, signInSchema } from "../zod";
import { AuthError } from "next-auth";

export const handleGoogleSignIn = async () => {
  try {
    await signIn("google", { redirectTo: "/sessions" });
  } catch (error) {
    throw error;
  }
};

export const handleCredentialsSignIn = async (values: SignIn) => {
  const validatedFields = signInSchema.safeParse(values);

  if (!validatedFields.success) {
    return { error: "Los valores introducidos son erróneos" };
  }

  const { username, password } = validatedFields.data;

  try {
    await signIn("credentials", {
      username,
      password,
      redirect: false,
    });

    return { success: "Usuario autenticado" };
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case "CredentialsSignin":
          return { error: "Las credenciales son inválidas" };
        default:
          return { error: "Algo ha ido mal" };
      }
    }

    return { error: "Algo ha ido mal" };
  }
};
