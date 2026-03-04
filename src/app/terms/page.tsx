import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms & Conditions",
  description: "Read FixMe's terms and conditions for using our repair marketplace platform. Learn about user responsibilities, payments, disputes, and more.",
};

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-sm p-8 mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">
            Terms & Conditions
          </h1>
          <p className="text-gray-600">
            Last updated: <span className="font-semibold">March 3, 2026</span>
          </p>
        </div>

        {/* Content */}
        <div className="bg-white rounded-xl shadow-sm p-8 space-y-10">
          {/* Section 1 */}
          <section>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              1. About FixMe
            </h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              FixMe is an online marketplace that connects people who need
              repairs with local repair professionals ("Fixers"). We provide the
              platform, but we are not a repair company ourselves.
            </p>
            <p className="text-gray-700 leading-relaxed">
              All repairs are performed by independent Fixers. FixMe acts as an
              intermediary and payment processor, but we are not responsible for
              the quality or outcome of any repair work.
            </p>
          </section>

          {/* Section 2 */}
          <section>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              2. Account Registration
            </h2>
            <p className="text-gray-700 leading-relaxed mb-3">
              To use FixMe, you must create an account. By registering, you
              agree to:
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
              <li>Be at least 18 years old</li>
              <li>Provide accurate and complete information</li>
              <li>Keep your account credentials secure</li>
              <li>Have only one account per person</li>
              <li>
                Not share your account with others or let anyone else use it
              </li>
            </ul>
            <p className="text-gray-700 leading-relaxed mt-4">
              We reserve the right to suspend or delete accounts that violate
              these terms or engage in fraudulent activity.
            </p>
          </section>

          {/* Section 3 */}
          <section>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              3. For Customers
            </h2>
            <p className="text-gray-700 leading-relaxed mb-3">
              As a customer posting repair requests, you agree to:
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
              <li>
                Provide accurate descriptions and photos of items needing repair
              </li>
              <li>
                Only post items that you own or have permission to repair
              </li>
              <li>
                Pay for accepted offers according to the agreed price and terms
              </li>
              <li>
                Be available and responsive to communicate with your chosen
                Fixer
              </li>
              <li>
                Confirm completion of work within 48 hours, or open a dispute
                if needed
              </li>
              <li>Not post illegal, stolen, or prohibited items</li>
            </ul>
            <p className="text-gray-700 leading-relaxed mt-4">
              Posting repair requests is free. You only pay when you accept an
              offer from a Fixer.
            </p>
          </section>

          {/* Section 4 */}
          <section>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              4. For Fixers
            </h2>
            <p className="text-gray-700 leading-relaxed mb-3">
              As a Fixer offering repair services, you agree to:
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
              <li>
                Have a valid KVK (Chamber of Commerce) registration number
              </li>
              <li>
                Be legally authorized to operate a business in the Netherlands
              </li>
              <li>
                Provide honest and realistic estimates for repair work
              </li>
              <li>
                Complete repairs to a professional standard and within the
                agreed timeframe
              </li>
              <li>
                Communicate clearly with customers throughout the repair process
              </li>
              <li>
                Comply with all applicable laws, regulations, and safety
                standards
              </li>
            </ul>
            <p className="text-gray-700 leading-relaxed mt-4">
              You are an independent contractor, not an employee of FixMe. You
              are responsible for your own taxes, insurance, and business
              operations.
            </p>
          </section>

          {/* Section 5 */}
          <section>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              5. Payments & Fees
            </h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              <strong>Commission:</strong> FixMe charges Fixers a 15% commission
              on each completed job. This fee is automatically deducted from the
              payout.
            </p>
            <p className="text-gray-700 leading-relaxed mb-4">
              <strong>Escrow System:</strong> When a customer accepts an offer,
              payment is held in escrow by FixMe. The money is released to the
              Fixer only after the customer confirms the repair is complete.
            </p>
            <p className="text-gray-700 leading-relaxed mb-4">
              <strong>Automatic Release:</strong> If the customer does not
              confirm or dispute within 48 hours of the Fixer marking the job as
              complete, payment is automatically released to the Fixer.
            </p>
            <p className="text-gray-700 leading-relaxed">
              <strong>Refunds:</strong> Refunds are only issued through the
              dispute process. If a dispute is resolved in favor of the
              customer, the refund is processed within 5-7 business days.
            </p>
          </section>

          {/* Section 6 */}
          <section>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              6. Reviews & Ratings
            </h2>
            <p className="text-gray-700 leading-relaxed mb-3">
              After a job is completed, both customers and Fixers can leave
              reviews. You agree to:
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
              <li>Write honest and truthful reviews based on your experience</li>
              <li>
                Not post fake reviews or ask others to write reviews for you
              </li>
              <li>
                Not use reviews to harass, threaten, or defame anyone
              </li>
              <li>
                Not include personal information (phone numbers, addresses) in
                reviews
              </li>
            </ul>
            <p className="text-gray-700 leading-relaxed mt-4">
              We reserve the right to remove reviews that violate these rules or
              contain abusive, offensive, or inappropriate content.
            </p>
          </section>

          {/* Section 7 */}
          <section>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              7. Disputes
            </h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              If you're unhappy with a repair, you have 48 hours after the
              Fixer marks the job as complete to open a dispute.
            </p>
            <p className="text-gray-700 leading-relaxed mb-4">
              Our admin team will review evidence from both sides (photos,
              messages, repair details) and make a final decision. Decisions are
              binding and cannot be appealed unless new evidence is provided.
            </p>
            <p className="text-gray-700 leading-relaxed">
              Possible outcomes: full refund to customer, partial refund, or no
              refund if the repair was done correctly.
            </p>
          </section>

          {/* Section 8 */}
          <section>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              8. Prohibited Content
            </h2>
            <p className="text-gray-700 leading-relaxed mb-3">
              You may not use FixMe to:
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
              <li>
                Post or repair illegal items (stolen goods, weapons, drugs, etc.)
              </li>
              <li>
                Spam, scam, or attempt to defraud other users
              </li>
              <li>
                Harass, threaten, or abuse other users
              </li>
              <li>
                Bypass the platform to avoid paying fees
              </li>
              <li>
                Scrape data, use bots, or automated systems without permission
              </li>
              <li>
                Impersonate others or create fake accounts
              </li>
            </ul>
            <p className="text-gray-700 leading-relaxed mt-4">
              Violations may result in immediate account suspension and, if
              necessary, reporting to law enforcement.
            </p>
          </section>

          {/* Section 9 */}
          <section>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              9. Liability
            </h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              FixMe is a marketplace platform. We are not responsible for:
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
              <li>The quality, safety, or legality of repairs performed</li>
              <li>The accuracy of repair requests or offers</li>
              <li>Disputes between customers and Fixers</li>
              <li>
                Loss, damage, or injury resulting from repairs or interactions
              </li>
              <li>
                Actions, conduct, or content of users on the platform
              </li>
            </ul>
            <p className="text-gray-700 leading-relaxed mt-4">
              <strong>Limitation of Liability:</strong> To the maximum extent
              permitted by law, FixMe's liability is limited to the amount of
              fees paid for the specific transaction in question. We are not
              liable for indirect, incidental, or consequential damages.
            </p>
            <p className="text-gray-700 leading-relaxed mt-4">
              Users interact at their own risk. We recommend checking Fixer
              profiles, ratings, and reviews before accepting offers.
            </p>
          </section>

          {/* Section 10 */}
          <section>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              10. Privacy
            </h2>
            <p className="text-gray-700 leading-relaxed">
              Your use of FixMe is also governed by our{" "}
              <Link
                href="/privacy"
                className="text-[#FF6B35] hover:underline font-semibold"
              >
                Privacy Policy
              </Link>
              , which explains how we collect, use, and protect your personal
              data.
            </p>
          </section>

          {/* Section 11 */}
          <section>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              11. Changes to Terms
            </h2>
            <p className="text-gray-700 leading-relaxed">
              We may update these Terms & Conditions from time to time. We'll
              notify you of significant changes via email or a notice on the
              platform. Continued use of FixMe after changes means you accept
              the updated terms.
            </p>
          </section>

          {/* Section 12 */}
          <section>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              12. Contact
            </h2>
            <p className="text-gray-700 leading-relaxed">
              If you have questions about these terms, please contact us at:
            </p>
            <p className="text-gray-700 leading-relaxed mt-3">
              <strong>Email:</strong>{" "}
              <a
                href="mailto:info@fixme.nl"
                className="text-[#FF6B35] hover:underline"
              >
                info@fixme.nl
              </a>
            </p>
            <p className="text-gray-700 leading-relaxed mt-2">
              <strong>Address:</strong> FixMe B.V., Amsterdam, Netherlands
            </p>
          </section>
        </div>

        {/* Back to home link */}
        <div className="text-center mt-8">
          <Link
            href="/"
            className="text-[#FF6B35] hover:underline font-semibold"
          >
            ← Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
