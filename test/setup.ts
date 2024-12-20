import { s3Client } from "api/s3/s3Service";
import { users } from "db/schema";
import { sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";

const TEST_BUCKET_NAME = "surfvault-test";

export const setupTests = async (username: string): Promise<string> => {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
  });
  const testDb = drizzle({ client: pool });

  const query = sql<string>`SELECT table_name
          FROM information_schema.tables
          WHERE table_schema = 'public'
            AND table_type = 'BASE TABLE';
        `;

  const tables = await testDb.execute(query);

  for (const table of tables.rows) {
    const query = sql.raw(
      `TRUNCATE TABLE "${table.table_name}" RESTART IDENTITY CASCADE;`
    );
    await testDb.execute(query);
  }

  const [userId] = await testDb
    .insert(users)
    .values({
      name: "test",
      username: username,
      password: "11111111",
    })
    .returning({ id: users.id });

  const bucketExists = await s3Client.bucketExists(TEST_BUCKET_NAME);

  if (!bucketExists) {
    await s3Client.makeBucket(TEST_BUCKET_NAME);
  }

  return userId.id;
};

export const clearTestBucket = async () => {
  const objects = s3Client.listObjectsV2(process.env.S3_BUCKET_NAME!);
  for await (const obj of objects) {
    if (obj.name) {
      await s3Client.removeObject(process.env.S3_BUCKET_NAME!, obj.name);
    }
  }
};
