import { DiagnosisResult } from "@/lib/claude";

interface DiagnosisCardProps {
  diagnosis: DiagnosisResult;
  userType?: string;
}

export default function DiagnosisCard({ diagnosis, userType }: DiagnosisCardProps) {
  const showPrice = userType === "FIXER";
  // Get confidence badge color
  const getConfidenceColor = (confidence: string) => {
    switch (confidence) {
      case "High":
        return "bg-green-100 text-green-700 border-green-300";
      case "Medium":
        return "bg-yellow-100 text-yellow-700 border-yellow-300";
      case "Low":
        return "bg-red-100 text-red-700 border-red-300";
      default:
        return "bg-gray-100 text-gray-700 border-gray-300";
    }
  };

  // Get difficulty badge color
  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "Easy":
        return "bg-green-100 text-green-700 border-green-300";
      case "Medium":
        return "bg-yellow-100 text-yellow-700 border-yellow-300";
      case "Hard":
        return "bg-red-100 text-red-700 border-red-300";
      default:
        return "bg-gray-100 text-gray-700 border-gray-300";
    }
  };

  // Get fix/replace recommendation box
  const getRecommendationBox = () => {
    const { fixOrReplace, fixOrReplaceReason } = diagnosis;

    if (fixOrReplace === "Fix") {
      return (
        <div className="bg-green-50 border-2 border-green-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <span className="text-2xl">✅</span>
            <div>
              <h4 className="font-semibold text-green-800 mb-1">
                Worth repairing
              </h4>
              <p className="text-sm text-green-700">{fixOrReplaceReason}</p>
            </div>
          </div>
        </div>
      );
    } else if (fixOrReplace === "Replace") {
      return (
        <div className="bg-red-50 border-2 border-red-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <span className="text-2xl">❌</span>
            <div>
              <h4 className="font-semibold text-red-800 mb-1">
                Consider replacing
              </h4>
              <p className="text-sm text-red-700">{fixOrReplaceReason}</p>
            </div>
          </div>
        </div>
      );
    } else {
      return (
        <div className="bg-yellow-50 border-2 border-yellow-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <span className="text-2xl">⚖️</span>
            <div>
              <h4 className="font-semibold text-yellow-800 mb-1">
                Could go either way
              </h4>
              <p className="text-sm text-yellow-700">{fixOrReplaceReason}</p>
            </div>
          </div>
        </div>
      );
    }
  };

  return (
    <div className="bg-white rounded-xl border-2 border-gray-200 p-6 md:p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl md:text-2xl font-bold text-gray-800 flex items-center gap-2">
          🤖 AI Diagnosis
        </h3>
        <span
          className={`px-3 py-1 rounded-full text-xs font-semibold border ${getConfidenceColor(
            diagnosis.confidence
          )}`}
        >
          {diagnosis.confidence} confidence
        </span>
      </div>

      {/* What we found */}
      <div className="mb-6">
        <h4 className="font-semibold text-gray-700 mb-2">What we found</h4>
        <p className="text-gray-600 mb-2">
          <span className="font-medium">Item:</span>{" "}
          {diagnosis.itemIdentification}
        </p>
        <p className="text-gray-600">
          <span className="font-medium">Problem:</span>{" "}
          {diagnosis.problemDiagnosis}
        </p>
      </div>

      {/* Repair difficulty */}
      <div className="mb-6">
        <h4 className="font-semibold text-gray-700 mb-2">Repair difficulty</h4>
        <span
          className={`inline-block px-4 py-2 rounded-lg text-sm font-semibold border ${getDifficultyColor(
            diagnosis.repairDifficulty
          )}`}
        >
          {diagnosis.repairDifficulty}
        </span>
      </div>

      {/* Estimated cost — only visible to logged-in fixers */}
      {showPrice && (
        <div className="mb-6">
          <h4 className="font-semibold text-gray-700 mb-2">Estimated cost</h4>
          <p className="text-3xl md:text-4xl font-bold text-primary">
            €{diagnosis.estimatedCostMin} — €{diagnosis.estimatedCostMax}
          </p>
        </div>
      )}

      {/* Our advice */}
      <div className="mb-6">
        <h4 className="font-semibold text-gray-700 mb-3">Our advice</h4>
        {getRecommendationBox()}
      </div>

      {/* What needs to be done */}
      <div className="mb-6">
        <h4 className="font-semibold text-gray-700 mb-2">
          What needs to be done
        </h4>
        <div className="bg-gray-50 rounded-lg p-4">
          <p className="text-sm text-gray-700">{diagnosis.repairDescription}</p>
        </div>
      </div>

      {/* Footer */}
      <div className="border-t pt-4">
        <p className="text-xs text-gray-500 text-center">
          This is an AI estimate. Actual costs may vary.
        </p>
      </div>
    </div>
  );
}
