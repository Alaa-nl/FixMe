import { getContentBySection } from "@/lib/siteContent";
import MyRequestsClient from "./MyRequestsClient";

export const dynamic = "force-dynamic";

export default async function MyRequestsPage() {
  const content = await getContentBySection("my_requests");
  return <MyRequestsClient content={content} />;
}
