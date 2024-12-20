"use server";

import { deleteFilesFromBucketByPrefix } from "api/s3/s3Service";
import { deleteSessionById } from "api/session/session";
import { db } from "db";

export const deleteSession = async (id: string) => {
  await db.transaction(async (tx) => {
    try {
      await deleteSessionById(tx, id);

      await deleteFilesFromBucketByPrefix(`${id}/`);
    } catch (error) {
      console.error("Error deleting session:", error);
      tx.rollback();
    }
  });
};
