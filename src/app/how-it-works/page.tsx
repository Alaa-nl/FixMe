import { getContentBySection, getContentBatch } from "@/lib/siteContent";
import HowItWorksClient from "./HowItWorksClient";

export const dynamic = "force-dynamic";

export default async function HowItWorksPage() {
  // Fetch both sections — homepage has the customer step keys, how_it_works has the rest
  const [homepageContent, hiwContent] = await Promise.all([
    getContentBatch([
      "how_it_works_title",
      "how_it_works_step1_title",
      "how_it_works_step1_desc",
      "how_it_works_step2_title",
      "how_it_works_step2_desc",
      "how_it_works_step3_title",
      "how_it_works_step3_desc",
      "how_it_works_step4_title",
      "how_it_works_step4_desc",
    ]),
    getContentBySection("how_it_works"),
  ]);

  const content = { ...homepageContent, ...hiwContent };

  return <HowItWorksClient content={content} />;
}
