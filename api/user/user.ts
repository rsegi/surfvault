import { db } from "db";
import { users } from "db/schema";
import { eq, ExtractTablesWithRelations } from "drizzle-orm";
import { NodePgQueryResultHKT } from "drizzle-orm/node-postgres";
import { PgTransaction } from "drizzle-orm/pg-core";
import * as schema from "../../db/schema";

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

export const deleteUserById = async (
  id: string,
  tx: PgTransaction<
    NodePgQueryResultHKT,
    typeof schema,
    ExtractTablesWithRelations<typeof schema>
  >
) => {
  try {
    await tx.delete(users).where(eq(users.id, id));
  } catch (e) {
    console.error(e);
  }
};
