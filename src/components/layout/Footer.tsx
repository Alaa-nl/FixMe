import Link from "next/link";
import Image from "next/image";
import { getContentBySection } from "@/lib/siteContent";

export default async function Footer() {
  const content = await getContentBySection("footer");

  return (
    <footer className="hidden md:block bg-secondary relative overflow-hidden mt-auto">
      {/* Subtle noise texture */}
      <div className="absolute inset-0 noise-bg opacity-5" />
      {/* Decorative gradient blob */}
      <div className="absolute bottom-0 right-0 w-80 h-80 bg-primary/[0.06] rounded-full blur-[100px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 py-14 relative z-10">
        {/* Top row — logo + tagline */}
        <div className="mb-10">
          <Link href="/" className="inline-block mb-3">
            <Image
              src="/FixMe_logo_letters.svg"
              alt="FixMe"
              width={160}
              height={76}
              className="h-10 w-auto brightness-0 invert"
            />
          </Link>
          <p className="text-lg font-medium" style={{ color: "rgba(255,255,255,0.45)" }}>
            {content["footer_tagline"] || "Don't throw it away. Fix it."}
          </p>
        </div>

        {/* Links grid */}
        <div className="grid grid-cols-3 gap-8 mb-10">
          <div>
            <h3 className="font-display font-bold text-white text-sm uppercase tracking-wider mb-4">Voor klanten</h3>
            <ul className="space-y-2.5">
              {[
                { href: "/post", label: "Plaats een verzoek" },
                { href: "/browse", label: "Bekijk verzoeken" },
                { href: "/how-it-works", label: "Hoe het werkt" },
                { href: "/categories", label: "Categorieën" },
              ].map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-sm hover:text-white transition-colors" style={{ color: "rgba(255,255,255,0.5)" }}>
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-display font-bold text-white text-sm uppercase tracking-wider mb-4">Voor fixers</h3>
            <ul className="space-y-2.5">
              {[
                { href: "/register", label: "Word een Fixer" },
                { href: "/browse", label: "Vind klussen" },
                { href: "/how-it-works", label: "Hoe te beginnen" },
              ].map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-sm hover:text-white transition-colors" style={{ color: "rgba(255,255,255,0.5)" }}>
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-display font-bold text-white text-sm uppercase tracking-wider mb-4">Bedrijf</h3>
            <ul className="space-y-2.5">
              {[
                { href: "/how-it-works", label: "Over FixMe" },
                { href: "/terms", label: "Voorwaarden" },
                { href: "/privacy", label: "Privacybeleid" },
                { href: "mailto:info@fixme.nl", label: "Contact", external: true },
              ].map((link) => (
                <li key={link.href}>
                  {link.external ? (
                    <a href={link.href} className="text-sm hover:text-white transition-colors" style={{ color: "rgba(255,255,255,0.5)" }}>
                      {link.label}
                    </a>
                  ) : (
                    <Link href={link.href} className="text-sm hover:text-white transition-colors" style={{ color: "rgba(255,255,255,0.5)" }}>
                      {link.label}
                    </Link>
                  )}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* About text */}
        <div className="border-t border-white/10 pt-6 mb-6">
          <p className="text-sm max-w-2xl leading-relaxed" style={{ color: "rgba(255,255,255,0.3)" }}>
            {content["footer_about"]}
          </p>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-white/10 pt-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-xs" style={{ color: "rgba(255,255,255,0.3)" }}>
              {content["footer_copyright"] || "© 2025 FixMe B.V. Alle rechten voorbehouden."}
            </p>
            <p className="text-xs" style={{ color: "rgba(255,255,255,0.25)" }}>
              Gemaakt met ❤️ in Amsterdam
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
