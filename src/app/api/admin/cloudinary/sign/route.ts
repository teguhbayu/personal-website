import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/admin-auth";
import {
  ALLOWED_UPLOAD_FOLDERS,
  createCloudinaryUploadSignature,
  isAllowedUploadFolder,
} from "@/lib/cloudinary";

export async function POST(request: Request) {
  const auth = await getAdminSession();
  if (auth.status === "unauthenticated") {
    return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  }
  if (auth.status === "unauthorized") {
    return NextResponse.json({ error: "Account not authorized." }, { status: 403 });
  }

  let body: { folder?: unknown };
  try {
    body = (await request.json()) as { folder?: unknown };
  } catch {
    return NextResponse.json({ error: "Invalid JSON payload." }, { status: 400 });
  }

  if (!isAllowedUploadFolder(body.folder)) {
    return NextResponse.json(
      {
        error: `Invalid folder. Allowed folders: ${ALLOWED_UPLOAD_FOLDERS.join(", ")}.`,
      },
      { status: 400 },
    );
  }

  try {
    const signed = createCloudinaryUploadSignature(body.folder);
    return NextResponse.json(signed);
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Failed to sign Cloudinary upload.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
