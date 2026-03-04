import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "Learn how FixMe collects, uses, and protects your personal data. GDPR/AVG compliant privacy policy for our repair marketplace platform.",
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-sm p-8 mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">
            Privacy Policy
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
              1. Who We Are
            </h2>
            <p className="text-gray-700 leading-relaxed mb-3">
              FixMe B.V. is a Dutch company registered in Amsterdam. We operate
              the FixMe marketplace platform that connects customers with local
              repair professionals.
            </p>
            <p className="text-gray-700 leading-relaxed">
              <strong>Company Details:</strong>
              <br />
              FixMe B.V.
              <br />
              Amsterdam, Netherlands
              <br />
              KVK Number: [To be assigned]
              <br />
              Email:{" "}
              <a
                href="mailto:privacy@fixme.nl"
                className="text-[#FF6B35] hover:underline"
              >
                privacy@fixme.nl
              </a>
            </p>
          </section>

          {/* Section 2 */}
          <section>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              2. What Data We Collect
            </h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              We collect the following types of information:
            </p>

            <div className="space-y-4">
              <div>
                <h3 className="font-bold text-gray-800 mb-2">
                  Account Information:
                </h3>
                <p className="text-gray-700 leading-relaxed">
                  Name, email address, phone number, password (encrypted), user
                  type (customer or fixer), city, and profile photo.
                </p>
              </div>

              <div>
                <h3 className="font-bold text-gray-800 mb-2">
                  For Fixers Only:
                </h3>
                <p className="text-gray-700 leading-relaxed">
                  KVK registration number, business name, skills, service area,
                  and bank account details for payouts.
                </p>
              </div>

              <div>
                <h3 className="font-bold text-gray-800 mb-2">
                  Repair Requests:
                </h3>
                <p className="text-gray-700 leading-relaxed">
                  Photos of broken items, descriptions, location (city and
                  approximate address), category, urgency, and AI-generated
                  diagnosis.
                </p>
              </div>

              <div>
                <h3 className="font-bold text-gray-800 mb-2">
                  Messages & Communication:
                </h3>
                <p className="text-gray-700 leading-relaxed">
                  All messages sent between customers and fixers through the
                  platform, including timestamps and read receipts.
                </p>
              </div>

              <div>
                <h3 className="font-bold text-gray-800 mb-2">
                  Payment Information:
                </h3>
                <p className="text-gray-700 leading-relaxed">
                  Transaction history, payment amounts, and payment methods
                  (processed securely by our payment provider).
                </p>
              </div>

              <div>
                <h3 className="font-bold text-gray-800 mb-2">
                  Usage Data:
                </h3>
                <p className="text-gray-700 leading-relaxed">
                  IP address, browser type, device information, pages visited,
                  time spent on the platform, and features used.
                </p>
              </div>
            </div>
          </section>

          {/* Section 3 */}
          <section>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              3. Why We Collect It
            </h2>
            <p className="text-gray-700 leading-relaxed mb-3">
              We use your personal data to:
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
              <li>
                Provide and operate the FixMe platform (account management,
                matching customers with fixers, facilitating repairs)
              </li>
              <li>
                Process payments securely and distribute payouts to fixers
              </li>
              <li>
                Send important notifications about your requests, offers,
                messages, and account activity
              </li>
              <li>
                Verify fixer credentials and ensure platform safety
              </li>
              <li>
                Handle disputes and provide customer support
              </li>
              <li>
                Improve the platform based on usage patterns and feedback
              </li>
              <li>
                Comply with legal obligations (tax records, anti-fraud measures)
              </li>
              <li>
                Send marketing emails (only if you opt in, and you can
                unsubscribe anytime)
              </li>
            </ul>
          </section>

          {/* Section 4 */}
          <section>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              4. Legal Basis
            </h2>
            <p className="text-gray-700 leading-relaxed mb-3">
              Under EU/Dutch law (GDPR/AVG), we process your data based on:
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
              <li>
                <strong>Contract Performance:</strong> Processing is necessary
                to provide the service you signed up for (posting requests,
                making offers, processing payments).
              </li>
              <li>
                <strong>Legitimate Interest:</strong> We have a legitimate
                interest in preventing fraud, improving the platform, and
                ensuring user safety.
              </li>
              <li>
                <strong>Consent:</strong> For marketing emails and non-essential
                cookies, we ask for your explicit consent.
              </li>
              <li>
                <strong>Legal Obligation:</strong> We're required by law to keep
                payment records for 7 years for tax purposes.
              </li>
            </ul>
          </section>

          {/* Section 5 */}
          <section>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              5. How We Store Data
            </h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              All data is stored on secure servers located within the European
              Union. We use industry-standard encryption and security measures
              to protect your information.
            </p>
            <p className="text-gray-700 leading-relaxed mb-4">
              <strong>Security Measures:</strong>
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
              <li>Passwords are hashed and never stored in plain text</li>
              <li>All connections use SSL/TLS encryption (HTTPS)</li>
              <li>
                Regular security audits and vulnerability testing
              </li>
              <li>
                Access to personal data is restricted to authorized personnel
                only
              </li>
              <li>
                Automated backups with encrypted storage
              </li>
            </ul>
          </section>

          {/* Section 6 */}
          <section>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              6. Sharing Data
            </h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              We do not sell your personal data to third parties. We only share
              data when necessary:
            </p>

            <div className="space-y-4">
              <div>
                <h3 className="font-bold text-gray-800 mb-2">
                  With Fixers (when you accept an offer):
                </h3>
                <p className="text-gray-700 leading-relaxed">
                  Your name, phone number, and approximate location are shared
                  so the fixer can contact you and arrange the repair.
                </p>
              </div>

              <div>
                <h3 className="font-bold text-gray-800 mb-2">
                  With Customers (when you make an offer):
                </h3>
                <p className="text-gray-700 leading-relaxed">
                  Your name, profile photo, ratings, and offer details are
                  visible to help them choose a fixer.
                </p>
              </div>

              <div>
                <h3 className="font-bold text-gray-800 mb-2">
                  With Payment Processors:
                </h3>
                <p className="text-gray-700 leading-relaxed">
                  We use trusted payment providers to process transactions
                  securely. They receive only the information needed to complete
                  payments.
                </p>
              </div>

              <div>
                <h3 className="font-bold text-gray-800 mb-2">
                  With Law Enforcement:
                </h3>
                <p className="text-gray-700 leading-relaxed">
                  If required by law or to protect users from fraud or illegal
                  activity.
                </p>
              </div>
            </div>

            <p className="text-gray-700 leading-relaxed mt-4">
              We <strong>never</strong> sell your data to advertisers or
              marketing companies.
            </p>
          </section>

          {/* Section 7 */}
          <section>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              7. Cookies
            </h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              We use cookies to improve your experience and analyze platform
              usage:
            </p>

            <div className="space-y-3">
              <div>
                <h3 className="font-bold text-gray-800 mb-2">
                  Essential Cookies:
                </h3>
                <p className="text-gray-700 leading-relaxed">
                  Required for the platform to work (login sessions, security).
                  These cannot be disabled.
                </p>
              </div>

              <div>
                <h3 className="font-bold text-gray-800 mb-2">
                  Analytics Cookies:
                </h3>
                <p className="text-gray-700 leading-relaxed">
                  Help us understand how people use FixMe so we can improve it.
                  You can opt out in your browser settings.
                </p>
              </div>
            </div>

            <p className="text-gray-700 leading-relaxed mt-4">
              You can manage cookie preferences in your browser settings or by
              contacting us.
            </p>
          </section>

          {/* Section 8 */}
          <section>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              8. Your Rights (GDPR/AVG)
            </h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              Under European data protection law, you have the right to:
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
              <li>
                <strong>Access:</strong> Request a copy of all personal data we
                have about you
              </li>
              <li>
                <strong>Correction:</strong> Update or correct inaccurate
                information
              </li>
              <li>
                <strong>Deletion:</strong> Request deletion of your account and
                data (some data may be retained for legal reasons)
              </li>
              <li>
                <strong>Data Export:</strong> Download your data in a
                machine-readable format
              </li>
              <li>
                <strong>Withdraw Consent:</strong> Opt out of marketing emails
                or non-essential cookies anytime
              </li>
              <li>
                <strong>Restrict Processing:</strong> Temporarily limit how we
                use your data
              </li>
              <li>
                <strong>Object:</strong> Object to processing based on
                legitimate interest
              </li>
            </ul>
            <p className="text-gray-700 leading-relaxed mt-4">
              To exercise these rights, go to{" "}
              <Link
                href="/settings"
                className="text-[#FF6B35] hover:underline font-semibold"
              >
                Settings
              </Link>{" "}
              or contact us at{" "}
              <a
                href="mailto:privacy@fixme.nl"
                className="text-[#FF6B35] hover:underline"
              >
                privacy@fixme.nl
              </a>
              .
            </p>
          </section>

          {/* Section 9 */}
          <section>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              9. Data Retention
            </h2>
            <p className="text-gray-700 leading-relaxed mb-3">
              We keep your data for as long as necessary:
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
              <li>
                <strong>Active Accounts:</strong> Data is kept while your
                account is active
              </li>
              <li>
                <strong>Closed Accounts:</strong> Most data is deleted within 1
                year after account closure
              </li>
              <li>
                <strong>Payment Records:</strong> Kept for 7 years as required
                by Dutch tax law
              </li>
              <li>
                <strong>Dispute Records:</strong> Kept for 3 years in case of
                legal claims
              </li>
              <li>
                <strong>Anonymized Analytics:</strong> May be kept indefinitely
                for research purposes
              </li>
            </ul>
          </section>

          {/* Section 10 */}
          <section>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              10. Children
            </h2>
            <p className="text-gray-700 leading-relaxed">
              FixMe is not intended for users under 18 years old. We do not
              knowingly collect data from children. If we discover that a child
              has created an account, we will delete it immediately.
            </p>
          </section>

          {/* Section 11 */}
          <section>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              11. Changes to This Policy
            </h2>
            <p className="text-gray-700 leading-relaxed">
              We may update this Privacy Policy from time to time. We'll notify
              you of significant changes via email or a prominent notice on the
              platform. Continued use after changes means you accept the updated
              policy.
            </p>
          </section>

          {/* Section 12 */}
          <section>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              12. Contact
            </h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              If you have questions about this privacy policy or want to
              exercise your data rights, contact us at:
            </p>
            <p className="text-gray-700 leading-relaxed">
              <strong>Email:</strong>{" "}
              <a
                href="mailto:privacy@fixme.nl"
                className="text-[#FF6B35] hover:underline"
              >
                privacy@fixme.nl
              </a>
              <br />
              <strong>Address:</strong> FixMe B.V., Amsterdam, Netherlands
            </p>
            <p className="text-gray-700 leading-relaxed mt-4">
              You can also{" "}
              <Link
                href="/settings"
                className="text-[#FF6B35] hover:underline font-semibold"
              >
                delete your account and data
              </Link>{" "}
              directly from your account settings.
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
