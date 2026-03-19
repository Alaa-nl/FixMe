import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { randomUUID } from "crypto";
import sharp from "sharp";
import { supabaseAdmin } from "@/lib/supabase";

const MAX_IMAGE_SIZE = 10 * 1024 * 1024; // 10MB for images
const MAX_VIDEO_SIZE = 50 * 1024 * 1024; // 50MB for videos
const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/gif", "image/webp"];
const ALLOWED_VIDEO_TYPES = ["video/mp4", "video/quicktime"];
const ALLOWED_TYPES = [...ALLOWED_IMAGE_TYPES, ...ALLOWED_VIDEO_TYPES];

const IMAGE_MAX_WIDTH = 1200;
const IMAGE_QUALITY = 80;

const ALLOWED_BUCKETS = [
  "profile-images",
  "repair-media",
  "dispute-evidence",
  "fixer-portfolio",
  "marketing-media",
] as const;

type BucketName = (typeof ALLOWED_BUCKETS)[number];

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session || !session.user) {
      return NextResponse.json(
        { error: "Unauthorized. Please log in." },
        { status: 401 }
      );
    }

    const formData = await request.formData();
    const file = formData.get("file") as File;
    const bucketParam = (formData.get("bucket") as string) || "repair-media";

    if (!file) {
      return NextResponse.json(
        { error: "No file uploaded" },
        { status: 400 }
      );
    }

    // Validate bucket
    if (!ALLOWED_BUCKETS.includes(bucketParam as BucketName)) {
      return NextResponse.json(
        { error: "Invalid storage bucket" },
        { status: 400 }
      );
    }
    const bucket = bucketParam as BucketName;

    // Validate file type
    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: "Invalid file type. Only JPG, PNG, GIF, WEBP, MP4, and MOV are allowed." },
        { status: 400 }
      );
    }

    // Validate file size (different limits for images vs videos)
    const isVideo = ALLOWED_VIDEO_TYPES.includes(file.type);
    const maxSize = isVideo ? MAX_VIDEO_SIZE : MAX_IMAGE_SIZE;
    const maxLabel = isVideo ? "50MB" : "10MB";

    if (file.size > maxSize) {
      return NextResponse.json(
        { error: `File too large. Maximum size is ${maxLabel}.` },
        { status: 400 }
      );
    }

    // Convert file to buffer
    const bytes = await file.arrayBuffer();
    const rawBuffer = Buffer.from(bytes);

    // Process image or keep video as-is
    const isImage = ALLOWED_IMAGE_TYPES.includes(file.type);
    let outputBuffer: Buffer;
    let filename: string;
    let contentType: string;

    if (isImage) {
      outputBuffer = await sharp(rawBuffer)
        .resize({ width: IMAGE_MAX_WIDTH, withoutEnlargement: true })
        .webp({ quality: IMAGE_QUALITY })
        .toBuffer();

      filename = `${randomUUID()}.webp`;
      contentType = "image/webp";
    } else {
      outputBuffer = rawBuffer;
      const videoMimeToExt: Record<string, string> = {
        "video/mp4": "mp4",
        "video/quicktime": "mov",
      };
      const extension = videoMimeToExt[file.type] || "mp4";
      filename = `${randomUUID()}.${extension}`;
      contentType = file.type;
    }

    // Upload to Supabase Storage
    const storagePath = `${session.user.id}/${filename}`;

    const { error: uploadError } = await supabaseAdmin.storage
      .from(bucket)
      .upload(storagePath, outputBuffer, {
        contentType,
        upsert: false,
      });

    if (uploadError) {
      console.error("Supabase upload error:", uploadError);
      return NextResponse.json(
        { error: "Failed to upload file to storage" },
        { status: 500 }
      );
    }

    // Get the public URL
    const { data: urlData } = supabaseAdmin.storage
      .from(bucket)
      .getPublicUrl(storagePath);

    return NextResponse.json(
      { url: urlData.publicUrl, filename },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error uploading file:", error);
    return NextResponse.json(
      { error: "Failed to upload file" },
      { status: 500 }
    );
  }
}
