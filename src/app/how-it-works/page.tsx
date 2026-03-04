"use client";

import { useState } from "react";
import Link from "next/link";
import Button from "@/components/ui/Button";
import {
  Camera,
  MessageCircle,
  CheckCircle,
  CreditCard,
  UserPlus,
  Search,
  Send,
  Wrench,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

export default function HowItWorksPage() {
  const [activeTab, setActiveTab] = useState<"customers" | "fixers">("customers");
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const customerSteps = [
    {
      icon: Camera,
      title: "Post your broken item",
      description:
        "Upload photos and describe what's broken. Our AI gives you an instant diagnosis and estimated repair cost.",
    },
    {
      icon: MessageCircle,
      title: "Receive offers",
      description:
        "Local fixers see your request and send you price offers with their availability and estimated time.",
    },
    {
      icon: CheckCircle,
      title: "Pick your fixer",
      description:
        "Compare prices, ratings, and reviews. Accept the offer that works best for you.",
    },
    {
      icon: CreditCard,
      title: "Get it fixed & pay safely",
      description:
        "Your fixer repairs your item. You confirm the work is done and payment is released automatically.",
    },
  ];

  const fixerSteps = [
    {
      icon: UserPlus,
      title: "Create your profile",
      description:
        "Sign up with your KVK number, add your skills, and set your service area to start receiving jobs.",
    },
    {
      icon: Search,
      title: "Browse repair requests",
      description:
        "See nearby jobs matching your skills. Filter by category, location, and urgency.",
    },
    {
      icon: Send,
      title: "Make offers",
      description:
        "Send your price and estimated repair time to customers. Explain what you'll do to fix the problem.",
    },
    {
      icon: Wrench,
      title: "Fix & get paid",
      description:
        "Complete the repair, customer confirms the work, and money is transferred to your account automatically.",
    },
  ];

  const faqs = [
    {
      question: "How much does FixMe cost?",
      answer:
        "Posting repair requests is completely free for customers. Fixers pay a 15% commission on each completed job. This helps us keep the platform running and safe for everyone.",
    },
    {
      question: "How is my payment protected?",
      answer:
        "We use an escrow system. When you accept an offer, your payment is held safely by FixMe. The money is only released to the fixer after you confirm the repair is complete. If something goes wrong, you can open a dispute within 48 hours.",
    },
    {
      question: "What if the repair goes wrong?",
      answer:
        "You have 48 hours after completion to open a dispute if the repair wasn't done properly or if there's damage. Our admin team reviews the case, looks at evidence from both sides, and makes a fair decision. Refunds are processed within 5-7 business days.",
    },
    {
      question: "Do I need a KVK number to be a fixer?",
      answer:
        "Yes. In the Netherlands, anyone offering repair services professionally must be registered with the KVK (Chamber of Commerce). This is a legal requirement and helps ensure all fixers on FixMe are legitimate businesses.",
    },
    {
      question: "What areas does FixMe cover?",
      answer:
        "We're currently active in Amsterdam and surrounding areas. We're expanding to Rotterdam, Utrecht, and The Hague soon. Sign up now and we'll notify you when FixMe launches in your city!",
    },
    {
      question: "How fast will I get offers?",
      answer:
        "Most repair requests receive their first offer within a few hours. Urgent requests often get offers even faster. You can also mark your request as 'Priority' to make it more visible to fixers in your area.",
    },
    {
      question: "What items can I post for repair?",
      answer:
        "Almost anything! Common categories include bikes, phones, laptops, appliances, furniture, clothing, and electronics. As long as it's legal and fixable, you can post it. No cars or large construction work though.",
    },
    {
      question: "Can I cancel a request or offer?",
      answer:
        "Yes. Customers can cancel requests anytime before accepting an offer. Fixers can withdraw offers before they're accepted. Once an offer is accepted and payment is made, cancellation requires mutual agreement or a dispute process.",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-[#1B4965] to-[#2d6a8c] text-white py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            How FixMe Works
          </h1>
          <p className="text-xl text-blue-100 max-w-2xl mx-auto">
            Connect with local repair people in just a few simple steps.
            Save money, save the planet, support local businesses.
          </p>
        </div>
      </section>

      {/* Tab Selection */}
      <section className="max-w-7xl mx-auto px-4 -mt-8">
        <div className="bg-white rounded-xl shadow-lg p-2 inline-flex gap-2 mx-auto">
          <button
            onClick={() => setActiveTab("customers")}
            className={`px-8 py-4 rounded-lg font-semibold text-lg transition-all ${
              activeTab === "customers"
                ? "bg-[#FF6B35] text-white shadow-md"
                : "text-gray-600 hover:bg-gray-50"
            }`}
          >
            For Customers
          </button>
          <button
            onClick={() => setActiveTab("fixers")}
            className={`px-8 py-4 rounded-lg font-semibold text-lg transition-all ${
              activeTab === "fixers"
                ? "bg-[#FF6B35] text-white shadow-md"
                : "text-gray-600 hover:bg-gray-50"
            }`}
          >
            For Fixers
          </button>
        </div>
      </section>

      {/* Steps Section */}
      <section className="max-w-7xl mx-auto px-4 py-16">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {(activeTab === "customers" ? customerSteps : fixerSteps).map(
            (step, index) => {
              const Icon = step.icon;
              return (
                <div
                  key={index}
                  className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow"
                >
                  {/* Step Number */}
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 rounded-full bg-[#FF6B35] text-white flex items-center justify-center text-xl font-bold flex-shrink-0">
                      {index + 1}
                    </div>
                    <div className="w-12 h-12 rounded-full bg-orange-50 flex items-center justify-center flex-shrink-0">
                      <Icon className="w-6 h-6 text-[#FF6B35]" />
                    </div>
                  </div>

                  {/* Step Content */}
                  <h3 className="text-xl font-bold text-gray-800 mb-3">
                    {step.title}
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    {step.description}
                  </p>
                </div>
              );
            }
          )}
        </div>
      </section>

      {/* FAQ Section */}
      <section className="bg-white py-16 md:py-24">
        <div className="max-w-4xl mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center text-gray-800 mb-12">
            Frequently Asked Questions
          </h2>

          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <div
                key={index}
                className="border border-gray-200 rounded-xl overflow-hidden"
              >
                <button
                  onClick={() => setOpenFaq(openFaq === index ? null : index)}
                  className="w-full px-6 py-5 flex items-center justify-between text-left hover:bg-gray-50 transition-colors"
                >
                  <span className="font-semibold text-gray-800 text-lg pr-4">
                    {faq.question}
                  </span>
                  {openFaq === index ? (
                    <ChevronUp className="w-5 h-5 text-[#FF6B35] flex-shrink-0" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-gray-400 flex-shrink-0" />
                  )}
                </button>

                {openFaq === index && (
                  <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
                    <p className="text-gray-700 leading-relaxed">{faq.answer}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-[#1B4965] text-white py-16 md:py-24">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Ready to get started?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Join thousands of people who choose to repair instead of replace.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/post">
              <Button variant="primary" size="lg" className="w-full sm:w-auto">
                Post a Repair Request
              </Button>
            </Link>
            <Link href="/register">
              <Button
                variant="outline"
                size="lg"
                className="w-full sm:w-auto bg-white text-[#1B4965] border-white hover:bg-blue-50"
              >
                Become a Fixer
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
