import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/adminAuth";
import { hasPermission } from "@/lib/checkPermission";
import CreditManagementPage from "@/components/admin/CreditManagementPage";

export default async function AdminCreditsPage() {
  const session = await requireAdmin();

  if (!session) {
    redirect("/dashboard");
  }

  // Check if user has permission to manage credits
  const canManage = await hasPermission(session.user.id, "finance.adjust");
  if (!canManage) {
    redirect("/admin");
  }

  return <CreditManagementPage />;
}
