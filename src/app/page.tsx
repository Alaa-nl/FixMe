import Link from "next/link";
import { Camera, HandCoins, CircleCheckBig, ShieldCheck, Lock, MessageSquareText, Wrench, ArrowRight, Star, MapPin, Users } from "lucide-react";
import Button from "@/components/ui/button";
import { prisma } from "@/lib/db";
import { CategoryIcon } from "@/lib/categoryIconsReact";
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
      icon: Camera,
      title: content["how_it_works_step1_title"],
      description: content["how_it_works_step1_desc"],
    },
    {
      number: 2,
      icon: HandCoins,
      title: content["how_it_works_step2_title"],
      description: content["how_it_works_step2_desc"],
    },
    {
      number: 3,
      icon: CircleCheckBig,
      title: content["how_it_works_step3_title"],
      description: content["how_it_works_step3_desc"],
    },
  ];

  const stats = [
    { value: content["stats_repairs"], label: content["stats_repairs_label"], icon: Wrench },
    { value: content["stats_fixers"], label: content["stats_fixers_label"], icon: Users },
    { value: content["stats_rating"], label: content["stats_rating_label"], icon: Star },
    { value: content["stats_cities"], label: content["stats_cities_label"], icon: MapPin },
  ];

  return (
    <div className="flex-1">
      {/* Hero Section */}
      <section className="bg-white">
        <div className="max-w-7xl mx-auto px-4 py-12 md:py-20">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            {/* Left Side */}
            <div className="text-center md:text-left">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-secondary mb-6 leading-tight font-display">
                {content["hero_title"]}
              </h1>
              <p className="text-lg md:text-xl text-gray-600 mb-8 leading-relaxed">
                {content["hero_subtitle"]}
              </p>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 mb-6">
                <Link href="/post">
                  <Button variant="primary" size="lg" className="w-full sm:w-auto text-base px-8 py-3 h-auto rounded-xl">
                    {content["hero_cta_primary"]}
                  </Button>
                </Link>
                <Link href="/register">
                  <Button variant="outline" size="lg" className="w-full sm:w-auto text-base px-8 py-3 h-auto rounded-xl">
                    {content["hero_cta_secondary"]}
                  </Button>
                </Link>
              </div>

              {/* Trust Indicators */}
              <div className="flex flex-col sm:flex-row gap-4 text-sm text-gray-600">
                <span className="flex items-center gap-2">
                  <CircleCheckBig className="w-4 h-4 text-emerald-600 flex-shrink-0" /> {content["hero_trust_free"]}
                </span>
                <span className="flex items-center gap-2">
                  <CircleCheckBig className="w-4 h-4 text-emerald-600 flex-shrink-0" /> {content["hero_trust_pay"]}
                </span>
                <span className="flex items-center gap-2">
                  <CircleCheckBig className="w-4 h-4 text-emerald-600 flex-shrink-0" /> {content["hero_trust_verified"]}
                </span>
              </div>
            </div>

            {/* Right Side - Illustration */}
            <div className="hidden md:flex items-center justify-center">
              <div className="relative w-full max-w-md">
                <div className="w-full h-80 bg-gradient-to-br from-orange-50 to-orange-100/50 rounded-2xl flex items-center justify-center border border-orange-100">
                  <Wrench className="w-28 h-28 text-primary/30" strokeWidth={1.5} />
                </div>
                {/* Floating cards */}
                <div className="absolute -top-4 -right-4 bg-white rounded-xl shadow-lg px-4 py-3 border border-gray-100">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center">
                      <CircleCheckBig className="w-4 h-4 text-emerald-600" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-gray-900">Verified Fixers</p>
                      <p className="text-[11px] text-gray-500">Rated & reviewed</p>
                    </div>
                  </div>
                </div>
                <div className="absolute -bottom-4 -left-4 bg-white rounded-xl shadow-lg px-4 py-3 border border-gray-100">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                      <Star className="w-4 h-4 text-primary" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-gray-900">4.9 Average</p>
                      <p className="text-[11px] text-gray-500">Customer rating</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="bg-gray-50 py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center text-gray-900 mb-4 font-display">
            {content["how_it_works_title"]}
          </h2>
          <p className="text-center text-gray-500 mb-12 max-w-2xl mx-auto">Post your broken item and get offers from local repair experts</p>

          <div className="grid md:grid-cols-3 gap-8">
            {steps.map((step) => {
              const StepIcon = step.icon;
              return (
                <div key={step.number} className="relative">
                  {/* Step Number */}
                  <div className="flex justify-center mb-4">
                    <div className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center font-bold text-lg">
                      {step.number}
                    </div>
                  </div>

                  {/* Card */}
                  <div className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow border border-gray-100">
                    <div className="flex justify-center mb-4">
                      <div className="w-14 h-14 bg-orange-50 rounded-xl flex items-center justify-center">
                        <StepIcon className="w-7 h-7 text-primary" />
                      </div>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3 text-center">
                      {step.title}
                    </h3>
                    <p className="text-gray-500 text-center leading-relaxed text-sm">
                      {step.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Category Grid Section */}
      <section className="bg-white py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center text-gray-900 mb-4 font-display">
            {content["categories_title"]}
          </h2>
          <p className="text-center text-gray-500 mb-12 max-w-2xl mx-auto">Find the right fixer for any repair job</p>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {categories.map((category) => (
              <Link
                key={category.slug}
                href={`/categories/${category.slug}`}
                className="bg-white rounded-xl border border-gray-100 p-5 hover:border-primary hover:shadow-md transition-all group"
              >
                <div className="text-center">
                  <div className="w-12 h-12 mx-auto bg-orange-50 rounded-xl flex items-center justify-center mb-3 group-hover:bg-orange-100 transition-colors">
                    <CategoryIcon slug={category.slug} className="w-6 h-6 text-primary" />
                  </div>
                  <p className="text-sm font-medium text-gray-700 group-hover:text-primary transition-colors">
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
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 font-display">
              {content["homepage_recent_title"]}
            </h2>
            <Link
              href="/browse"
              className="text-primary font-medium hover:underline flex items-center gap-1.5 text-sm"
            >
              {content["homepage_recent_view_all"]}
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {recentRequests.length === 0 ? (
            <div className="bg-white rounded-xl p-12 text-center shadow-sm border border-gray-100">
              <div className="w-16 h-16 mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <Wrench className="w-8 h-8 text-gray-400" />
              </div>
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
          <h2 className="text-3xl md:text-4xl font-bold text-center text-gray-900 mb-12 font-display">
            {content["trust_title"]}
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { title: content["trust_badge1_title"], desc: content["trust_badge1_desc"], icon: ShieldCheck, bgColor: "bg-emerald-50", iconColor: "text-emerald-600" },
              { title: content["trust_badge2_title"], desc: content["trust_badge2_desc"], icon: Lock, bgColor: "bg-blue-50", iconColor: "text-blue-600" },
              { title: content["trust_badge3_title"], desc: content["trust_badge3_desc"], icon: MessageSquareText, bgColor: "bg-orange-50", iconColor: "text-primary" },
            ].map((badge, i) => {
              const BadgeIcon = badge.icon;
              return (
                <div key={i} className="text-center p-6">
                  <div className={`w-14 h-14 ${badge.bgColor} rounded-xl flex items-center justify-center mx-auto mb-4`}>
                    <BadgeIcon className={`w-7 h-7 ${badge.iconColor}`} />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{badge.title}</h3>
                  <p className="text-gray-500 text-sm leading-relaxed">{badge.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA Section for Fixers */}
      <section className="bg-secondary py-16 md:py-24 text-white">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 font-display">
            {content["homepage_fixer_cta_title"]}
          </h2>
          <p className="text-lg md:text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            {content["homepage_fixer_cta_desc"]}
          </p>

          <Link href="/register">
            <Button variant="primary" size="lg" className="text-base px-8 py-3 h-auto rounded-xl">
              {content["homepage_fixer_cta_button"]}
            </Button>
          </Link>

          <p className="mt-6 text-blue-200 text-sm">
            {content["homepage_fixer_cta_footnote"]}
          </p>
        </div>
      </section>

      {/* Trust / Stats Section */}
      <section className="bg-gray-50 py-16">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 text-center">
            {stats.map((stat, index) => {
              const StatIcon = stat.icon;
              return (
                <div key={index} className="flex flex-col items-center">
                  <div className="w-12 h-12 bg-orange-50 rounded-xl flex items-center justify-center mb-3">
                    <StatIcon className="w-6 h-6 text-primary" />
                  </div>
                  <div className="text-3xl md:text-4xl font-bold text-primary mb-1">
                    {stat.value}
                  </div>
                  <div className="text-gray-500 font-medium text-sm">{stat.label}</div>
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
}
