import { db } from "db";
import { SignUp, signUpSchema } from "../zod";
import { eq } from "drizzle-orm";
import { users } from "db/schema";
import argon2 from "argon2";

export const signUp = async (values: SignUp) => {
  const validatedFields = signUpSchema.safeParse(values);

  if (!validatedFields.success) {
    return { error: "Los campos de registro son inválidos" };
  }

  const { name, password, username } = validatedFields.data;

  const existingUser = await db.query.users.findFirst({
    where: eq(users.username, username),
  });

  if (existingUser) {
    return { error: "El usuario ya está registrado" };
  }

  const hashedPassword = await argon2.hash(password);

  await db.insert(users).values({
    name: name,
    username: username,
    password: hashedPassword,
  });

  return { success: "Usuario registrado" };
};
