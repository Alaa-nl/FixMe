import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/adminAuth";
import AdminLogsPage from "@/components/admin/AdminLogsPage";
import { prisma } from "@/lib/db";

export default async function AdminActivityLogsPage() {
  const session = await requireAdmin();

  if (!session) {
    redirect("/dashboard");
  }

  // Only super admins can view activity logs
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { userType: true },
  });

  if (user?.userType !== "ADMIN") {
    redirect("/admin");
  }

  return <AdminLogsPage />;
}
