import { getContentBySection } from "@/lib/siteContent";
import BrowseClient from "./BrowseClient";

export const dynamic = "force-dynamic";

export default async function BrowsePage() {
  const content = await getContentBySection("browse");
  return <BrowseClient content={content} />;
}
