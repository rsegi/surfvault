import { FileUrl } from "api/session/session";
import * as Minio from "minio";
import internal from "stream";

const BUCKET_NAME = "surfvault";

export const s3Client = new Minio.Client({
  endPoint: process.env.S3_ENDPOINT!,
  port: process.env.S3_PORT ? Number(process.env.S3_PORT) : undefined,
  accessKey: process.env.S3_USER!,
  secretKey: process.env.S3_SECRET!,
  useSSL: process.env.S3_USE_SSL === "true",
});

export const createBucketIfNotExists = async () => {
  const bucketExists = await s3Client.bucketExists(BUCKET_NAME);
  if (!bucketExists) {
    await s3Client.makeBucket(BUCKET_NAME);
  }
};

export const saveFileInBucket = async (
  fileName: string,
  file: Buffer | internal.Readable,
  fileType: string
) => {
  await createBucketIfNotExists();

  await s3Client.putObject(BUCKET_NAME, fileName, file, undefined, {
    "Content-Type": fileType,
  });
};

export const getFileFromBucket = async (fileName: string) => {
  try {
    await s3Client.statObject(BUCKET_NAME, fileName);
  } catch (error) {
    console.error(error);
    return null;
  }
  return await s3Client.getObject(BUCKET_NAME, fileName);
};

const listFilesFromBucketByPrefix = async (prefix: string) => {
  const files = [];
  try {
    const stream = s3Client.listObjectsV2(BUCKET_NAME, prefix);
    for await (const obj of stream) {
      if (obj.name) {
        files.push({ name: obj.name });
      }
    }
  } catch (error) {
    console.error("Error listing files from bucket:", error);
    throw error;
  }
  return files;
};

export const getFilesFromBucketByPrefix = async (prefix: string) => {
  try {
    const filesUrls: FileUrl[] = [];
    const files = await listFilesFromBucketByPrefix(prefix);

    for (const file of files) {
      try {
        const metadata = await s3Client.statObject(BUCKET_NAME, file.name);
        console.log(`metadata: ${JSON.stringify(metadata.metaData)}`);
        const presignedUrl = await createPresignedUrlToDownload(file.name);

        filesUrls.push({
          name: file.name,
          url: presignedUrl,
          type: metadata.metaData["content-type"] ?? "unknown",
        });
      } catch (err) {
        console.error(`Error fetching content for ${file.name}:`, err);
      }
    }

    return filesUrls;
  } catch (error) {
    console.error("Error fetching files from bucket:", error);
    return null;
  }
};

export const deleteFilesFromBucketByPrefix = async (prefix: string) => {
  try {
    const files = await listFilesFromBucketByPrefix(prefix);

    for (const file of files) {
      try {
        await deleteFileFromBucket(file.name);
      } catch (err) {
        console.error(`Error deleting content for ${file.name}:`, err);
      }
    }
  } catch (error) {
    console.error("Error fetching files from bucket:", error);
  }
};

export const deleteFileFromBucket = async (fileName: string) => {
  try {
    await s3Client.removeObject(BUCKET_NAME, fileName);
  } catch (error) {
    console.error(error);
    return false;
  }
  return true;
};

export const createPresignedUrlToUpload = async (
  fileName: string,
  expiry?: number
) => {
  expiry = expiry ?? 24 * 60 * 60; // 1 day
  await createBucketIfNotExists();

  return await s3Client.presignedPutObject(BUCKET_NAME, fileName, expiry);
};

export const createPresignedUrlToDownload = async (
  fileName: string,
  expiry?: number
) => {
  expiry = expiry ?? 24 * 60 * 60; // 1 day
  return await s3Client.presignedGetObject(BUCKET_NAME, fileName, expiry);
};
