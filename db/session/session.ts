import { createSurfConditions } from "db/surf-condition/surfCondition";
import { sessions } from "db/schema";
import { PgTransaction } from "drizzle-orm/pg-core";
import { NodePgQueryResultHKT } from "drizzle-orm/node-postgres";
import { ExtractTablesWithRelations } from "drizzle-orm";
import * as schema from "../schema";

export const insertSession = async (
  tx: PgTransaction<
    NodePgQueryResultHKT,
    typeof schema,
    ExtractTablesWithRelations<typeof schema>
  >,
  userId: string,
  latitude: number,
  longitude: number,
  title: string,
  date: string
) => {
  const parsedLatitude = latitude.toString();
  const parsedLongitude = longitude.toString();
  try {
    const [createdSession] = await tx
      .insert(sessions)
      .values({
        userId,
        latitude: parsedLatitude,
        longitude: parsedLongitude,
        title,
        date,
      })
      .returning({ createdSession: sessions.id });

    await createSurfConditions(
      tx,
      createdSession.createdSession,
      parsedLatitude,
      parsedLongitude,
      date
    );

    return createdSession;
  } catch (e) {
    console.error("Error creating session:", e);
  }
};
