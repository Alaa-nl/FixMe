import Link from "next/link";
import Image from "next/image";
import { getContentBySection } from "@/lib/siteContent";

export default async function Footer() {
  const content = await getContentBySection("footer");

  return (
    <footer className="hidden md:block bg-secondary text-white mt-auto">
      <div className="max-w-7xl mx-auto px-4 py-12">
        {/* Logo and Slogan */}
        <div className="mb-8">
          <Link href="/" className="inline-block mb-2">
            <Image
              src="/FixMe_logo_letters.svg"
              alt="FixMe"
              width={160}
              height={76}
              className="h-10 w-auto brightness-0 invert"
            />
          </Link>
          <p className="text-blue-200 text-lg">{content["footer_tagline"]}</p>
        </div>

        {/* Links Grid */}
        <div className="grid grid-cols-3 gap-8 mb-8">
          {/* For Customers */}
          <div>
            <h3 className="font-bold text-lg mb-4">For Customers</h3>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/post"
                  className="text-blue-100 hover:text-white transition-colors"
                >
                  Post a Request
                </Link>
              </li>
              <li>
                <Link
                  href="/browse"
                  className="text-blue-100 hover:text-white transition-colors"
                >
                  Browse Requests
                </Link>
              </li>
              <li>
                <Link
                  href="/how-it-works"
                  className="text-blue-100 hover:text-white transition-colors"
                >
                  How It Works
                </Link>
              </li>
              <li>
                <Link
                  href="/categories"
                  className="text-blue-100 hover:text-white transition-colors"
                >
                  Categories
                </Link>
              </li>
            </ul>
          </div>

          {/* For Fixers */}
          <div>
            <h3 className="font-bold text-lg mb-4">For Fixers</h3>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/register"
                  className="text-blue-100 hover:text-white transition-colors"
                >
                  Become a Fixer
                </Link>
              </li>
              <li>
                <Link
                  href="/browse"
                  className="text-blue-100 hover:text-white transition-colors"
                >
                  Find Jobs
                </Link>
              </li>
              <li>
                <Link
                  href="/how-it-works"
                  className="text-blue-100 hover:text-white transition-colors"
                >
                  How to Get Started
                </Link>
              </li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className="font-bold text-lg mb-4">Company</h3>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/how-it-works"
                  className="text-blue-100 hover:text-white transition-colors"
                >
                  About FixMe
                </Link>
              </li>
              <li>
                <Link
                  href="/terms"
                  className="text-blue-100 hover:text-white transition-colors"
                >
                  Terms & Conditions
                </Link>
              </li>
              <li>
                <Link
                  href="/privacy"
                  className="text-blue-100 hover:text-white transition-colors"
                >
                  Privacy Policy
                </Link>
              </li>
              <li>
                <a
                  href="mailto:info@fixme.nl"
                  className="text-blue-100 hover:text-white transition-colors"
                >
                  Contact Us
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* About Text */}
        <div className="border-t border-blue-800 pt-6 mb-6">
          <p className="text-blue-200 text-sm max-w-2xl">
            {content["footer_about"]}
          </p>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-blue-800 pt-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-blue-200 text-sm">
              {content["footer_copyright"]}
            </p>
            <p className="text-blue-200 text-sm">
              Made with love in Amsterdam, Netherlands
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
