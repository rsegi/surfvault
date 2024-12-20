import { describe, it, expect } from "vitest";
import { createSession } from "../../src/lib/createSessionServerAction";
import { db } from "db";
import { sessions } from "db/schema";
import { eq } from "drizzle-orm";
import { s3Client } from "api/s3/s3Service";
import { clearTestBucket, setupTests } from "test/setup";

let USER_ID: string;

describe("createSession", () => {
  beforeAll(async () => {
    USER_ID = await setupTests("createSession");
  });

  afterAll(async () => {
    await clearTestBucket();
  });

  it("should create a session and save it in the database and minio", async () => {
    const formData = new FormData();
    formData.append("userId", USER_ID);
    formData.append("latitude", "34.05220");
    formData.append("longitude", "-118.24370");
    formData.append("title", "Morning Surf");
    formData.append("date", "2023-01-01");
    formData.append("time", "08:00:00");

    const mockFile = new File(["file content"], "file0.jpg", {
      type: "image",
    });
    formData.append("file0", mockFile);
    formData.append("fileType0", "image");

    const result = await createSession(formData);

    expect(result?.createdSession).toBeDefined();

    const stream = s3Client.listObjectsV2(
      process.env.S3_BUCKET_NAME!,
      `${result!.createdSession}/`
    );
    const files = [];
    for await (const obj of stream) {
      if (obj.name) {
        files.push({ name: obj.name });
      }
    }

    const createdSession = await db
      .select()
      .from(sessions)
      .where(eq(sessions.id, result!.createdSession));

    expect(createdSession.length).toBe(1);
    expect(createdSession[0]).toMatchObject({
      userId: USER_ID,
      latitude: "34.05220",
      longitude: "-118.24370",
      title: "Morning Surf",
      date: new Date("2023-01-01"),
      time: "08:00:00",
    });
    expect(files.length).toBe(1);
    expect(files[0].name).toBe(`${result!.createdSession}/file0`);
  });

  it("should fail to create a session with missing required data", async () => {
    const formData = new FormData();
    formData.append("latitude", "37.7749");
    formData.append("longitude", "-122.4194");
    formData.append("title", "Incomplete Session");
    formData.append("date", "2023-12-20");
    formData.append("time", "10:00:00");

    const result = await createSession(formData);

    expect(result).toBeUndefined();
  });

  it("should rollback changes if file upload fails", async () => {
    const formData = new FormData();
    formData.append("userId", USER_ID);
    formData.append("latitude", "34.0522");
    formData.append("longitude", "-118.2437");
    formData.append("title", "Rollback Session");
    formData.append("date", "2023-12-21");
    formData.append("time", "11:00:00");
    const faultyFile = new File(["corrupted content"], "file1.jpg", {
      type: "image",
    });
    formData.append("file1", faultyFile);
    formData.append("file1Type", "image");

    const originalPutObject = s3Client.putObject;
    s3Client.putObject = vi.fn(() => {
      throw new Error("Simulated MinIO failure");
    });

    await expect(createSession(formData)).rejects.toThrow("Rollback");

    const session = await db
      .select()
      .from(sessions)
      .where(eq(sessions.title, "Rollback Session"));
    expect(session).toHaveLength(0);

    s3Client.putObject = originalPutObject;
  });
});
