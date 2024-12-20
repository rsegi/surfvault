import { updateSession } from "@/lib/updateSessionServerAction";
import { db } from "db";
import { eq } from "drizzle-orm";
import { sessions } from "db/schema";
import { clearTestBucket, setupTests } from "test/setup";

let USER_ID: string;

describe("updateSessionServerAction", () => {
  beforeAll(async () => {
    USER_ID = await setupTests("updateSession");
  });

  afterAll(async () => {
    await clearTestBucket();
  });
  it("should update the session and handle files correctly", async () => {
    const [sessionId] = await db
      .insert(sessions)
      .values({
        id: "session789",
        userId: USER_ID,
        latitude: "51.5074",
        longitude: "-0.1278",
        title: "Test Session 3",
        date: new Date("2023-03-01"),
        time: "10:00:00",
      })
      .returning({ id: sessions.id });

    const formData = new FormData();
    formData.append("sessionId", sessionId.id);
    formData.append("latitude", "48.85660");
    formData.append("longitude", "2.35220");
    formData.append("title", "Updated Session Title");
    formData.append("date", "2023-03-15");
    formData.append("time", "11:00:00");

    await updateSession(formData);

    const updatedSession = await db
      .select()
      .from(sessions)
      .where(eq(sessions.id, sessionId.id));
    expect(updatedSession[0].title).toBe("Updated Session Title");
    expect(updatedSession[0].latitude).toBe("48.85660");
    expect(updatedSession[0].longitude).toBe("2.35220");
  });
});
