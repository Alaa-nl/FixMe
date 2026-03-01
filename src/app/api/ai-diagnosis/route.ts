import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { diagnoseItem } from "@/lib/claude";

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await auth();
    if (!session || !session.user) {
      return NextResponse.json(
        { error: "Unauthorized. Please log in to use AI diagnosis." },
        { status: 401 }
      );
    }

    // Parse request body
    const body = await request.json();
    const { images, categoryHint } = body;

    // Validate images
    if (!images || !Array.isArray(images)) {
      return NextResponse.json(
        { error: "Images array is required" },
        { status: 400 }
      );
    }

    if (images.length === 0) {
      return NextResponse.json(
        { error: "At least one image is required" },
        { status: 400 }
      );
    }

    if (images.length > 5) {
      return NextResponse.json(
        { error: "Maximum 5 images allowed" },
        { status: 400 }
      );
    }

    // Call the diagnosis function
    const diagnosis = await diagnoseItem(images, categoryHint);

    // Return the diagnosis result
    return NextResponse.json(diagnosis, { status: 200 });
  } catch (error) {
    console.error("Error in AI diagnosis API:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to analyze the item. Please try again.",
      },
      { status: 500 }
    );
  }
}
