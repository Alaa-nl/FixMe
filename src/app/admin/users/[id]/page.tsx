import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/adminAuth";
import { hasPermission } from "@/lib/checkPermission";
import UserDetailView from "@/components/admin/UserDetailView";

export const dynamic = "force-dynamic";

export default async function UserDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const session = await requireAdmin();

  if (!session) {
    redirect("/dashboard");
  }

  // Check if user has permission to view users
  const canView = await hasPermission(session.user.id, "users.view");
  if (!canView) {
    redirect("/admin/users");
  }

  // Get user permissions for action buttons
  const permissions = {
    canEdit: await hasPermission(session.user.id, "users.edit"),
    canDelete: await hasPermission(session.user.id, "users.delete"),
    canBan: await hasPermission(session.user.id, "users.ban"),
    canCreateStaff: await hasPermission(session.user.id, "staff.create"),
  };

  return <UserDetailView userId={params.id} permissions={permissions} />;
}
