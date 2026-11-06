import crypto from "node:crypto";

// Upload rules shared by the presign, attach and video endpoints.

export const IMAGE_TYPES: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/avif": "avif",
};

export const VIDEO_TYPES: Record<string, string> = {
  "video/mp4": "mp4",
  "video/webm": "webm",
};

export const MAX_IMAGE_BYTES = 10 * 1024 * 1024;
export const MAX_VIDEO_BYTES = 50 * 1024 * 1024;
export const MAX_IMAGES_PER_DESTINATION = 20;

export const isImageType = (contentType: string | undefined): contentType is string =>
  contentType !== undefined && contentType in IMAGE_TYPES;

export const isVideoType = (contentType: string | undefined): contentType is string =>
  contentType !== undefined && contentType in VIDEO_TYPES;

/** The server picks the path; the client never chooses where a file goes. */
export type MediaFolder = "destinations" | "categories";

export const generateKey = (folder: MediaFolder, slug: string, contentType: string): string => {
  const extension = IMAGE_TYPES[contentType] ?? VIDEO_TYPES[contentType];
  return `${folder}/${slug}/${crypto.randomBytes(12).toString("hex")}.${extension}`;
};

const KEY_PATTERN = /^(destinations|categories)\/[a-z0-9-]+\/[A-Za-z0-9_-]{6,64}\.(jpg|png|webp|avif|mp4|webm)$/;

/** Keys the admin API will accept back from the browser after an upload. */
export const isUploadKey = (key: string, folder: MediaFolder = "destinations"): boolean =>
  KEY_PATTERN.test(key) && key.startsWith(`${folder}/`);

const YOUTUBE_ID = /^[A-Za-z0-9_-]{11}$/;
const YOUTUBE_HOSTS = new Set(["youtube.com", "www.youtube.com", "m.youtube.com", "youtube-nocookie.com", "www.youtube-nocookie.com"]);

/**
 * Accepts watch, share (youtu.be), embed, shorts and live links from YouTube and returns
 * the canonical embed URL. Anything else (other hosts, other paths) returns null.
 */
export const parseYouTubeUrl = (input: string): string | null => {
  let url: URL;
  try {
    url = new URL(input.trim());
  } catch {
    return null;
  }
  if (url.protocol !== "https:" && url.protocol !== "http:") return null;

  const host = url.hostname.toLowerCase();
  const parts = url.pathname.split("/").filter(Boolean);
  let id: string | undefined;

  if (host === "youtu.be") {
    id = parts[0];
  } else if (YOUTUBE_HOSTS.has(host)) {
    if (parts[0] === "watch") id = url.searchParams.get("v") ?? undefined;
    else if (["embed", "shorts", "live", "v"].includes(parts[0] ?? "")) id = parts[1];
  }

  return id && YOUTUBE_ID.test(id) ? `https://www.youtube.com/embed/${id}` : null;
};
