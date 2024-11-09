"use server";

import { signIn } from "@/lib/auth/auth";
import { SignIn, signInSchema } from "../zod";

type AuthResponse = {
  message: string;
  errors?: Record<string, unknown>;
};

export const handleGoogleSignIn = async () => {
  try {
    console.log("Google SignIn");
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
    console.log("Credentials SignIn");
    console.log("Name", name);
    console.log("Username", username);
    console.log("Password", password);
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
    console.log(`An error occurred: ${error}`);
    return {
      message: `Ha ocurrido un  error: ${error}`,
    };
  }
};
