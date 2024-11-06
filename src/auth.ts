import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import { hashPassword, verifyPassword } from "./utils/password";
import { signInSchema } from "./lib/zod";
import { ZodError } from "zod";
import { DrizzleAdapter } from "@auth/drizzle-adapter";
import { db } from "db";
import { eq } from "drizzle-orm";
import { users } from "db/schema";

export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: DrizzleAdapter(db),
  providers: [
    Google,
    Credentials({
      credentials: {
        username: { label: "Username", type: "text", placeholder: "rsegt" },
        password: { label: "Password", type: "password" },
      },
      authorize: async (credentials) => {
        try {
          let user = null;

          const { username, password } =
            await signInSchema.parseAsync(credentials);

          // logic to verify if the user exists
          user = await getUserFromDb(username);

          if (user) {
            if (!user.password) {
              return null;
            }

            const isAuthenciated = await verifyPassword(
              password,
              user.password
            );
            if (isAuthenciated) {
              return {
                id: user.id,
                name: user.name,
              };
            } else {
              return null;
            }
          }

          const pwHash = await hashPassword(password);
          user = await addUserToDb(username, pwHash);

          if (!user) {
            return null;
          }

          return {
            id: user.id,
            name: user.name,
          };
        } catch (error) {
          if (error instanceof ZodError) {
            return null;
          }
          throw error;
        }
      },
    }),
  ],
});

const getUserFromDb = async (username: string) => {
  const user = await db.query.users.findFirst({
    where: eq(users.name, username),
  });

  return user;
};

const addUserToDb = async (username: string, pwdHash: string) => {
  const user = await db
    .insert(users)
    .values({
      id: crypto.randomUUID(),
      name: username,
      password: pwdHash,
    })
    .returning();
  return user.pop();
};
