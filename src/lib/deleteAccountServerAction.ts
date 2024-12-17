"use server";

import { deleteFilesFromBucketByPrefix } from "api/s3/s3Service";
import { getSessionsByUser } from "api/session/session";
import { deleteUserById } from "api/user/user";
import { db } from "db";

export const deleteAccount = async (userId: string) => {
  await db.transaction(async (tx) => {
    try {
      const sessionsIds = (await getSessionsByUser(userId)).map((s) => s.id);

      await deleteUserById(userId, tx);

      sessionsIds.forEach(async (sid) => {
        await deleteFilesFromBucketByPrefix(`${sid}/`);
      });
    } catch (e) {
      console.error("Error deleting account:", e);
      tx.rollback();
    }
  });
};
