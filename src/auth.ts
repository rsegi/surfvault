import NextAuth from "next-auth";
import { DrizzleAdapter } from "@auth/drizzle-adapter";
import { db } from "db";
import { accounts, users } from "db/schema";
import authConfig from "auth.config";

export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: DrizzleAdapter(db, {
    usersTable: users,
    accountsTable: accounts,
  }),
  session: {
    strategy: "jwt",
    maxAge: 24 * 60 * 60, // 1 day in seconds
  },
  callbacks: {
    async jwt({ token }) {
      return token;
    },
    async session({ token, session }) {
      if (token.sub && session.user) {
        session.user.id = token.sub;
      }
      return session;
    },
  },
  secret: process.env.AUTH_SECRET,
  ...authConfig,
});

// export const { handlers, signIn, signOut, auth } = NextAuth({
//   adapter: DrizzleAdapter(db, {
//     usersTable: users,
//     accountsTable: accounts,
//   }),
//   secret: process.env.AUTH_SECRET,
//   session: {
//     strategy: "jwt",
//     maxAge: 24 * 60 * 60, // 1 day in seconds
//   },
//   pages: {
//     signIn: "/atuh/sign-in",
//   },
//   callbacks: {
// async jwt({ token, user }) {
//   if (user) {
//     return {
//       ...token,
//       id: user.id,
//     };
//   }
//   return token;
//     },
//     async session({ session, token }) {
//       return {
//         ...session,
//         user: {
//           ...session.user,
//           id: token.id as string,
//         },
//       };
//     },
//   },
// });

// const addUserToDb = async (name: string, username: string, pwdHash: string) => {
//   const user = await db
//     .insert(users)
//     .values({
//       name: name,
//       username: username,
//       password: pwdHash,
//     })
//     .returning();
//   return user.pop();
// };
