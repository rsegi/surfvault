"use server";

import { signIn } from "@/lib/auth/auth";
import { SignIn, signInSchema } from "../zod";
import { CredentialsSignin } from "next-auth";
import { isRedirectError } from "next/dist/client/components/redirect";

type AuthResponse = {
  message: string;
  errors?: Record<string, unknown>;
};

export const handleGoogleSignIn = async () => {
  try {
    await signIn("google", { redirectTo: "/sessions" });
  } catch (error) {
    throw error;
  }
};
export const handleCredentialsSignIn = async (
  values: SignIn
): Promise<AuthResponse> => {
  try {
    const { name, password, username } = values;
    const parsed = await signInSchema.safeParseAsync({
      name,
      username,
      password,
    });

    if (!parsed.success) {
      return {
        message: "Error en los datos enviados",
        errors: parsed.error.flatten().fieldErrors,
      };
    }

    await signIn("credentials", {
      name,
      username,
      password,
    });

    return { message: "Usuario auntenticado" };
  } catch (error) {
    if (error instanceof CredentialsSignin) {
      return {
        message: `Ha ocurrido un  error:`,
        errors: { db: error.message },
      };
    }
    if (isRedirectError(error)) {
      return { message: "Usuario auntenticado" };
    }
    return {
      message: `Ha ocurrido un  error: ${error}`,
    };
  }
};
