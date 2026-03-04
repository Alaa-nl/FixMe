import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/adminAuth";
import { hasPermission } from "@/lib/checkPermission";
import { prisma } from "@/lib/db";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Shield, Plus, Users } from "lucide-react";

export default async function RolesPage() {
  const session = await requireAdmin();

  if (!session) {
    redirect("/dashboard");
  }

  // Check if user has permission to view staff
  const canView = await hasPermission(session.user.id, "staff.view");
  if (!canView) {
    redirect("/admin");
  }

  // Fetch all roles
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
      createdAt: "desc",
    },
  });

  // Check if user can create roles
  const canCreate = await hasPermission(session.user.id, "staff.create");

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <Shield className="text-[#FF6B35]" />
            Role Management
          </h1>
          <p className="mt-2 text-gray-600">
            Create and manage staff roles with custom permissions
          </p>
        </div>
        {canCreate && (
          <Link href="/admin/staff/roles/new">
            <Button className="bg-[#FF6B35] hover:bg-[#FF6B35]/90 gap-2">
              <Plus size={18} />
              Create Role
            </Button>
          </Link>
        )}
      </div>

      {/* Roles Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {roles.map((role) => {
          const permissions = role.permissions as string[];
          return (
            <div
              key={role.id}
              className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow border border-gray-200 overflow-hidden"
            >
              <div className="p-6">
                {/* Role Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-gray-900 mb-1">
                      {role.name}
                    </h3>
                    {role.description && (
                      <p className="text-sm text-gray-600">{role.description}</p>
                    )}
                  </div>
                  <Shield className="text-[#1B4965] flex-shrink-0 ml-2" size={24} />
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="bg-blue-50 rounded-lg p-3">
                    <div className="text-2xl font-bold text-[#1B4965]">
                      {permissions.length}
                    </div>
                    <div className="text-xs text-gray-600">Permissions</div>
                  </div>
                  <div className="bg-orange-50 rounded-lg p-3">
                    <div className="text-2xl font-bold text-[#FF6B35]">
                      {role._count.staffMembers}
                    </div>
                    <div className="text-xs text-gray-600">Staff Members</div>
                  </div>
                </div>

                {/* Creator Info */}
                <div className="text-xs text-gray-500 mb-4">
                  Created by {role.creator.name}
                  <br />
                  {new Date(role.createdAt).toLocaleDateString()}
                </div>

                {/* Actions */}
                {canCreate && (
                  <div className="flex gap-2">
                    <Link href={`/admin/staff/roles/${role.id}/edit`} className="flex-1">
                      <Button
                        variant="outline"
                        className="w-full text-sm"
                        size="sm"
                      >
                        Edit
                      </Button>
                    </Link>
                    {role._count.staffMembers === 0 && (
                      <Button
                        variant="outline"
                        className="text-sm text-red-600 hover:text-red-700 hover:bg-red-50"
                        size="sm"
                      >
                        Delete
                      </Button>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {/* Empty State */}
        {roles.length === 0 && (
          <div className="col-span-full bg-white rounded-lg shadow p-12 text-center">
            <Shield size={48} className="mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No roles created yet
            </h3>
            <p className="text-gray-600 mb-4">
              Create your first role to assign permissions to staff members
            </p>
            {canCreate && (
              <Link href="/admin/staff/roles/new">
                <Button className="bg-[#FF6B35] hover:bg-[#FF6B35]/90">
                  <Plus size={18} className="mr-2" />
                  Create Role
                </Button>
              </Link>
            )}
          </div>
        )}
      </div>

      {/* Role Templates Info */}
      {canCreate && (
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-6">
          <h3 className="font-semibold text-blue-900 mb-3 flex items-center gap-2">
            <Shield size={20} />
            Quick Start with Templates
          </h3>
          <p className="text-sm text-blue-800 mb-3">
            When creating a new role, you can start from pre-made templates:
          </p>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3 text-sm">
            <div className="bg-white rounded p-3">
              <div className="font-semibold text-gray-900">Dispute Manager</div>
              <div className="text-xs text-gray-600">
                Handles disputes and refunds
              </div>
            </div>
            <div className="bg-white rounded p-3">
              <div className="font-semibold text-gray-900">Content Editor</div>
              <div className="text-xs text-gray-600">
                Manages website content
              </div>
            </div>
            <div className="bg-white rounded p-3">
              <div className="font-semibold text-gray-900">Finance Officer</div>
              <div className="text-xs text-gray-600">
                Manages payments and reports
              </div>
            </div>
            <div className="bg-white rounded p-3">
              <div className="font-semibold text-gray-900">Customer Support</div>
              <div className="text-xs text-gray-600">
                Assists users and support
              </div>
            </div>
            <div className="bg-white rounded p-3">
              <div className="font-semibold text-gray-900">Full Manager</div>
              <div className="text-xs text-gray-600">
                Most features except critical changes
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Back Button */}
      <Link href="/admin/staff">
        <Button variant="outline" className="gap-2">
          <Users size={18} />
          Back to Staff
        </Button>
      </Link>
    </div>
  );
}
