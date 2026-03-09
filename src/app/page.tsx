import Link from "next/link";
import Button from "@/components/ui/button";
import { prisma } from "@/lib/db";
import { getCategoryIcon } from "@/lib/categoryIcons";
import RequestCard from "@/components/request/RequestCard";
import { getContentBySection } from "@/lib/siteContent";

export const dynamic = "force-dynamic";

export default async function Home() {
  // Fetch categories from database
  const categories = await prisma.category.findMany({
    where: { isActive: true },
    orderBy: { name: "asc" },
  });

  // Fetch recent repair requests
  const recentRequests = await prisma.repairRequest.findMany({
    where: { status: "OPEN" },
    orderBy: { createdAt: "desc" },
    take: 4,
    include: {
      category: {
        select: {
          name: true,
          slug: true,
        },
      },
      customer: {
        select: {
          name: true,
          avatarUrl: true,
        },
      },
      _count: {
        select: {
          offers: true,
        },
      },
    },
  });

  // Fetch all homepage CMS content in one query
  const content = await getContentBySection("homepage");

  const steps = [
    {
      number: 1,
      emoji: "📸",
      title: content["how_it_works_step1_title"],
      description: content["how_it_works_step1_desc"],
    },
    {
      number: 2,
      emoji: "💰",
      title: content["how_it_works_step2_title"],
      description: content["how_it_works_step2_desc"],
    },
    {
      number: 3,
      emoji: "✅",
      title: content["how_it_works_step3_title"],
      description: content["how_it_works_step3_desc"],
    },
  ];

  const stats = [
    { value: content["stats_repairs"], label: content["stats_repairs_label"] },
    { value: content["stats_fixers"], label: content["stats_fixers_label"] },
    { value: content["stats_rating"], label: content["stats_rating_label"] },
    { value: content["stats_cities"], label: content["stats_cities_label"] },
  ];

  return (
    <div className="flex-1">
      {/* Hero Section */}
      <section className="bg-white">
        <div className="max-w-7xl mx-auto px-4 py-12 md:py-20">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            {/* Left Side */}
            <div className="text-center md:text-left">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-secondary mb-6 leading-tight">
                {content["hero_title"]}
              </h1>
              <p className="text-lg md:text-xl text-gray-600 mb-8 leading-relaxed">
                {content["hero_subtitle"]}
              </p>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 mb-6">
                <Link href="/post">
                  <Button variant="primary" size="lg" className="w-full sm:w-auto">
                    {content["hero_cta_primary"]}
                  </Button>
                </Link>
                <Link href="/register">
                  <Button variant="outline" size="lg" className="w-full sm:w-auto">
                    {content["hero_cta_secondary"]}
                  </Button>
                </Link>
              </div>

              {/* Trust Indicators */}
              <div className="flex flex-col sm:flex-row gap-4 text-sm text-gray-600">
                <span className="flex items-center gap-2">
                  <span className="text-green-600">✓</span> {content["hero_trust_free"]}
                </span>
                <span className="flex items-center gap-2">
                  <span className="text-green-600">✓</span> {content["hero_trust_pay"]}
                </span>
                <span className="flex items-center gap-2">
                  <span className="text-green-600">✓</span> {content["hero_trust_verified"]}
                </span>
              </div>
            </div>

            {/* Right Side - Illustration */}
            <div className="hidden md:flex items-center justify-center">
              <div className="w-full max-w-md h-80 bg-orange-50 rounded-2xl flex items-center justify-center border-2 border-orange-100">
                <span className="text-9xl">🔧</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="bg-gray-100 py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center text-gray-800 mb-12">
            {content["how_it_works_title"]}
          </h2>

          <div className="grid md:grid-cols-3 gap-8">
            {steps.map((step) => (
              <div key={step.number} className="relative">
                {/* Step Number */}
                <div className="flex justify-center mb-4">
                  <div className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center font-bold text-lg">
                    {step.number}
                  </div>
                </div>

                {/* Card */}
                <div className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
                  <div className="text-5xl mb-4 text-center">{step.emoji}</div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-3 text-center">
                    {step.title}
                  </h3>
                  <p className="text-gray-600 text-center leading-relaxed">
                    {step.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Category Grid Section */}
      <section className="bg-white py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center text-gray-800 mb-12">
            {content["categories_title"]}
          </h2>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {categories.map((category) => (
              <Link
                key={category.slug}
                href={`/categories/${category.slug}`}
                className="bg-white rounded-xl border-2 border-gray-200 p-6 hover:border-primary hover:shadow-lg transition-all group"
              >
                <div className="text-center">
                  <div className="text-4xl md:text-5xl mb-3 group-hover:scale-110 transition-transform">
                    {getCategoryIcon(category.slug)}
                  </div>
                  <p className="text-sm md:text-base font-medium text-gray-700 group-hover:text-primary transition-colors">
                    {category.name}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Recent Repair Requests Section */}
      <section className="bg-gray-50 py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-between items-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800">
              {content["homepage_recent_title"]}
            </h2>
            <Link
              href="/browse"
              className="text-primary font-medium hover:underline flex items-center gap-2"
            >
              {content["homepage_recent_view_all"]}
            </Link>
          </div>

          {recentRequests.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg mb-4">
                {content["homepage_recent_empty"]}
              </p>
              <Link href="/post">
                <Button variant="primary" size="lg">
                  {content["homepage_recent_empty_cta"]}
                </Button>
              </Link>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {recentRequests.map((request) => (
                <RequestCard key={request.id} request={request} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Trust Section */}
      <section className="bg-white py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center text-gray-800 mb-12">
            {content["trust_title"]}
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { title: content["trust_badge1_title"], desc: content["trust_badge1_desc"], emoji: "✅" },
              { title: content["trust_badge2_title"], desc: content["trust_badge2_desc"], emoji: "🔒" },
              { title: content["trust_badge3_title"], desc: content["trust_badge3_desc"], emoji: "💬" },
            ].map((badge, i) => (
              <div key={i} className="text-center p-6">
                <div className="text-4xl mb-4">{badge.emoji}</div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">{badge.title}</h3>
                <p className="text-gray-600">{badge.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section for Fixers */}
      <section className="bg-secondary py-16 md:py-24 text-white">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            {content["homepage_fixer_cta_title"]}
          </h2>
          <p className="text-lg md:text-xl text-blue-100 mb-8">
            {content["homepage_fixer_cta_desc"]}
          </p>

          <Link href="/register">
            <Button variant="primary" size="lg">
              {content["homepage_fixer_cta_button"]}
            </Button>
          </Link>

          <p className="mt-6 text-blue-200">
            {content["homepage_fixer_cta_footnote"]}
          </p>
        </div>
      </section>

      {/* Trust / Stats Section */}
      <section className="bg-gray-100 py-16">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 text-center">
            {stats.map((stat, index) => (
              <div key={index}>
                <div className="text-3xl md:text-4xl font-bold text-primary mb-2">
                  {stat.value}
                </div>
                <div className="text-gray-600 font-medium">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
