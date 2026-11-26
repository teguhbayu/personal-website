import type { UploadFolder } from "@/lib/cloudinary";

export async function uploadFileToCloudinary(
  file: File,
  folder: UploadFolder,
): Promise<{ secureUrl: string; folder: string }> {
  const signRes = await fetch("/api/admin/cloudinary/sign", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ folder }),
  });

  const signData = await signRes.json();
  if (!signRes.ok) {
    throw new Error(signData?.error || "Could not prepare upload URL.");
  }

  const formData = new FormData();
  formData.append("file", file);
  formData.append("api_key", signData.apiKey);
  formData.append("timestamp", String(signData.timestamp));
  formData.append("folder", signData.folder);
  formData.append("signature", signData.signature);

  const uploadRes = await fetch(signData.uploadUrl, {
    method: "POST",
    body: formData,
  });

  const uploadData = await uploadRes.json();
  if (!uploadRes.ok || !uploadData?.secure_url) {
    throw new Error(
      uploadData?.error?.message || "Cloudinary rejected the upload.",
    );
  }

  return {
    secureUrl: String(uploadData.secure_url),
    folder: String(signData.folder),
  };
}
