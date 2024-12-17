import { PgTransaction } from "drizzle-orm/pg-core";
import { NodePgQueryResultHKT } from "drizzle-orm/node-postgres";
import { asc, count, desc, eq, ExtractTablesWithRelations } from "drizzle-orm";
import { db } from "db";
import * as schema from "../../db/schema";
import {
  createSurfConditions,
  updateSurfConditionsBySessionId,
} from "api/surf-condition/surfCondition";
import { getFilesFromBucketByPrefix } from "api/s3/s3Service";
import { format, parse } from "date-fns";

const { sessions } = schema;

export const insertSession = async (
  tx: PgTransaction<
    NodePgQueryResultHKT,
    typeof schema,
    ExtractTablesWithRelations<typeof schema>
  >,
  userId: string,
  latitude: string,
  longitude: string,
  title: string,
  date: string,
  time: string
) => {
  const parsedDate = new Date(date);
  try {
    const [createdSession] = await tx
      .insert(sessions)
      .values({
        userId,
        latitude,
        longitude,
        title,
        date: parsedDate,
        time,
      })
      .returning({ createdSession: sessions.id });

    await createSurfConditions(
      tx,
      createdSession.createdSession,
      latitude,
      longitude,
      date
    );

    return createdSession;
  } catch (e) {
    console.error("Error creating session:", e);
  }
};

export const getSessionsByUser = async (
  userId: string,
  page: number = 1,
  itemsPerPage: number = 5
): Promise<SessionResponse[]> => {
  const offset = (page - 1) * itemsPerPage;
  const userSessions = await db.query.sessions
    .findMany({
      with: {
        surfConditions: {
          orderBy: [asc(schema.surfConditions.dateTime)],
        },
      },
      where: eq(sessions.userId, userId),
      orderBy: [desc(schema.sessions.date)],
      limit: itemsPerPage,
      offset: offset,
    })
    .execute();

  const fileUrlsPromises = userSessions.map((session) =>
    getFilesFromBucketByPrefix(`${session.id}/`)
  );

  const fileUrls = await Promise.all(fileUrlsPromises);

  const sessionsWithFiles: SessionResponse[] = userSessions.map(
    (session, index) => ({
      ...session,
      fileUrls: fileUrls[index],
    })
  );

  return sessionsWithFiles;
};

export const getTotalSessionsCount = async (
  userId: string
): Promise<number> => {
  const result = await db
    .select({ count: count() })
    .from(sessions)
    .where(eq(sessions.userId, userId))
    .execute();

  return result[0].count;
};

export const getSessionById = async (id: string): Promise<SessionResponse> => {
  const preparedSession = await db.query.sessions
    .findFirst({
      with: {
        surfConditions: {
          orderBy: [asc(schema.surfConditions.dateTime)],
        },
      },
      where: eq(sessions.id, id),
    })
    .prepare("getSessionById");

  const session = await preparedSession.execute();

  const fileUrls = await getFilesFromBucketByPrefix(`${id}/`);

  const sessionWithFiles: SessionResponse = {
    ...session!,
    fileUrls: fileUrls,
  };

  return sessionWithFiles;
};

export const deleteSessionById = async (
  tx: PgTransaction<
    NodePgQueryResultHKT,
    typeof schema,
    ExtractTablesWithRelations<typeof schema>
  >,
  id: string
): Promise<void> => {
  try {
    await tx
      .delete(sessions)
      .where(eq(sessions.id, id))
      .returning({ deletedSession: sessions.id });
  } catch (e) {
    console.error("Error deleting session:", e);
  }
};

export const updateSessionById = async (
  sessionId: string,
  tx: PgTransaction<
    NodePgQueryResultHKT,
    typeof schema,
    ExtractTablesWithRelations<typeof schema>
  >,
  latitude: string,
  previousLatitude: string,
  longitude: string,
  previousLongitude: string,
  title: string,
  date: string,
  previousDate: string,
  time: string
) => {
  const parsedDate = new Date(date);
  try {
    const [updatedSession] = await tx
      .update(sessions)
      .set({
        date: parsedDate,
        title,
        time,
        latitude,
        longitude,
      })
      .where(eq(sessions.id, sessionId))
      .returning({ updatedSession: sessions.id });

    const normalizedNewDate = format(
      parse(date, "yyyy-MM-dd", new Date()),
      "yyyy-MM-dd"
    );
    const normalizedPreviousDate = format(new Date(previousDate), "yyyy-MM-dd");

    if (
      latitude !== previousLatitude ||
      longitude !== previousLongitude ||
      normalizedNewDate !== normalizedPreviousDate
    ) {
      console.log("Data differs: Updating conditions");
      await updateSurfConditionsBySessionId(
        tx,
        sessionId,
        latitude,
        longitude,
        date
      );
    }

    return updatedSession;
  } catch (e) {
    console.error(`Error updating session ${sessionId}: ${e}`);
  }
};

export type SessionResponse = {
  id: string;
  title: string;
  date: Date;
  time: string;
  latitude: string;
  longitude: string;
  fileUrls: FileUrl[] | null;
  surfConditions: SessionSurfCondition[];
};

export type FileUrl = {
  name: string;
  url: string;
  type: string;
};

export type SessionSurfCondition = {
  dateTime: string;
  waveHeight: number;
  waveDirection: number;
  wavePeriod: number;
  windSpeed: number;
  windDirection: number;
  windGusts: number;
  temperature: number;
  waterTemperature: number;
  weatherCode: number;
};
