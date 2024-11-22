import { createSurfConditions } from "db/surf-condition/surfCondition";
import { db } from "db";
import { sesssions } from "db/schema";

type NewSession = typeof sesssions.$inferInsert;

export const createSession = async (
  userId: string,
  latitude: number,
  longitude: number,
  title: string,
  location: string,
  date: string
) => {
  const parsedLatitude = latitude.toString();
  const parsedLongitude = longitude.toString();
  try {
    const [createdSession] = await db
      .insert(sesssions)
      .values({
        userId,
        latitude: parsedLatitude,
        longitude: parsedLongitude,
        title,
        location,
        date,
      })
      .returning({ createdSession: sesssions.id });

    await createSurfConditions(
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
