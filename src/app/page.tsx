import Link from "next/link";
import { Camera, HandCoins, CircleCheckBig, ShieldCheck, Lock, MessageSquareText, Wrench, ArrowRight, Star, MapPin, Users } from "lucide-react";
import Button from "@/components/ui/button";
import { prisma } from "@/lib/db";
import { CategoryIcon } from "@/lib/categoryIconsReact";
import RequestCard from "@/components/request/RequestCard";
import { getContentBySection } from "@/lib/siteContent";
import HomepageAnimations from "@/components/home/HomepageAnimations";

export const dynamic = "force-dynamic";

export default async function Home() {
  const categories = await prisma.category.findMany({
    where: { isActive: true },
    orderBy: { name: "asc" },
  });

  const recentRequests = await prisma.repairRequest.findMany({
    where: { status: "OPEN" },
    orderBy: { createdAt: "desc" },
    take: 4,
    include: {
      category: { select: { name: true, slug: true } },
      customer: { select: { name: true, avatarUrl: true } },
      _count: { select: { offers: true } },
    },
  });

  const content = await getContentBySection("homepage");

  const steps = [
    { number: 1, icon: Camera, title: content["how_it_works_step1_title"], description: content["how_it_works_step1_desc"] },
    { number: 2, icon: HandCoins, title: content["how_it_works_step2_title"], description: content["how_it_works_step2_desc"] },
    { number: 3, icon: CircleCheckBig, title: content["how_it_works_step3_title"], description: content["how_it_works_step3_desc"] },
  ];

  const stats = [
    { value: content["stats_repairs"], label: content["stats_repairs_label"], icon: Wrench },
    { value: content["stats_fixers"], label: content["stats_fixers_label"], icon: Users },
    { value: content["stats_rating"], label: content["stats_rating_label"], icon: Star },
    { value: content["stats_cities"], label: content["stats_cities_label"], icon: MapPin },
  ];

  return (
    <div className="flex-1">
      {/* Hero Section — warm atmospheric gradient */}
      <section className="hero-gradient relative overflow-hidden">
        {/* Decorative circles */}
        <div className="absolute top-20 right-[10%] w-64 h-64 bg-primary/[0.04] rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-10 left-[5%] w-48 h-48 bg-secondary/[0.03] rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 py-16 md:py-24 lg:py-28 relative z-10">
          <div className="grid md:grid-cols-2 gap-12 lg:gap-16 items-center">
            {/* Left — copy */}
            <HomepageAnimations variant="hero-left">
              <div className="text-center md:text-left">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-primary/[0.08] rounded-full text-primary text-sm font-medium mb-6">
                  <Wrench className="w-3.5 h-3.5" />
                  <span>Nederlands reparatie platform</span>
                </div>

                <h1 className="text-4xl md:text-5xl lg:text-[3.5rem] xl:text-6xl font-extrabold text-secondary leading-[1.08] mb-6 font-display tracking-tight">
                  {content["hero_title"] || "Don't throw it away"}
                </h1>

                <p className="text-lg md:text-xl text-gray-500 mb-8 leading-relaxed max-w-lg">
                  {content["hero_subtitle"] || "Post your broken item and get offers from verified local repair experts near you."}
                </p>

                {/* CTA buttons */}
                <div className="flex flex-col sm:flex-row gap-3 mb-8">
                  <Link href="/post">
                    <Button variant="primary" size="lg" className="w-full sm:w-auto text-base px-8 py-3.5 h-auto rounded-2xl font-bold shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/25 transition-all">
                      {content["hero_cta_primary"] || "Post een reparatieverzoek"}
                    </Button>
                  </Link>
                  <Link href="/register">
                    <Button variant="outline" size="lg" className="w-full sm:w-auto text-base px-8 py-3.5 h-auto rounded-2xl font-bold border-2 border-secondary/20 text-secondary hover:bg-secondary/[0.04] transition-all">
                      {content["hero_cta_secondary"] || "Word een Fixer"}
                    </Button>
                  </Link>
                </div>

                {/* Trust indicators */}
                <div className="flex flex-col sm:flex-row gap-4 text-sm text-gray-500">
                  <span className="flex items-center gap-2">
                    <CircleCheckBig className="w-4 h-4 text-success flex-shrink-0" /> {content["hero_trust_free"] || "Gratis plaatsen"}
                  </span>
                  <span className="flex items-center gap-2">
                    <CircleCheckBig className="w-4 h-4 text-success flex-shrink-0" /> {content["hero_trust_pay"] || "Betaal na reparatie"}
                  </span>
                  <span className="flex items-center gap-2">
                    <CircleCheckBig className="w-4 h-4 text-success flex-shrink-0" /> {content["hero_trust_verified"] || "Geverifieerde fixers"}
                  </span>
                </div>
              </div>
            </HomepageAnimations>

            {/* Right — illustration card stack */}
            <HomepageAnimations variant="hero-right">
              <div className="hidden md:flex items-center justify-center">
                <div className="relative w-full max-w-sm">
                  {/* Main visual card */}
                  <div className="w-full aspect-[4/3] bg-gradient-to-br from-secondary/[0.06] to-primary/[0.08] rounded-3xl flex items-center justify-center border border-secondary/[0.08] relative overflow-hidden">
                    <div className="absolute inset-0 noise-bg" />
                    <div className="text-center relative z-10">
                      <Wrench className="w-20 h-20 text-primary/25 mx-auto mb-3" strokeWidth={1.2} />
                      <p className="text-secondary/40 font-display font-bold text-xl">FixMe</p>
                    </div>
                  </div>

                  {/* Floating card — top right */}
                  <div className="absolute -top-5 -right-5 bg-white rounded-2xl shadow-elevated px-4 py-3 border border-gray-100/80" style={{ animation: "float 4s ease-in-out infinite" }}>
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 bg-success/10 rounded-xl flex items-center justify-center">
                        <CircleCheckBig className="w-4.5 h-4.5 text-success" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-gray-800">Geverifieerd</p>
                        <p className="text-[11px] text-gray-400">Beoordeeld & betrouwbaar</p>
                      </div>
                    </div>
                  </div>

                  {/* Floating card — bottom left */}
                  <div className="absolute -bottom-5 -left-5 bg-white rounded-2xl shadow-elevated px-4 py-3 border border-gray-100/80" style={{ animation: "float 4s ease-in-out infinite 1s" }}>
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 bg-primary/10 rounded-xl flex items-center justify-center">
                        <Star className="w-4.5 h-4.5 text-primary" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-gray-800">4.9 Gemiddeld</p>
                        <p className="text-[11px] text-gray-400">Klantbeoordeling</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </HomepageAnimations>
          </div>
        </div>
      </section>

      {/* How It Works — warm background */}
      <section className="warm-section relative py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 relative z-10">
          <div className="text-center mb-14">
            <p className="text-primary font-bold text-sm uppercase tracking-wider mb-3">Hoe het werkt</p>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-secondary font-display tracking-tight">
              {content["how_it_works_title"] || "Three simple steps"}
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6 lg:gap-8">
            {steps.map((step) => {
              const StepIcon = step.icon;
              return (
                <HomepageAnimations key={step.number} variant="stagger" index={step.number - 1}>
                  <div className="relative group">
                    {/* Step number badge */}
                    <div className="absolute -top-4 left-6 z-10">
                      <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center font-display font-bold text-sm shadow-lg shadow-primary/20">
                        {step.number}
                      </div>
                    </div>

                    {/* Card */}
                    <div className="bg-white rounded-2xl p-6 pt-8 shadow-card group-hover:shadow-card-hover transition-all duration-300 border border-gray-100/60 card-lift">
                      <div className="w-14 h-14 bg-primary/[0.07] rounded-2xl flex items-center justify-center mb-5 group-hover:bg-primary/[0.12] transition-colors">
                        <StepIcon className="w-7 h-7 text-primary" />
                      </div>
                      <h3 className="text-lg font-bold text-secondary mb-2 font-display">
                        {step.title}
                      </h3>
                      <p className="text-gray-500 leading-relaxed text-[15px]">
                        {step.description}
                      </p>
                    </div>
                  </div>
                </HomepageAnimations>
              );
            })}
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="bg-white py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-14">
            <p className="text-primary font-bold text-sm uppercase tracking-wider mb-3">Categorieën</p>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-secondary font-display tracking-tight">
              {content["categories_title"] || "What needs fixing?"}
            </h2>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 md:gap-4">
            {categories.map((category, i) => (
              <Link
                key={category.slug}
                href={`/categories/${category.slug}`}
                className="bg-white rounded-2xl border border-gray-100 p-5 hover:border-primary/30 transition-all group card-lift"
              >
                <div className="text-center">
                  <div className="w-12 h-12 mx-auto bg-gradient-to-br from-primary/[0.08] to-primary/[0.04] rounded-2xl flex items-center justify-center mb-3 group-hover:from-primary/[0.15] group-hover:to-primary/[0.08] transition-all">
                    <CategoryIcon slug={category.slug} className="w-6 h-6 text-primary" />
                  </div>
                  <p className="text-sm font-semibold text-gray-700 group-hover:text-primary transition-colors">
                    {category.name}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Recent Repair Requests */}
      <section className="warm-section relative py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 relative z-10">
          <div className="flex justify-between items-end mb-10">
            <div>
              <p className="text-primary font-bold text-sm uppercase tracking-wider mb-3">Nieuwste verzoeken</p>
              <h2 className="text-3xl md:text-4xl font-extrabold text-secondary font-display tracking-tight">
                {content["homepage_recent_title"] || "Recent repair requests"}
              </h2>
            </div>
            <Link
              href="/browse"
              className="hidden sm:flex items-center gap-1.5 text-primary font-bold text-sm hover:gap-2.5 transition-all group"
            >
              {content["homepage_recent_view_all"] || "Bekijk alles"}
              <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>

          {recentRequests.length === 0 ? (
            <div className="bg-white rounded-3xl p-12 text-center shadow-card border border-gray-100/60">
              <div className="w-16 h-16 mx-auto bg-gray-50 rounded-2xl flex items-center justify-center mb-4">
                <Wrench className="w-8 h-8 text-gray-300" />
              </div>
              <p className="text-gray-400 text-lg mb-6 font-medium">
                {content["homepage_recent_empty"] || "No repair requests yet"}
              </p>
              <Link href="/post">
                <Button variant="primary" size="lg" className="rounded-2xl font-bold px-8">
                  {content["homepage_recent_empty_cta"] || "Be the first to post"}
                </Button>
              </Link>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5">
              {recentRequests.map((request, i) => (
                <HomepageAnimations key={request.id} variant="stagger" index={i}>
                  <RequestCard request={request} />
                </HomepageAnimations>
              ))}
            </div>
          )}

          {/* Mobile view-all link */}
          <div className="sm:hidden mt-6 text-center">
            <Link href="/browse" className="text-primary font-bold text-sm inline-flex items-center gap-1.5">
              {content["homepage_recent_view_all"] || "Bekijk alles"}
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Trust Badges */}
      <section className="bg-white py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-secondary font-display tracking-tight">
              {content["trust_title"] || "Why choose FixMe?"}
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6 lg:gap-8">
            {[
              { title: content["trust_badge1_title"], desc: content["trust_badge1_desc"], icon: ShieldCheck, color: "success" },
              { title: content["trust_badge2_title"], desc: content["trust_badge2_desc"], icon: Lock, color: "secondary" },
              { title: content["trust_badge3_title"], desc: content["trust_badge3_desc"], icon: MessageSquareText, color: "primary" },
            ].map((badge, i) => {
              const BadgeIcon = badge.icon;
              const bgMap: Record<string, string> = {
                success: "bg-success/[0.08]",
                secondary: "bg-secondary/[0.08]",
                primary: "bg-primary/[0.08]",
              };
              const iconMap: Record<string, string> = {
                success: "text-success",
                secondary: "text-secondary",
                primary: "text-primary",
              };
              return (
                <HomepageAnimations key={i} variant="stagger" index={i}>
                  <div className="text-center p-8 rounded-2xl hover:bg-gray-50/50 transition-colors">
                    <div className={`w-16 h-16 ${bgMap[badge.color]} rounded-2xl flex items-center justify-center mx-auto mb-5`}>
                      <BadgeIcon className={`w-8 h-8 ${iconMap[badge.color]}`} />
                    </div>
                    <h3 className="text-lg font-bold text-secondary mb-2 font-display">{badge.title}</h3>
                    <p className="text-gray-500 leading-relaxed text-[15px]">{badge.desc}</p>
                  </div>
                </HomepageAnimations>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA for Fixers — bold navy section */}
      <section className="bg-secondary relative overflow-hidden py-16 md:py-24">
        <div className="absolute inset-0 noise-bg opacity-5" />
        {/* Decorative gradient */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary/[0.08] rounded-full blur-[100px] pointer-events-none" />

        <div className="max-w-4xl mx-auto px-4 text-center relative z-10">
          <p className="text-primary font-bold text-sm uppercase tracking-wider mb-4">Voor vakmensen</p>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-white mb-5 font-display tracking-tight">
            {content["homepage_fixer_cta_title"] || "Are you a repair expert?"}
          </h2>
          <p className="text-lg md:text-xl text-secondary-200 mb-10 max-w-2xl mx-auto leading-relaxed" style={{ color: "rgba(255,255,255,0.6)" }}>
            {content["homepage_fixer_cta_desc"] || "Join our network of verified fixers and start earning."}
          </p>

          <Link href="/register">
            <Button variant="primary" size="lg" className="text-base px-10 py-4 h-auto rounded-2xl font-bold shadow-lg shadow-primary/30 hover:shadow-xl hover:shadow-primary/40 transition-all">
              {content["homepage_fixer_cta_button"] || "Word een Fixer"}
            </Button>
          </Link>

          <p className="mt-6 text-sm" style={{ color: "rgba(255,255,255,0.35)" }}>
            {content["homepage_fixer_cta_footnote"] || "No commission on your first 5 repairs"}
          </p>
        </div>
      </section>

      {/* Stats Strip */}
      <section className="bg-white py-14 border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
            {stats.map((stat, index) => {
              const StatIcon = stat.icon;
              return (
                <HomepageAnimations key={index} variant="stagger" index={index}>
                  <div className="text-center">
                    <div className="w-12 h-12 bg-primary/[0.07] rounded-2xl flex items-center justify-center mx-auto mb-3">
                      <StatIcon className="w-6 h-6 text-primary" />
                    </div>
                    <div className="text-3xl md:text-4xl font-extrabold text-secondary mb-1 font-display">
                      {stat.value}
                    </div>
                    <div className="text-gray-400 font-medium text-sm">{stat.label}</div>
                  </div>
                </HomepageAnimations>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
}
