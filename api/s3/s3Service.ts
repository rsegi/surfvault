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
  file: Buffer | internal.Readable
) => {
  await createBucketIfNotExists();

  const fileExists = await checkFileExistsInBucket(fileName);

  if (fileExists) {
    throw new Error("File already exists");
  }

  await s3Client.putObject(BUCKET_NAME, fileName, file);
};

export const checkFileExistsInBucket = async (fileName: string) => {
  try {
    await s3Client.statObject(BUCKET_NAME, fileName);
  } catch {
    return false;
  }
  return true;
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

export const getFilesFromBucketByPrefix = async (prefix: string) => {
  try {
    const filesUrls: FileUrl[] = [];

    console.log("Prefix", prefix);
    const stream = s3Client.listObjectsV2(BUCKET_NAME, prefix);
    console.log("Stream", stream);

    for await (const obj of stream) {
      if (!obj.name) {
        console.log("Skipping prefix entry:", obj);
        continue;
      }
      const objectName = obj.name;
      console.log("Object", obj);

      try {
        const presignedUrl = await createPresignedUrlToDownload(objectName);

        filesUrls.push({
          name: objectName,
          url: presignedUrl,
        });
      } catch (err) {
        console.error(`Error fetching content for ${objectName}:`, err);
      }
    }

    return filesUrls;
  } catch (error) {
    console.error("Error fetching files from bucket:", error);
    return null;
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
  expiry = expiry ? expiry : 60 * 60; // 1 hour
  await createBucketIfNotExists();

  return await s3Client.presignedPutObject(BUCKET_NAME, fileName, expiry);
};

export const createPresignedUrlToDownload = async (
  fileName: string,
  expiry?: number
) => {
  expiry = expiry ? expiry : 24 * 60 * 60; // 1 day
  return await s3Client.presignedGetObject(BUCKET_NAME, fileName, expiry);
};
