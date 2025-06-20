
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, AlertTriangle, CheckCircle } from 'lucide-react';
import type { SEOAnalysis } from '@/services/SEOService';

interface SEOScoreIndicatorProps {
  analysis: SEOAnalysis;
  className?: string;
}

const SEOScoreIndicator: React.FC<SEOScoreIndicatorProps> = ({ analysis, className }) => {
  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600 bg-green-50';
    if (score >= 60) return 'text-yellow-600 bg-yellow-50';
    return 'text-red-600 bg-red-50';
  };

  const getScoreIcon = (score: number) => {
    if (score >= 80) return <CheckCircle className="h-5 w-5 text-green-600" />;
    if (score >= 60) return <TrendingUp className="h-5 w-5 text-yellow-600" />;
    return <AlertTriangle className="h-5 w-5 text-red-600" />;
  };

  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-sm">
          {getScoreIcon(analysis.score)}
          SEO-Analyse
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">SEO-Score</span>
          <Badge className={getScoreColor(analysis.score)}>
            {analysis.score}/100
          </Badge>
        </div>
        
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">Wörter</span>
          <span className="text-sm font-medium">{analysis.contentLength}</span>
        </div>
        
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">Lesbarkeit</span>
          <span className="text-sm font-medium">{Math.round(analysis.readabilityScore)}/100</span>
        </div>
        
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">Keywords</span>
          <span className="text-sm font-medium">{analysis.keywords.length}</span>
        </div>

        {analysis.recommendations.length > 0 && (
          <div className="pt-2 border-t">
            <h4 className="text-xs font-medium text-gray-700 mb-2">Verbesserungen</h4>
            <ul className="space-y-1">
              {analysis.recommendations.slice(0, 3).map((rec, idx) => (
                <li key={idx} className="text-xs text-gray-600 flex items-start gap-1">
                  <span className="text-yellow-500 mt-0.5">•</span>
                  <span>{rec}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default SEOScoreIndicator;
