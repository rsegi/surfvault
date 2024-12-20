import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { db } from "db";
import { eq } from "drizzle-orm";
import { deleteAccount } from "../../src/lib/deleteAccountServerAction";
import { s3Client } from "../../api/s3/s3Service";
import { clearTestBucket, setupTests } from "test/setup";
import { sessions, users } from "db/schema";

const BUCKET_NAME = process.env.S3_BUCKET_NAME!;

describe("deleteAccountServerAction", () => {
  beforeAll(async () => {
    await setupTests("deleteAccount");
  });

  afterAll(async () => {
    await clearTestBucket();
  });
  it("should delete the account and associated files", async () => {
    // Insert a mock user and related data
    const [mockUserId] = await db
      .insert(users)
      .values({ id: "user123", username: "userToDelete", password: "12345678" })
      .returning({ userId: users.id });
    const [sessionId] = await db
      .insert(sessions)
      .values({
        userId: mockUserId.userId,
        latitude: "34.0522",
        longitude: "-118.2437",
        title: "Test Session",
        date: new Date("2023-01-01"),
        time: "08:00:00",
      })
      .returning({ sessionId: sessions.id });

    await s3Client.putObject(
      BUCKET_NAME,
      `${sessionId.sessionId}/file0`,
      Buffer.from("mock file")
    );

    await deleteAccount("user123");

    const user = await db
      .select()
      .from(users)
      .where(eq(users.id, mockUserId.userId));
    const userSessions = await db
      .select()
      .from(sessions)
      .where(eq(sessions.userId, mockUserId.userId));

    expect(user).toHaveLength(0);
    expect(userSessions).toHaveLength(0);

    const stream = await s3Client.listObjectsV2(
      BUCKET_NAME,
      `${sessionId.sessionId}/`
    );
    const files = [];
    for await (const obj of stream) {
      if (obj.name) {
        files.push({ name: obj.name });
      }
    }
    expect(files).toHaveLength(0);
  });
});
