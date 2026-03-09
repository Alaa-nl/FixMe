import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { hasPermission, requirePermission } from '@/lib/checkPermission';
import { ALL_PERMISSIONS } from '@/lib/permissions';

// GET /api/admin/staff/roles - List all roles
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

    // Fetch all roles with staff member count
    const roles = await prisma.staffRole.findMany({
      include: {
        _count: {
          select: {
            staffMembers: true,
          },
        },
        creator: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json({ roles });
  } catch (error) {
    console.error('Error fetching roles:', error);
    return NextResponse.json(
      { error: 'Failed to fetch roles' },
      { status: 500 }
    );
  }
}

// POST /api/admin/staff/roles - Create new role
export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await requirePermission(session.user.id, 'staff.create');

    const body = await req.json();
    const { name, description, permissions } = body;

    if (!name || !permissions || !Array.isArray(permissions)) {
      return NextResponse.json(
        { error: 'name and permissions (array) are required' },
        { status: 400 }
      );
    }

    // Validate permissions
    const validPermissions = Object.keys(ALL_PERMISSIONS);
    const invalidPermissions = permissions.filter(
      (p: string) => !validPermissions.includes(p)
    );

    if (invalidPermissions.length > 0) {
      return NextResponse.json(
        {
          error: 'Invalid permissions',
          invalidPermissions,
        },
        { status: 400 }
      );
    }

    // Check if role name already exists
    const existingRole = await prisma.staffRole.findFirst({
      where: { name },
    });

    if (existingRole) {
      return NextResponse.json(
        { error: 'Role with this name already exists' },
        { status: 400 }
      );
    }

    // Create role
    const role = await prisma.staffRole.create({
      data: {
        name,
        description,
        permissions,
        createdBy: session.user.id,
      },
      include: {
        creator: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        _count: {
          select: {
            staffMembers: true,
          },
        },
      },
    });

    return NextResponse.json({ role }, { status: 201 });
  } catch (error: any) {
    console.error('Error creating role:', error);
    if (error.message?.includes('Permission denied')) {
      return NextResponse.json({ error: "Permission denied" }, { status: 403 });
    }
    return NextResponse.json(
      { error: 'Failed to create role' },
      { status: 500 }
    );
  }
}
