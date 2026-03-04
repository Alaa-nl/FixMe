import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/adminAuth";
import { hasPermission } from "@/lib/checkPermission";
import CreateUserForm from "@/components/admin/CreateUserForm";

export default async function NewUserPage() {
  const session = await requireAdmin();

  if (!session) {
    redirect("/dashboard");
  }

  // Check if user has permission to create users
  const canCreate = await hasPermission(session.user.id, "users.create");
  if (!canCreate) {
    redirect("/admin/users");
  }

  return <CreateUserForm />;
}
