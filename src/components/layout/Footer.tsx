import Link from "next/link";

export default function Footer() {
  return (
    <footer className="hidden md:block bg-gray-100 border-t border-gray-200 mt-auto">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <Link href="/" className="text-xl font-bold text-primary">
              FixMe
            </Link>
          </div>

          {/* Links */}
          <div className="flex flex-wrap items-center justify-center gap-6 text-sm">
            <Link
              href="/how-it-works"
              className="text-gray-600 hover:text-primary transition-colors"
            >
              How it works
            </Link>
            <Link
              href="/categories"
              className="text-gray-600 hover:text-primary transition-colors"
            >
              Categories
            </Link>
            <Link
              href="/terms"
              className="text-gray-600 hover:text-primary transition-colors"
            >
              Terms
            </Link>
            <Link
              href="/privacy"
              className="text-gray-600 hover:text-primary transition-colors"
            >
              Privacy
            </Link>
          </div>

          {/* Copyright */}
          <div className="text-sm text-gray-500">
            © 2025 FixMe. All rights reserved.
          </div>
        </div>
      </div>
    </footer>
  );
}
