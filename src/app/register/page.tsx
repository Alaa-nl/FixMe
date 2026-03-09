import { getContentBySection } from "@/lib/siteContent";
import RegisterClient from "./RegisterClient";

export const dynamic = "force-dynamic";

export default async function RegisterPage() {
  const content = await getContentBySection("register");
  return <RegisterClient content={content} />;
}
