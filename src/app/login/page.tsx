import { getContentBySection } from "@/lib/siteContent";
import LoginClient from "./LoginClient";

export const dynamic = "force-dynamic";

export default async function LoginPage() {
  const content = await getContentBySection("login");
  return <LoginClient content={content} />;
}
