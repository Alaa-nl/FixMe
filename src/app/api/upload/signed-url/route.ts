import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { randomUUID } from "crypto";
import { supabaseAdmin } from "@/lib/supabase";

const MAX_VIDEO_SIZE = 50 * 1024 * 1024; // 50MB
const ALLOWED_VIDEO_TYPES = ["video/mp4", "video/quicktime"];

const ALLOWED_BUCKETS = [
  "profile-images",
  "repair-media",
  "dispute-evidence",
  "fixer-portfolio",
  "marketing-media",
] as const;

type BucketName = (typeof ALLOWED_BUCKETS)[number];

/**
 * Returns a signed upload URL so the browser can upload large files
 * (like videos) directly to Supabase Storage, bypassing the 4.5MB
 * Vercel serverless body-size limit.
 */
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session || !session.user) {
      return NextResponse.json(
        { error: "Unauthorized. Please log in." },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { fileType, fileSize, bucket: bucketParam = "repair-media" } = body;

    // Validate bucket
    if (!ALLOWED_BUCKETS.includes(bucketParam as BucketName)) {
      return NextResponse.json(
        { error: "Invalid storage bucket" },
        { status: 400 }
      );
    }

    // Validate file type
    if (!ALLOWED_VIDEO_TYPES.includes(fileType)) {
      return NextResponse.json(
        { error: "Invalid file type. Only MP4 and MOV videos are allowed." },
        { status: 400 }
      );
    }

    // Validate file size
    if (!fileSize || fileSize > MAX_VIDEO_SIZE) {
      return NextResponse.json(
        { error: "File too large. Maximum size is 50MB." },
        { status: 400 }
      );
    }

    const videoMimeToExt: Record<string, string> = {
      "video/mp4": "mp4",
      "video/quicktime": "mov",
    };
    const extension = videoMimeToExt[fileType] || "mp4";
    const filename = `${randomUUID()}.${extension}`;
    const storagePath = `${session.user.id}/${filename}`;

    // Create a signed upload URL (valid for 2 minutes)
    const { data, error } = await supabaseAdmin.storage
      .from(bucketParam)
      .createSignedUploadUrl(storagePath);

    if (error) {
      console.error("Supabase signed URL error:", error);
      return NextResponse.json(
        { error: "Failed to create upload URL" },
        { status: 500 }
      );
    }

    // Also get the public URL so the client knows the final URL
    const { data: urlData } = supabaseAdmin.storage
      .from(bucketParam)
      .getPublicUrl(storagePath);

    return NextResponse.json({
      signedUrl: data.signedUrl,
      token: data.token,
      path: storagePath,
      publicUrl: urlData.publicUrl,
    });
  } catch (error) {
    console.error("Error creating signed upload URL:", error);
    return NextResponse.json(
      { error: "Failed to create upload URL" },
      { status: 500 }
    );
  }
}
