import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/adminAuth";
import { hasPermission } from "@/lib/checkPermission";
import RoleForm from "@/components/admin/RoleForm";

export default async function NewRolePage() {
  const session = await requireAdmin();

  if (!session) {
    redirect("/dashboard");
  }

  // Check if user has permission to create roles
  const canCreate = await hasPermission(session.user.id, "staff.create");
  if (!canCreate) {
    redirect("/admin/staff/roles");
  }

  return <RoleForm mode="create" />;
}
