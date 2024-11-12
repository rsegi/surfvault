import { signInSchema } from "@/lib/zod";
import { verifyPassword } from "@/utils/password";
import { getUserByUsername } from "api/user/user";
import type { NextAuthConfig } from "next-auth";
import Google from "next-auth/providers/google";
import Credentials from "next-auth/providers/credentials";

export default {
  providers: [
    Google,
    Credentials({
      authorize: async (credentials) => {
        const validatedFields = signInSchema.safeParse(credentials);

        if (validatedFields.success) {
          const { password, username } = validatedFields.data;

          const user = await getUserByUsername(username);
          if (!user || !user.password) {
            return null;
          }

          const isAuthenticated = await verifyPassword(password, user.password);
          if (isAuthenticated) {
            return user;
          }
        }

        return null;
      },
    }),
  ],
} satisfies NextAuthConfig;
