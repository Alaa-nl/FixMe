"use client";

import { useState } from "react";
import Link from "next/link";
import Button from "@/components/ui/button";
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

interface HowItWorksClientProps {
  content: Record<string, string>;
}

export default function HowItWorksClient({ content }: HowItWorksClientProps) {
  const [activeTab, setActiveTab] = useState<"customers" | "fixers">("customers");
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const customerSteps = [
    {
      icon: Camera,
      title: content["how_it_works_step1_title"],
      description: content["how_it_works_step1_desc"],
    },
    {
      icon: MessageCircle,
      title: content["how_it_works_step2_title"],
      description: content["how_it_works_step2_desc"],
    },
    {
      icon: CheckCircle,
      title: content["how_it_works_step3_title"],
      description: content["how_it_works_step3_desc"],
    },
    {
      icon: CreditCard,
      title: content["how_it_works_step4_title"],
      description: content["how_it_works_step4_desc"],
    },
  ];

  const fixerSteps = [
    {
      icon: UserPlus,
      title: content["hiw_fixer_step1_title"],
      description: content["hiw_fixer_step1_desc"],
    },
    {
      icon: Search,
      title: content["hiw_fixer_step2_title"],
      description: content["hiw_fixer_step2_desc"],
    },
    {
      icon: Send,
      title: content["hiw_fixer_step3_title"],
      description: content["hiw_fixer_step3_desc"],
    },
    {
      icon: Wrench,
      title: content["hiw_fixer_step4_title"],
      description: content["hiw_fixer_step4_desc"],
    },
  ];

  const faqs = [
    { question: content["hiw_faq1_q"], answer: content["hiw_faq1_a"] },
    { question: content["hiw_faq2_q"], answer: content["hiw_faq2_a"] },
    { question: content["hiw_faq3_q"], answer: content["hiw_faq3_a"] },
    { question: content["hiw_faq4_q"], answer: content["hiw_faq4_a"] },
    { question: content["hiw_faq5_q"], answer: content["hiw_faq5_a"] },
    { question: content["hiw_faq6_q"], answer: content["hiw_faq6_a"] },
    { question: content["hiw_faq7_q"], answer: content["hiw_faq7_a"] },
    { question: content["hiw_faq8_q"], answer: content["hiw_faq8_a"] },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-[#1B4965] to-[#2d6a8c] text-white py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            {content["how_it_works_title"]}
          </h1>
          <p className="text-xl text-blue-100 max-w-2xl mx-auto">
            {content["hiw_hero_subtitle"]}
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
            {content["hiw_tab_customers"]}
          </button>
          <button
            onClick={() => setActiveTab("fixers")}
            className={`px-8 py-4 rounded-lg font-semibold text-lg transition-all ${
              activeTab === "fixers"
                ? "bg-[#FF6B35] text-white shadow-md"
                : "text-gray-600 hover:bg-gray-50"
            }`}
          >
            {content["hiw_tab_fixers"]}
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
            {content["hiw_faq_title"]}
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
            {content["hiw_cta_title"]}
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            {content["hiw_cta_desc"]}
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/post">
              <Button variant="primary" size="lg" className="w-full sm:w-auto">
                {content["hiw_cta_post_button"]}
              </Button>
            </Link>
            <Link href="/register">
              <Button
                variant="outline"
                size="lg"
                className="w-full sm:w-auto bg-white text-[#1B4965] border-white hover:bg-blue-50"
              >
                {content["hiw_cta_fixer_button"]}
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
