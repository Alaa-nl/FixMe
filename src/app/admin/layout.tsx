import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/adminAuth";
import AdminSidebar from "@/components/admin/AdminSidebar";
import { getUserPermissions, isAdmin } from "@/lib/checkPermission";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await requireAdmin();

  if (!session) {
    redirect("/dashboard");
  }

  // Get user permissions for dynamic sidebar
  const permissions = await getUserPermissions(session.user.id);
  const isSuperAdmin = await isAdmin(session.user.id);

  return (
    <div className="min-h-screen bg-gray-50 pt-16">
      <AdminSidebar
        user={session.user}
        permissions={permissions}
        isSuperAdmin={isSuperAdmin}
      />
      <div className="lg:ml-64">
        <main className="p-4 md:p-8">{children}</main>
      </div>
    </div>
  );
}
