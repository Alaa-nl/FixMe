import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/adminAuth";
import { hasPermission } from "@/lib/checkPermission";
import { getPlatformSettings } from "@/lib/platformSettings";
import PlatformSettingsForm from "@/components/admin/PlatformSettingsForm";

export default async function AdminSettingsPage() {
  const session = await requireAdmin();

  if (!session) {
    redirect("/dashboard");
  }

  // Check if user has permission to view settings
  const canView = await hasPermission(session.user.id, "settings.view");
  if (!canView) {
    redirect("/admin");
  }

  // Fetch current settings
  const settings = await getPlatformSettings();

  // Check if user can edit
  const canEdit = await hasPermission(session.user.id, "settings.edit");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Platform Settings</h1>
        <p className="mt-2 text-gray-600">
          Configure financial rules, platform behavior, and system-wide settings
        </p>
      </div>

      <PlatformSettingsForm settings={settings} canEdit={canEdit} />
    </div>
  );
}
