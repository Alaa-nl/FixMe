import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/adminAuth";
import AdminSidebar from "@/components/admin/AdminSidebar";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await requireAdmin();

  if (!session) {
    redirect("/dashboard");
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-16">
      <AdminSidebar user={session.user} />
      <div className="lg:ml-64">
        <main className="p-4 md:p-8">{children}</main>
      </div>
    </div>
  );
}
