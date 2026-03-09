import { getContentBySection } from "@/lib/siteContent";
import ProfileEditClient from "./ProfileEditClient";

export const dynamic = "force-dynamic";

export default async function EditProfilePage() {
  const content = await getContentBySection("profile_edit");
  return <ProfileEditClient content={content} />;
}
