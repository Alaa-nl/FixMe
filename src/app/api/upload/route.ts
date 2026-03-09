import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";
import { randomUUID } from "crypto";
import sharp from "sharp";

const MAX_IMAGE_SIZE = 10 * 1024 * 1024; // 10MB for images
const MAX_VIDEO_SIZE = 50 * 1024 * 1024; // 50MB for videos
const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/gif", "image/webp"];
const ALLOWED_VIDEO_TYPES = ["video/mp4", "video/quicktime"];
const ALLOWED_TYPES = [...ALLOWED_IMAGE_TYPES, ...ALLOWED_VIDEO_TYPES];

const IMAGE_MAX_WIDTH = 1200;
const IMAGE_QUALITY = 80;

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

    if (!file) {
      return NextResponse.json(
        { error: "No file uploaded" },
        { status: 400 }
      );
    }

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

    // Determine output filename — images always saved as .webp after compression
    const isImage = ALLOWED_IMAGE_TYPES.includes(file.type);
    let outputBuffer: Buffer;
    let filename: string;

    if (isImage) {
      // Resize and compress images
      outputBuffer = await sharp(rawBuffer)
        .resize({ width: IMAGE_MAX_WIDTH, withoutEnlargement: true })
        .webp({ quality: IMAGE_QUALITY })
        .toBuffer();

      filename = `${randomUUID()}.webp`;
    } else {
      // Videos: keep original format, derive extension from MIME type
      outputBuffer = rawBuffer;
      const videoMimeToExt: Record<string, string> = {
        "video/mp4": "mp4",
        "video/quicktime": "mov",
      };
      const extension = videoMimeToExt[file.type] || "mp4";
      filename = `${randomUUID()}.${extension}`;
    }

    // Create uploads directory if it doesn't exist
    const uploadsDir = join(process.cwd(), "public", "uploads");
    await mkdir(uploadsDir, { recursive: true });

    // Save file
    const filePath = join(uploadsDir, filename);
    await writeFile(filePath, outputBuffer);

    // Return the public URL
    const url = `/uploads/${filename}`;

    return NextResponse.json(
      { url, filename },
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
