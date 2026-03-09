import { getContentBySection } from "@/lib/siteContent";
import NotificationsClient from "./NotificationsClient";

export const dynamic = "force-dynamic";

export default async function NotificationsPage() {
  const content = await getContentBySection("notifications");
  return <NotificationsClient content={content} />;
}
