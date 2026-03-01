import { NextRequest, NextResponse } from "next/server";
import { requireAdminAPI } from "@/lib/adminAuth";
import { prisma } from "@/lib/db";

export async function GET(request: NextRequest) {
  // Check admin authorization
  const authError = await requireAdminAPI();
  if (authError) return authError;

  try {
    // Fetch all categories (including inactive)
    const categories = await prisma.category.findMany({
      orderBy: { name: "asc" },
    });

    return NextResponse.json({ categories }, { status: 200 });
  } catch (error) {
    console.error("Error fetching categories:", error);
    return NextResponse.json(
      { error: "Failed to fetch categories" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  // Check admin authorization
  const authError = await requireAdminAPI();
  if (authError) return authError;

  try {
    const body = await request.json();
    const { name, nameNl, slug, description, isActive } = body;

    if (!name || !nameNl || !slug) {
      return NextResponse.json(
        { error: "name, nameNl, and slug are required" },
        { status: 400 }
      );
    }

    // Check if slug already exists
    const existing = await prisma.category.findUnique({
      where: { slug },
    });

    if (existing) {
      return NextResponse.json(
        { error: "Category with this slug already exists" },
        { status: 400 }
      );
    }

    const category = await prisma.category.create({
      data: {
        name,
        nameNl,
        slug,
        description: description || null,
        isActive: isActive ?? true,
      },
    });

    return NextResponse.json(category, { status: 201 });
  } catch (error) {
    console.error("Error creating category:", error);
    return NextResponse.json(
      { error: "Failed to create category" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  // Check admin authorization
  const authError = await requireAdminAPI();
  if (authError) return authError;

  try {
    const body = await request.json();
    const { id, name, nameNl, slug, description, isActive } = body;

    if (!id) {
      return NextResponse.json(
        { error: "Category ID is required" },
        { status: 400 }
      );
    }

    const category = await prisma.category.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(nameNl && { nameNl }),
        ...(slug && { slug }),
        ...(description !== undefined && { description }),
        ...(isActive !== undefined && { isActive }),
      },
    });

    return NextResponse.json(category, { status: 200 });
  } catch (error) {
    console.error("Error updating category:", error);
    return NextResponse.json(
      { error: "Failed to update category" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  // Check admin authorization
  const authError = await requireAdminAPI();
  if (authError) return authError;

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "Category ID is required" },
        { status: 400 }
      );
    }

    // Soft delete by setting isActive to false
    const category = await prisma.category.update({
      where: { id },
      data: { isActive: false },
    });

    return NextResponse.json(category, { status: 200 });
  } catch (error) {
    console.error("Error deleting category:", error);
    return NextResponse.json(
      { error: "Failed to delete category" },
      { status: 500 }
    );
  }
}
