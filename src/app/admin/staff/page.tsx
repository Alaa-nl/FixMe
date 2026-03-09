import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/adminAuth";
import { hasPermission } from "@/lib/checkPermission";
import { prisma } from "@/lib/db";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { UserPlus, Users as UsersIcon, Shield } from "lucide-react";

export default async function StaffPage() {
  const session = await requireAdmin();

  if (!session) {
    redirect("/dashboard");
  }

  // Check if user has permission to view staff
  const canView = await hasPermission(session.user.id, "staff.view");
  if (!canView) {
    redirect("/admin");
  }

  // Fetch all staff members
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
      createdAt: "desc",
    },
  });

  // Check if user can create staff
  const canCreate = await hasPermission(session.user.id, "staff.create");

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <UsersIcon className="text-primary" />
            Staff Management
          </h1>
          <p className="mt-2 text-gray-600">
            Manage staff members and their roles
          </p>
        </div>
        {canCreate && (
          <div className="flex gap-3">
            <Link href="/admin/staff/roles">
              <Button variant="outline" className="gap-2">
                <Shield size={18} />
                Manage Roles
              </Button>
            </Link>
            <Link href="/admin/staff/add">
              <Button className="bg-primary hover:bg-primary/90 gap-2">
                <UserPlus size={18} />
                Add Staff Member
              </Button>
            </Link>
          </div>
        )}
      </div>

      {/* Staff List */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {staffMembers.length === 0 ? (
          <div className="text-center py-12">
            <UsersIcon
              size={48}
              className="mx-auto text-gray-400 mb-4"
            />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No staff members yet
            </h3>
            <p className="text-gray-600 mb-4">
              Get started by adding your first staff member
            </p>
            {canCreate && (
              <Link href="/admin/staff/add">
                <Button className="bg-primary hover:bg-primary/90">
                  <UserPlus size={18} className="mr-2" />
                  Add Staff Member
                </Button>
              </Link>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Staff Member
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Role
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Permissions
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Joined
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {staffMembers.map((staff) => {
                  const permissions = staff.role.permissions as string[];
                  return (
                    <tr key={staff.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          {staff.user.avatarUrl ? (
                            <img
                              src={staff.user.avatarUrl}
                              alt={staff.user.name}
                              className="w-10 h-10 rounded-full object-cover"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center font-semibold">
                              {staff.user.name.charAt(0).toUpperCase()}
                            </div>
                          )}
                          <div>
                            <div className="font-medium text-gray-900">
                              {staff.user.name}
                            </div>
                            <div className="text-sm text-gray-500">
                              {staff.user.email}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="font-medium text-gray-900">
                            {staff.role.name}
                          </div>
                          {staff.role.description && (
                            <div className="text-sm text-gray-500">
                              {staff.role.description}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {staff.isActive ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            Active
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                            Inactive
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">
                          {permissions.length} permission
                          {permissions.length !== 1 ? "s" : ""}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(staff.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Notes Section */}
      {staffMembers.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="font-semibold text-blue-900 mb-2">
            Staff Management Notes
          </h3>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• ADMIN users always have all permissions</li>
            <li>
              • Staff members can only access features allowed by their role
            </li>
            <li>
              • Inactive staff members cannot access the admin panel
            </li>
          </ul>
        </div>
      )}
    </div>
  );
}
