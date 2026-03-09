import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { getContentBySection } from "@/lib/siteContent";
import PostClient from "./PostClient";

export const dynamic = "force-dynamic";

export default async function PostPage() {
  const session = await auth();
  if (!session || !session.user) {
    redirect("/login");
  }

  const content = await getContentBySection("post");
  return <PostClient content={content} />;
}
