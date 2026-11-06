import {
  DeleteObjectCommand,
  HeadObjectCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
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

/**
 * Presigned PUT URL (10 min) for direct browser uploads. The content type and length
 * are part of the signature, so R2 rejects an upload that does not match what the
 * admin declared.
 */
export const createUploadUrl = (
  key: string,
  contentType: string,
  contentLength?: number,
  expiresInSeconds = 600,
) =>
  getSignedUrl(
    getClient(),
    new PutObjectCommand({
      Bucket: config.r2.bucket,
      Key: key,
      ContentType: contentType,
      ...(contentLength !== undefined ? { ContentLength: contentLength } : {}),
    }),
    {
      expiresIn: expiresInSeconds,
      signableHeaders: new Set(["content-type", ...(contentLength !== undefined ? ["content-length"] : [])]),
    },
  );

export interface ObjectInfo {
  contentType: string | undefined;
  contentLength: number;
}

/** HEAD request for an object. Resolves to null when it does not exist. */
export const headObject = async (key: string): Promise<ObjectInfo | null> => {
  try {
    const result = await getClient().send(new HeadObjectCommand({ Bucket: config.r2.bucket, Key: key }));
    return { contentType: result.ContentType, contentLength: result.ContentLength ?? 0 };
  } catch (error) {
    const status = (error as { $metadata?: { httpStatusCode?: number } }).$metadata?.httpStatusCode;
    const name = (error as { name?: string }).name;
    if (status === 404 || name === "NotFound" || name === "NoSuchKey") return null;
    throw error;
  }
};

export const deleteObject = async (key: string): Promise<void> => {
  await getClient().send(new DeleteObjectCommand({ Bucket: config.r2.bucket, Key: key }));
};
