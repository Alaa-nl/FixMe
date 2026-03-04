import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/adminAuth";
import { hasPermission } from "@/lib/checkPermission";
import ContentManagementPage from "@/components/admin/ContentManagementPage";

export default async function AdminContentPage() {
  const session = await requireAdmin();

  if (!session) {
    redirect("/dashboard");
  }

  // Check if user has permission to edit content
  const canEdit = await hasPermission(session.user.id, "content.edit");
  if (!canEdit) {
    redirect("/admin");
  }

  return <ContentManagementPage />;
}
