import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { requirePermission } from '@/lib/checkPermission';

// PATCH /api/admin/staff/[id] - Update staff member
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await requirePermission(session.user.id, 'staff.edit');

    const body = await req.json();
    const { roleId, isActive, notes } = body;

    // Check if staff member exists
    const existingStaff = await prisma.staffMember.findUnique({
      where: { id: id },
    });

    if (!existingStaff) {
      return NextResponse.json(
        { error: 'Staff member not found' },
        { status: 404 }
      );
    }

    // If roleId is provided, check if role exists
    if (roleId) {
      const role = await prisma.staffRole.findUnique({
        where: { id: roleId },
      });

      if (!role) {
        return NextResponse.json({ error: 'Role not found' }, { status: 404 });
      }
    }

    // Update staff member
    const staffMember = await prisma.staffMember.update({
      where: { id: id },
      data: {
        ...(roleId && { roleId }),
        ...(typeof isActive === 'boolean' && { isActive }),
        ...(notes !== undefined && { notes }),
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

    return NextResponse.json({ staffMember });
  } catch (error: any) {
    console.error('Error updating staff member:', error);
    if (error.message?.includes('Permission denied')) {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }
    return NextResponse.json(
      { error: 'Failed to update staff member' },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/staff/[id] - Remove staff member
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await requirePermission(session.user.id, 'staff.remove');

    // Check if staff member exists
    const existingStaff = await prisma.staffMember.findUnique({
      where: { id: id },
    });

    if (!existingStaff) {
      return NextResponse.json(
        { error: 'Staff member not found' },
        { status: 404 }
      );
    }

    // Delete staff member
    await prisma.staffMember.delete({
      where: { id: id },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error deleting staff member:', error);
    if (error.message?.includes('Permission denied')) {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }
    return NextResponse.json(
      { error: 'Failed to delete staff member' },
      { status: 500 }
    );
  }
}
