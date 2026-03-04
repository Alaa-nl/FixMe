import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/adminAuth";
import { hasPermission } from "@/lib/checkPermission";
import { prisma } from "@/lib/db";
import CreateRepairRequestForm from "@/components/admin/CreateRepairRequestForm";

export default async function NewRepairRequestPage() {
  const session = await requireAdmin();

  if (!session) {
    redirect("/dashboard");
  }

  // Check if user has permission to edit jobs
  const canCreate = await hasPermission(session.user.id, "jobs.edit");
  if (!canCreate) {
    redirect("/admin/jobs");
  }

  // Fetch categories for the form
  const categories = await prisma.category.findMany({
    where: { isActive: true },
    orderBy: { name: "asc" },
  });

  return <CreateRepairRequestForm categories={categories} />;
}
