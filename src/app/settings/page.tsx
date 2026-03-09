import { getContentBySection } from "@/lib/siteContent";
import SettingsClient from "./SettingsClient";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const content = await getContentBySection("settings");
  return <SettingsClient content={content} />;
}
