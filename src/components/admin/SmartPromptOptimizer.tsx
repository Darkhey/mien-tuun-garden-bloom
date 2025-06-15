
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Zap, Brain, Target, TrendingUp, AlertCircle } from "lucide-react";
import { contextAnalyzer, TrendData } from "@/services/ContextAnalyzer";

interface PromptAnalysis {
  score: number;
  strengths: string[];
  improvements: string[];
  suggestedKeywords: string[];
  optimizedVersion: string;
}

const SmartPromptOptimizer: React.FC = () => {
  const [originalPrompt, setOriginalPrompt] = useState("");
  const [analysis, setAnalysis] = useState<PromptAnalysis | null>(null);
  const [currentTrends, setCurrentTrends] = useState<TrendData[]>([]);
  const [analyzing, setAnalyzing] = useState(false);

  useEffect(() => {
    const trends = contextAnalyzer.getCurrentTrends();
    setCurrentTrends(trends.slice(0, 10));
  }, []);

  const analyzePrompt = async () => {
    if (!originalPrompt.trim()) return;
    
    setAnalyzing(true);
    try {
      // Simuliere Prompt-Analyse (in echter Implementierung würde das über KI laufen)
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const analysis = await performPromptAnalysis(originalPrompt);
      setAnalysis(analysis);
      
      console.log("[PromptOptimizer] Analysis completed:", analysis);
    } catch (error) {
      console.error("[PromptOptimizer] Analysis failed:", error);
    }
    setAnalyzing(false);
  };

  const performPromptAnalysis = async (prompt: string): Promise<PromptAnalysis> => {
    const words = prompt.toLowerCase().split(/\s+/);
    const trendKeywords = currentTrends.map(t => t.keyword.toLowerCase());
    
    // Score-Berechnung
    let score = 50; // Basis-Score
    
    // Länge bewerten
    if (words.length >= 10 && words.length <= 50) score += 20;
    else if (words.length < 5) score -= 20;
    
    // Trend-Keywords prüfen
    const foundTrends = trendKeywords.filter(keyword => 
      words.some(word => word.includes(keyword.toLowerCase()))
    );
    score += foundTrends.length * 10;
    
    // Struktur-Keywords prüfen
    const structureKeywords = ['schritt', 'anleitung', 'tipps', 'guide', 'tutorial'];
    const hasStructure = structureKeywords.some(keyword => 
      words.some(word => word.includes(keyword))
    );
    if (hasStructure) score += 15;
    
    // Zielgruppen-Keywords prüfen
    const audienceKeywords = ['anfänger', 'fortgeschritten', 'experte', 'familie'];
    const hasAudience = audienceKeywords.some(keyword => 
      words.some(word => word.includes(keyword))
    );
    if (hasAudience) score += 10;
    
    score = Math.min(100, Math.max(0, score));
    
    const strengths: string[] = [];
    const improvements: string[] = [];
    
    if (words.length >= 10) strengths.push("Gute Prompt-Länge");
    else improvements.push("Prompt könnte detaillierter sein");
    
    if (foundTrends.length > 0) strengths.push(`Enthält ${foundTrends.length} aktuelle Trend-Keywords`);
    else improvements.push("Keine aktuellen Trends eingebunden");
    
    if (hasStructure) strengths.push("Strukturierte Anweisung erkannt");
    else improvements.push("Könnte strukturierter formuliert werden");
    
    if (hasAudience) strengths.push("Zielgruppe definiert");
    else improvements.push("Zielgruppe nicht spezifiziert");
    
    // Keyword-Vorschläge basierend auf Trends
    const suggestedKeywords = currentTrends
      .filter(t => !foundTrends.includes(t.keyword.toLowerCase()))
      .slice(0, 5)
      .map(t => t.keyword);
    
    // Optimierte Version generieren
    const optimizedVersion = generateOptimizedPrompt(prompt, suggestedKeywords, improvements);
    
    return {
      score,
      strengths,
      improvements,
      suggestedKeywords,
      optimizedVersion
    };
  };

  const generateOptimizedPrompt = (original: string, keywords: string[], improvements: string[]): string => {
    let optimized = original;
    
    // Trend-Keywords hinzufügen
    if (keywords.length > 0) {
      optimized += ` Berücksichtige dabei aktuelle Trends wie: ${keywords.slice(0, 3).join(", ")}.`;
    }
    
    // Struktur-Verbesserungen
    if (improvements.includes("Könnte strukturierter formuliert werden")) {
      optimized += " Strukturiere den Artikel mit klaren Überschriften und Schritt-für-Schritt Anleitungen.";
    }
    
    // Zielgruppen-Verbesserungen
    if (improvements.includes("Zielgruppe nicht spezifiziert")) {
      optimized += " Schreibe für Anfänger bis Fortgeschrittene und erkläre Fachbegriffe.";
    }
    
    // SEO-Optimierung
    optimized += " Optimiere für SEO mit relevanten Keywords und ansprechenden Überschriften.";
    
    return optimized;
  };

  const applyOptimization = () => {
    if (analysis) {
      setOriginalPrompt(analysis.optimizedVersion);
      setAnalysis(null);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600";
    if (score >= 60) return "text-yellow-600";
    return "text-red-600";
  };

  const getScoreBadge = (score: number) => {
    if (score >= 80) return { variant: "default" as const, label: "Sehr gut" };
    if (score >= 60) return { variant: "secondary" as const, label: "Gut" };
    return { variant: "destructive" as const, label: "Verbesserungsbedarf" };
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center gap-2">
        <Brain className="h-6 w-6" />
        <h2 className="text-2xl font-bold">Smart Prompt Optimizer</h2>
      </div>

      {/* Aktuelle Trends */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Aktuelle Trends für Optimierung
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {currentTrends.slice(0, 8).map((trend, idx) => (
              <Badge
                key={idx}
                variant="outline"
                className="flex items-center gap-1"
              >
                {trend.keyword}
                <span className="text-xs opacity-60">
                  {Math.round(trend.relevance * 100)}%
                </span>
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Prompt Input */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-4 w-4" />
            Prompt-Eingabe
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Textarea
            value={originalPrompt}
            onChange={(e) => setOriginalPrompt(e.target.value)}
            placeholder="Gib deinen Prompt hier ein, um ihn zu optimieren..."
            rows={4}
          />
          
          <Button 
            onClick={analyzePrompt}
            disabled={!originalPrompt.trim() || analyzing}
            className="w-full"
          >
            <Zap className="h-4 w-4 mr-2" />
            {analyzing ? "Analysiere..." : "Prompt analysieren & optimieren"}
          </Button>
        </CardContent>
      </Card>

      {/* Analysis Results */}
      {analysis && (
        <>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <Brain className="h-4 w-4" />
                  Analyse-Ergebnisse
                </span>
                <div className="flex items-center gap-2">
                  <span className={`text-lg font-bold ${getScoreColor(analysis.score)}`}>
                    {analysis.score}/100
                  </span>
                  <Badge variant={getScoreBadge(analysis.score).variant}>
                    {getScoreBadge(analysis.score).label}
                  </Badge>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Progress value={analysis.score} className="h-3" />
              
              {/* Stärken */}
              {analysis.strengths.length > 0 && (
                <div>
                  <h4 className="font-semibold text-green-700 mb-2">✅ Stärken:</h4>
                  <ul className="space-y-1">
                    {analysis.strengths.map((strength, idx) => (
                      <li key={idx} className="text-sm text-green-600">
                        • {strength}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              
              {/* Verbesserungen */}
              {analysis.improvements.length > 0 && (
                <div>
                  <h4 className="font-semibold text-orange-700 mb-2 flex items-center gap-1">
                    <AlertCircle className="h-4 w-4" />
                    Verbesserungsmöglichkeiten:
                  </h4>
                  <ul className="space-y-1">
                    {analysis.improvements.map((improvement, idx) => (
                      <li key={idx} className="text-sm text-orange-600">
                        • {improvement}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              
              {/* Keyword-Vorschläge */}
              {analysis.suggestedKeywords.length > 0 && (
                <div>
                  <h4 className="font-semibold mb-2">💡 Empfohlene Keywords:</h4>
                  <div className="flex flex-wrap gap-2">
                    {analysis.suggestedKeywords.map((keyword, idx) => (
                      <Badge key={idx} variant="secondary">
                        {keyword}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Optimized Prompt */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Optimierter Prompt</span>
                <Button onClick={applyOptimization} size="sm">
                  Übernehmen
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="p-4 bg-green-50 border rounded-lg">
                <p className="text-sm whitespace-pre-wrap">{analysis.optimizedVersion}</p>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
};

export default SmartPromptOptimizer;
