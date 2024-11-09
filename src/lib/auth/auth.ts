import NextAuth, { CredentialsSignin } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import { hashPassword, verifyPassword } from "../../utils/password";
import { signInSchema } from "../zod";
import { DrizzleAdapter } from "@auth/drizzle-adapter";
import { db } from "db";
import { eq } from "drizzle-orm";
import { accounts, users } from "db/schema";

export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: DrizzleAdapter(db, {
    usersTable: users,
    accountsTable: accounts,
  }),
  providers: [
    Google({
      clientId: process.env.AUTH_GOOGLE_ID,
      clientSecret: process.env.AUTH_GOOGLE_SECRET,
    }),
    Credentials({
      credentials: {
        name: { label: "Name", type: "text" },
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" },
      },
      authorize: async (credentials) => {
        try {
          let user = null;

          const { name, username, password } =
            await signInSchema.parseAsync(credentials);

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
              throw new CredentialsSignin("Las credenciales son inválidas");
            }
          }

          const pwHash = await hashPassword(password);
          user = await addUserToDb(name, username, pwHash);

          if (!user) {
            return null;
          }

          return {
            id: user.id,
            name: user.name,
          };
        } catch (error) {
          throw error;
        }
      },
    }),
  ],
  secret: process.env.AUTH_SECRET,
  session: {
    strategy: "jwt",
    maxAge: 24 * 60 * 60, // 1 day in seconds
  },
  pages: {
    signIn: "/atuh/sign-in",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        return {
          ...token,
          id: user.id,
        };
      }
      return token;
    },
    async session({ session, token }) {
      return {
        ...session,
        user: {
          ...session.user,
          id: token.id as string,
        },
      };
    },
  },
});

const getUserFromDb = async (username: string) => {
  const user = await db.query.users.findFirst({
    where: eq(users.username, username),
  });

  return user;
};

const addUserToDb = async (name: string, username: string, pwdHash: string) => {
  const user = await db
    .insert(users)
    .values({
      name: name,
      username: username,
      password: pwdHash,
    })
    .returning();
  return user.pop();
};
