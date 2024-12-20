import { deleteSession } from "@/lib/deleteSessionServerAction";
import { s3Client } from "api/s3/s3Service";
import { db } from "db";
import { eq } from "drizzle-orm";
import { sessions } from "db/schema";
import { clearTestBucket, setupTests } from "test/setup";

let USER_ID: string;
const BUCKET_NAME = process.env.S3_BUCKET_NAME!;

describe("deleteSessionServerAction", () => {
  beforeAll(async () => {
    USER_ID = await setupTests("deleteSession");
  });

  afterAll(async () => {
    await clearTestBucket();
  });
  it("should delete the session and associated files", async () => {
    const [sessionId] = await db
      .insert(sessions)
      .values({
        id: "session456",
        userId: USER_ID,
        latitude: "40.7128",
        longitude: "-74.0060",
        title: "Test Session 2",
        date: new Date("2023-02-01"),
        time: "09:00:00",
      })
      .returning({ id: sessions.id });

    await s3Client.putObject(
      BUCKET_NAME,
      `${sessionId.id}/file0`,
      Buffer.from("mock file")
    );

    await deleteSession(sessionId.id);

    const session = await db
      .select()
      .from(sessions)
      .where(eq(sessions.id, sessionId.id));
    expect(session).toHaveLength(0);

    const stream = await s3Client.listObjectsV2(
      BUCKET_NAME,
      `${sessionId.id}/`
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
