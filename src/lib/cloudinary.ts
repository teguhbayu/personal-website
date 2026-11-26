import crypto from "node:crypto";

export const ALLOWED_UPLOAD_FOLDERS = [
  "projects",
  "certs",
  "blog",
  "profile",
] as const;

export type UploadFolder = (typeof ALLOWED_UPLOAD_FOLDERS)[number];

export interface CloudinarySignedPayload {
  uploadUrl: string;
  cloudName: string;
  apiKey: string;
  timestamp: number;
  folder: string;
  signature: string;
}

function parseCloudinaryUrl(): {
  cloudName: string;
  apiKey: string;
  apiSecret: string;
} {
  const raw = process.env.CLOUDINARY_URL?.trim();
  if (!raw) {
    throw new Error("CLOUDINARY_URL is not configured.");
  }

  let parsed: URL;
  try {
    parsed = new URL(raw);
  } catch {
    throw new Error("CLOUDINARY_URL is not a valid URL.");
  }

  if (parsed.protocol !== "cloudinary:") {
    throw new Error("CLOUDINARY_URL must use the cloudinary:// protocol.");
  }

  const apiKey = decodeURIComponent(parsed.username);
  const apiSecret = decodeURIComponent(parsed.password);
  const cloudName = parsed.hostname;

  if (!apiKey || !apiSecret || !cloudName) {
    throw new Error("CLOUDINARY_URL is missing credentials or cloud name.");
  }

  return { cloudName, apiKey, apiSecret };
}

export function isAllowedUploadFolder(value: unknown): value is UploadFolder {
  return (
    typeof value === "string" &&
    (ALLOWED_UPLOAD_FOLDERS as readonly string[]).includes(value)
  );
}

export function createCloudinaryUploadSignature(
  subfolder: UploadFolder,
): CloudinarySignedPayload {
  const { cloudName, apiKey, apiSecret } = parseCloudinaryUrl();
  const timestamp = Math.floor(Date.now() / 1000);
  const folder = `portfolio-website/${subfolder}`;
  const toSign = `folder=${folder}&timestamp=${timestamp}${apiSecret}`;
  const signature = crypto.createHash("sha1").update(toSign).digest("hex");

  return {
    uploadUrl: `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
    cloudName,
    apiKey,
    timestamp,
    folder,
    signature,
  };
}
