"use server";

import { signIn } from "@/lib/auth/auth";

export const handleGoogleSignIn = async () => {
  try {
    await signIn("google", { redirectTo: "/sessions" });
  } catch (error) {
    throw error;
  }
};
