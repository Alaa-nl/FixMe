import { getContentBySection } from "@/lib/siteContent";
import PostClient from "./PostClient";

export const dynamic = "force-dynamic";

export default async function PostPage() {
  const content = await getContentBySection("post");
  return <PostClient content={content} />;
}
