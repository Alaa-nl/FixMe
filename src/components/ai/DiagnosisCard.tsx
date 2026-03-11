"use client";

import { DiagnosisResult } from "@/lib/claude";
import { CheckCircle2, XCircle, Scale, Bot, Wrench, AlertTriangle, Gauge } from "lucide-react";

interface DiagnosisCardProps {
  diagnosis: DiagnosisResult;
  userType?: string;
}

export default function DiagnosisCard({ diagnosis, userType }: DiagnosisCardProps) {
  const showPrice = userType === "FIXER";

  // Confidence badge color
  const confidenceStyle = {
    High: { bg: "bg-success/10", text: "text-success", border: "border-success/20", label: "Hoog" },
    Medium: { bg: "bg-amber-500/10", text: "text-amber-600", border: "border-amber-500/20", label: "Gemiddeld" },
    Low: { bg: "bg-red-500/10", text: "text-red-500", border: "border-red-500/20", label: "Laag" },
  }[diagnosis.confidence] || { bg: "bg-gray-100", text: "text-gray-500", border: "border-gray-200", label: diagnosis.confidence };

  // Difficulty badge
  const difficultyStyle = {
    Easy: { bg: "bg-success/10", text: "text-success", label: "Makkelijk", icon: "🟢" },
    Medium: { bg: "bg-amber-500/10", text: "text-amber-600", label: "Gemiddeld", icon: "🟡" },
    Hard: { bg: "bg-red-500/10", text: "text-red-500", label: "Moeilijk", icon: "🔴" },
  }[diagnosis.repairDifficulty] || { bg: "bg-gray-100", text: "text-gray-500", label: diagnosis.repairDifficulty, icon: "⚪" };

  // Fix vs replace recommendation
  const getRecommendation = () => {
    if (diagnosis.fixOrReplace === "Fix") {
      return (
        <div className="bg-success/[0.06] border border-success/15 rounded-2xl p-5">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 bg-success/10 rounded-xl flex items-center justify-center flex-shrink-0">
              <CheckCircle2 className="w-5 h-5 text-success" />
            </div>
            <div>
              <h4 className="font-bold text-success text-sm mb-1">Reparatie aanbevolen</h4>
              <p className="text-sm text-gray-600 leading-relaxed">{diagnosis.fixOrReplaceReason}</p>
            </div>
          </div>
        </div>
      );
    } else if (diagnosis.fixOrReplace === "Replace") {
      return (
        <div className="bg-red-500/[0.06] border border-red-500/15 rounded-2xl p-5">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 bg-red-500/10 rounded-xl flex items-center justify-center flex-shrink-0">
              <XCircle className="w-5 h-5 text-red-500" />
            </div>
            <div>
              <h4 className="font-bold text-red-600 text-sm mb-1">Vervangen overwegen</h4>
              <p className="text-sm text-gray-600 leading-relaxed">{diagnosis.fixOrReplaceReason}</p>
            </div>
          </div>
        </div>
      );
    } else {
      return (
        <div className="bg-amber-500/[0.06] border border-amber-500/15 rounded-2xl p-5">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 bg-amber-500/10 rounded-xl flex items-center justify-center flex-shrink-0">
              <Scale className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <h4 className="font-bold text-amber-700 text-sm mb-1">Kan beide kanten op</h4>
              <p className="text-sm text-gray-600 leading-relaxed">{diagnosis.fixOrReplaceReason}</p>
            </div>
          </div>
        </div>
      );
    }
  };

  return (
    <div className="bg-white rounded-3xl border border-gray-100/60 shadow-card overflow-hidden">
      {/* Header with gradient */}
      <div className="bg-gradient-to-r from-secondary to-secondary/90 px-6 py-5 md:px-8 md:py-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/15 rounded-xl flex items-center justify-center">
              <Bot className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white font-display">AI Diagnose</h3>
              <p className="text-secondary-200 text-xs" style={{ color: "rgba(255,255,255,0.5)" }}>Automatische analyse</p>
            </div>
          </div>
          <span className={`px-3 py-1.5 rounded-xl text-xs font-bold border ${confidenceStyle.bg} ${confidenceStyle.text} ${confidenceStyle.border}`}>
            {confidenceStyle.label} vertrouwen
          </span>
        </div>
      </div>

      <div className="p-6 md:p-8 space-y-6">
        {/* Item and problem */}
        <div className="grid md:grid-cols-2 gap-4">
          <div className="bg-gray-50 rounded-2xl p-4">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5">Voorwerp</p>
            <p className="text-secondary font-semibold text-sm">{diagnosis.itemIdentification}</p>
          </div>
          <div className="bg-gray-50 rounded-2xl p-4">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5">Probleem</p>
            <p className="text-secondary font-semibold text-sm">{diagnosis.problemDiagnosis}</p>
          </div>
        </div>

        {/* Difficulty + estimated cost */}
        <div className="flex flex-wrap gap-3">
          <div className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold ${difficultyStyle.bg} ${difficultyStyle.text}`}>
            <Gauge className="w-4 h-4" />
            {difficultyStyle.label}
          </div>
          {showPrice && (
            <div className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold bg-primary/[0.08] text-primary">
              €{diagnosis.estimatedCostMin} — €{diagnosis.estimatedCostMax}
            </div>
          )}
        </div>

        {/* Recommendation */}
        {getRecommendation()}

        {/* Repair description */}
        <div>
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Wat er moet gebeuren</p>
          <div className="bg-gray-50 rounded-2xl p-4">
            <p className="text-sm text-gray-600 leading-relaxed">{diagnosis.repairDescription}</p>
          </div>
        </div>

        {/* Footer disclaimer */}
        <div className="pt-4 border-t border-gray-100/80">
          <p className="text-xs text-gray-400 text-center flex items-center justify-center gap-1.5">
            <AlertTriangle className="w-3 h-3" />
            Dit is een AI-schatting. Werkelijke kosten kunnen afwijken.
          </p>
        </div>
      </div>
    </div>
  );
}
