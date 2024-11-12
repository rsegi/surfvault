import { db } from "db";
import { users } from "db/schema";
import { eq } from "drizzle-orm";

export const getUserById = async (id: string) => {
  try {
    const user = await db.query.users.findFirst({ where: eq(users.id, id) });

    return user;
  } catch {
    return undefined;
  }
};

export const getUserByUsername = async (username: string) => {
  try {
    const user = await db.query.users.findFirst({
      where: eq(users.username, username),
    });

    return user;
  } catch {
    return undefined;
  }
};
