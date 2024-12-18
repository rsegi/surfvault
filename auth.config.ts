import { signInSchema } from "@/lib/zod";
import { verifyPassword } from "@/utils/password";
import { User } from "@auth/core/types";
import { getUserByUsername } from "api/user/user";
import type { NextAuthConfig } from "next-auth";
import Credentials from "next-auth/providers/credentials";

export default {
  providers: [
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
            return user as User;
          }
        }

        return null;
      },
    }),
  ],
} satisfies NextAuthConfig;
