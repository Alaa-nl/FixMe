import Link from "next/link";
import type { Metadata } from "next";
import ReactMarkdown from "react-markdown";
import { getContentBySection } from "@/lib/siteContent";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "Learn how FixMe collects, uses, and protects your personal data. GDPR/AVG compliant privacy policy for our repair marketplace platform.",
};

export default async function PrivacyPage() {
  const content = await getContentBySection("privacy");

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-sm p-8 mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">
            {content["privacy_title"]}
          </h1>
          <p className="text-gray-600">
            Last updated: <span className="font-semibold">{content["privacy_last_updated"]}</span>
          </p>
        </div>

        {/* Markdown Content */}
        <div className="bg-white rounded-xl shadow-sm p-8 prose prose-gray max-w-none prose-headings:text-gray-800 prose-h2:text-2xl prose-h2:font-bold prose-h2:mt-10 prose-h2:mb-4 prose-p:text-gray-700 prose-p:leading-relaxed prose-li:text-gray-700 prose-strong:text-gray-800 prose-a:text-[#FF6B35] prose-a:font-semibold hover:prose-a:underline prose-ul:ml-4">
          <ReactMarkdown>{content["privacy_markdown"]}</ReactMarkdown>
        </div>

        {/* Back to home link */}
        <div className="text-center mt-8">
          <Link
            href="/"
            className="text-[#FF6B35] hover:underline font-semibold"
          >
            {content["privacy_back_link"]}
          </Link>
        </div>
      </div>
    </div>
  );
}
