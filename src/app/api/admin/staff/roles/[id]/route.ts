import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { requirePermission } from '@/lib/checkPermission';
import { ALL_PERMISSIONS } from '@/lib/permissions';

// PATCH /api/admin/staff/roles/[id] - Update role
export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await requirePermission(session.user.id, 'staff.edit');

    const body = await req.json();
    const { name, description, permissions } = body;

    // Check if role exists
    const existingRole = await prisma.staffRole.findUnique({
      where: { id: params.id },
    });

    if (!existingRole) {
      return NextResponse.json({ error: 'Role not found' }, { status: 404 });
    }

    // Validate permissions if provided
    if (permissions && Array.isArray(permissions)) {
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
    }

    // Check if new name conflicts with existing role
    if (name && name !== existingRole.name) {
      const nameConflict = await prisma.staffRole.findFirst({
        where: {
          name,
          id: { not: params.id },
        },
      });

      if (nameConflict) {
        return NextResponse.json(
          { error: 'Role with this name already exists' },
          { status: 400 }
        );
      }
    }

    // Update role
    const role = await prisma.staffRole.update({
      where: { id: params.id },
      data: {
        ...(name && { name }),
        ...(description !== undefined && { description }),
        ...(permissions && { permissions }),
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

    return NextResponse.json({ role });
  } catch (error: any) {
    console.error('Error updating role:', error);
    if (error.message?.includes('Permission denied')) {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }
    return NextResponse.json(
      { error: 'Failed to update role' },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/staff/roles/[id] - Delete role
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await requirePermission(session.user.id, 'staff.remove');

    // Check if role exists
    const existingRole = await prisma.staffRole.findUnique({
      where: { id: params.id },
      include: {
        _count: {
          select: {
            staffMembers: true,
          },
        },
      },
    });

    if (!existingRole) {
      return NextResponse.json({ error: 'Role not found' }, { status: 404 });
    }

    // Don't allow deleting roles that have staff members assigned
    if (existingRole._count.staffMembers > 0) {
      return NextResponse.json(
        {
          error: `Cannot delete role with ${existingRole._count.staffMembers} staff member(s) assigned`,
        },
        { status: 400 }
      );
    }

    // Delete role
    await prisma.staffRole.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error deleting role:', error);
    if (error.message?.includes('Permission denied')) {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }
    return NextResponse.json(
      { error: 'Failed to delete role' },
      { status: 500 }
    );
  }
}
