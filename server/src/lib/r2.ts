import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

import { config } from "../config/env.js";

let client: S3Client | undefined;

const getClient = () =>
  (client ??= new S3Client({
    region: "auto",
    endpoint: `https://${config.r2.accountId}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId: config.r2.accessKeyId,
      secretAccessKey: config.r2.secretAccessKey,
    },
  }));

/** Public URL for an R2 object key. The DB only ever stores keys. */
export const publicUrl = (key: string) => {
  const base = config.r2.publicBaseUrl.replace(/\/+$/, "");
  const path = key
    .replace(/^\/+/, "")
    .split("/")
    .map(encodeURIComponent)
    .join("/");
  return `${base}/${path}`;
};

/** Presigned PUT URL (10 min) for direct browser uploads. Reserved for admin use. */
export const createUploadUrl = (key: string, contentType: string, expiresInSeconds = 600) =>
  getSignedUrl(
    getClient(),
    new PutObjectCommand({ Bucket: config.r2.bucket, Key: key, ContentType: contentType }),
    { expiresIn: expiresInSeconds },
  );
