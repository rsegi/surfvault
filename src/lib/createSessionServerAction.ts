"use server";

import { db } from "db";
import { insertSession } from "api/session/session";
import { saveFileInBucket } from "api/s3/s3Service";

export const createSession = async (formData: FormData) => {
  const userId = formData.get("userId") as string;
  const latitude = parseFloat(formData.get("latitude") as string);
  const longitude = parseFloat(formData.get("longitude") as string);
  const title = formData.get("title") as string;
  const date = formData.get("date") as string;
  const createdSession = await db.transaction(async (tx) => {
    const createdSession = await insertSession(
      tx,
      userId,
      latitude,
      longitude,
      title,
      date
    );

    if (!createdSession) {
      return;
    }

    const filePromises = [];
    for (const [key, value] of formData.entries()) {
      if (key.startsWith("file") && value instanceof File) {
        const file = value;
        const fileBuffer = await file.arrayBuffer();
        const savePromise = saveFileInBucket(
          `${createdSession.createdSession}/${key}`,
          Buffer.from(fileBuffer)
        ).catch((error) => {
          console.error(`Failed to save file ${key}:`, error);
          throw error;
        });
        filePromises.push(savePromise);
      }
    }

    try {
      await Promise.all(filePromises);
    } catch (error) {
      console.error("Error saving files:", error);
      await tx.rollback();
      throw new Error("Failed to save files");
    }

    return createdSession;
  });

  return createdSession;
};
