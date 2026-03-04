import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { hasPermission, requirePermission } from '@/lib/checkPermission';

// GET /api/admin/staff - List all staff members
export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check permission
    const canView = await hasPermission(session.user.id, 'staff.view');
    if (!canView) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Fetch all staff members with their user info and role
    const staffMembers = await prisma.staffMember.findMany({
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            avatarUrl: true,
            userType: true,
          },
        },
        role: {
          select: {
            id: true,
            name: true,
            description: true,
            permissions: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json({ staffMembers });
  } catch (error) {
    console.error('Error fetching staff members:', error);
    return NextResponse.json(
      { error: 'Failed to fetch staff members' },
      { status: 500 }
    );
  }
}

// POST /api/admin/staff - Add new staff member
export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check permission
    await requirePermission(session.user.id, 'staff.create');

    const body = await req.json();
    const { userId, roleId, notes } = body;

    if (!userId || !roleId) {
      return NextResponse.json(
        { error: 'userId and roleId are required' },
        { status: 400 }
      );
    }

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Check if role exists
    const role = await prisma.staffRole.findUnique({
      where: { id: roleId },
    });

    if (!role) {
      return NextResponse.json({ error: 'Role not found' }, { status: 404 });
    }

    // Check if user is already a staff member
    const existingStaff = await prisma.staffMember.findUnique({
      where: { userId },
    });

    if (existingStaff) {
      return NextResponse.json(
        { error: 'User is already a staff member' },
        { status: 400 }
      );
    }

    // Create staff member
    const staffMember = await prisma.staffMember.create({
      data: {
        userId,
        roleId,
        notes,
        createdBy: session.user.id,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            avatarUrl: true,
          },
        },
        role: {
          select: {
            id: true,
            name: true,
            description: true,
          },
        },
      },
    });

    // TODO: Send email notification to the user
    // You can add email sending logic here

    return NextResponse.json({ staffMember }, { status: 201 });
  } catch (error: any) {
    console.error('Error creating staff member:', error);
    if (error.message?.includes('Permission denied')) {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }
    return NextResponse.json(
      { error: 'Failed to create staff member' },
      { status: 500 }
    );
  }
}
