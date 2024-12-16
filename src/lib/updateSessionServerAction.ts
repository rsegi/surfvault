"use server";

import { updateSessionById } from "api/session/session";
import { db } from "db";

export const updateSession = async (formData: FormData) => {
  const sessionId = formData.get("sessionId") as string;
  const latitude = formData.get("latitude") as string;
  const longitude = formData.get("longitude") as string;
  const title = formData.get("title") as string;
  const date = formData.get("date") as string;
  const time = formData.get("time") as string;
  const previousLatitude = formData.get("previousLatitude") as string;
  const previousLongitude = formData.get("previousLongitude") as string;
  const previousDate = formData.get("previousDate") as string;

  const updatedSession = await db.transaction(async (tx) => {
    const updatedSession = await updateSessionById(
      sessionId,
      tx,
      latitude,
      previousLatitude,
      longitude,
      previousLongitude,
      title,
      date,
      previousDate,
      time
    );

    return updatedSession;
  });

  return updatedSession;
};
