import { PgTransaction } from "drizzle-orm/pg-core";
import { NodePgQueryResultHKT } from "drizzle-orm/node-postgres";
import { asc, eq, ExtractTablesWithRelations } from "drizzle-orm";
import { db } from "db";
import * as schema from "../../db/schema";
import { createSurfConditions } from "api/surf-condition/surfCondition";
import { getFilesFromBucketByPrefix } from "api/s3/s3Service";

const { sessions } = schema;

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

export const getSessionsByUser = async (
  userId: string
): Promise<SessionByUser[]> => {
  const preparedUserSessions = await db.query.sessions
    .findMany({
      with: {
        surfConditions: {
          orderBy: [asc(schema.surfConditions.dateTime)],
        },
      },
      where: eq(sessions.userId, userId),
    })
    .prepare("getSessionsByUser");

  const userSessions = await preparedUserSessions.execute();

  const fileUrlsPromises = userSessions.map((session) =>
    getFilesFromBucketByPrefix(`${session.id}/`)
  );

  const fileUrls = await Promise.all(fileUrlsPromises);

  const sessionsWithFiles: SessionByUser[] = userSessions.map(
    (session, index) => ({
      ...session,
      fileUrls: fileUrls[index],
    })
  );

  return sessionsWithFiles;
};

export type SessionByUser = {
  id: string;
  title: string;
  date: string;
  fileUrls: FileUrl[] | null;
  surfConditions: SessionSurfCondition[];
};

export type FileUrl = {
  name: string;
  url: string;
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
