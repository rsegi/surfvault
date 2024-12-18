"use server";

import { db } from "db";
import { insertSession } from "api/session/session";
import { saveFileInBucket } from "api/s3/s3Service";

export const createSession = async (formData: FormData) => {
  const userId = formData.get("userId") as string;
  const latitude = formData.get("latitude") as string;
  const longitude = formData.get("longitude") as string;
  const title = formData.get("title") as string;
  const date = formData.get("date") as string;
  const time = formData.get("time") as string;
  const createdSession = await db.transaction(async (tx) => {
    const createdSession = await insertSession(
      tx,
      userId,
      latitude,
      longitude,
      title,
      date,
      time
    );

    if (!createdSession) {
      return;
    }

    try {
      for (const [key, value] of formData.entries()) {
        if (key.startsWith("file") && value instanceof File) {
          const file = value;
          const fileKey = key.replace("file", "fileType");
          const fileType = formData.get(fileKey) as string;

          const fileBuffer = await file.arrayBuffer();
          await saveFileInBucket(
            `${createdSession.createdSession}/${key}`,
            Buffer.from(fileBuffer),
            fileType
          );
        }
      }
    } catch (error) {
      console.error("Error saving files:", error);
      tx.rollback();
      throw new Error("Failed to save files");
    }

    return createdSession;
  });

  return createdSession;
};
