import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/adminAuth";
import { hasPermission } from "@/lib/checkPermission";
import { prisma } from "@/lib/db";
import AddStaffForm from "@/components/admin/AddStaffForm";

export default async function AddStaffPage() {
  const session = await requireAdmin();

  if (!session) {
    redirect("/dashboard");
  }

  // Check if user has permission to create staff
  const canCreate = await hasPermission(session.user.id, "staff.create");
  if (!canCreate) {
    redirect("/admin/staff");
  }

  // Fetch all available roles
  const roles = await prisma.staffRole.findMany({
    select: {
      id: true,
      name: true,
      description: true,
    },
    orderBy: {
      name: "asc",
    },
  });

  return <AddStaffForm roles={roles} />;
}
