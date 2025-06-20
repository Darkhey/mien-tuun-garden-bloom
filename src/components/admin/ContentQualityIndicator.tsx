
import React from "react";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { AlertCircle, CheckCircle, Info } from "lucide-react";
import type { ContentQuality } from "@/services/ContentGenerationService";

export interface ContentQualityMetrics extends ContentQuality {
  seoScore?: number;
  issues: string[];
}

interface ContentQualityIndicatorProps {
  quality: ContentQualityMetrics;
  showDetails?: boolean;
}

const ContentQualityIndicator: React.FC<ContentQualityIndicatorProps> = ({ 
  quality, 
  showDetails = true 
}) => {
  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600";
    if (score >= 60) return "text-yellow-600";
    return "text-red-600";
  };

  const getScoreBadge = (score: number) => {
    if (score >= 80) return { variant: "default" as const, label: "Sehr gut" };
    if (score >= 60) return { variant: "secondary" as const, label: "Gut" };
    return { variant: "destructive" as const, label: "Verbesserung nötig" };
  };

  const badge = getScoreBadge(quality.score);

  return (
    <div className="space-y-3 p-4 border rounded-lg bg-gray-50">
      <div className="flex items-center justify-between">
        <h4 className="font-semibold flex items-center gap-2">
          {quality.score >= 80 ? (
            <CheckCircle className="h-4 w-4 text-green-600" />
          ) : quality.score >= 60 ? (
            <Info className="h-4 w-4 text-yellow-600" />
          ) : (
            <AlertCircle className="h-4 w-4 text-red-600" />
          )}
          Content-Qualität
        </h4>
        <Badge variant={badge.variant}>{badge.label}</Badge>
      </div>

      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span>Gesamtscore</span>
          <span className={getScoreColor(quality.score)}>{quality.score}/100</span>
        </div>
        <Progress value={quality.score} className="h-2" />
      </div>

      {showDetails && (
        <div className="space-y-2 text-sm">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <span className="text-gray-600">Wörter:</span>
              <span className="ml-2 font-medium">{quality.wordCount}</span>
            </div>
            <div>
              <span className="text-gray-600">Lesbarkeit:</span>
              <span className="ml-2 font-medium">{quality.readabilityScore}/100</span>
            </div>
            <div>
              <span className="text-gray-600">SEO:</span>
              <span className="ml-2 font-medium">{quality.seoScore}/100</span>
            </div>
            <div>
              <span className="text-gray-600">Struktur:</span>
              <span className="ml-2 font-medium">{quality.structureScore}/100</span>
            </div>
          </div>

          {quality.issues.length > 0 && (
            <div className="mt-3">
              <div className="text-gray-600 text-xs mb-1">Verbesserungsvorschläge:</div>
              <ul className="text-xs space-y-1">
                {quality.issues.map((issue, idx) => (
                  <li key={idx} className="flex items-start gap-1 text-orange-600">
                    <span>•</span>
                    <span>{issue}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ContentQualityIndicator;
