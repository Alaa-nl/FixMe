import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/adminAuth";
import { hasPermission } from "@/lib/checkPermission";
import VoucherManagementPage from "@/components/admin/VoucherManagementPage";

export default async function AdminVouchersPage() {
  const session = await requireAdmin();

  if (!session) {
    redirect("/dashboard");
  }

  // Check if user has permission to manage vouchers
  const canManage = await hasPermission(session.user.id, "finance.vouchers");
  if (!canManage) {
    redirect("/admin");
  }

  return <VoucherManagementPage />;
}
