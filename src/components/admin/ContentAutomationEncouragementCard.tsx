import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Lightbulb, 
  TrendingUp, 
  Zap, 
  Award,
  Target,
  ArrowRight
} from "lucide-react";

interface ContentAutomationEncouragementCardProps {
  stats: {
    totalContent: number;
    successRate: number;
    streak: number;
    nextMilestone: number;
    level: string;
    tips: string[];
  };
  onCreateContent: () => void;
  className?: string;
}

const ContentAutomationEncouragementCard: React.FC<ContentAutomationEncouragementCardProps> = ({
  stats,
  onCreateContent,
  className
}) => {
  const getMotivationalMessage = () => {
    if (stats.totalContent === 0) {
      return "Starte jetzt mit deiner ersten automatisierten Content-Erstellung!";
    }
    
    if (stats.streak > 5) {
      return `Beeindruckend! Du hast eine Streak von ${stats.streak} Tagen. Weiter so!`;
    }
    
    if (stats.totalContent > 0 && stats.totalContent < 5) {
      return `Guter Start! Du hast bereits ${stats.totalContent} Inhalte erstellt. Nur noch ${stats.nextMilestone - stats.totalContent} bis zum nächsten Meilenstein!`;
    }
    
    if (stats.successRate > 90) {
      return "Hervorragende Arbeit! Deine Content-Qualität ist erstklassig.";
    }
    
    return "Dein Content-Automation-System läuft. Erstelle jetzt weitere Inhalte!";
  };

  const getRandomTip = () => {
    if (!stats.tips || stats.tips.length === 0) return null;
    return stats.tips[Math.floor(Math.random() * stats.tips.length)];
  };

  const tip = getRandomTip();

  return (
    <Card className={`bg-gradient-to-br from-blue-50 to-purple-50 border-blue-100 ${className}`}>
      <CardContent className="p-6 space-y-4">
        {/* Motivational Header */}
        <div className="flex items-center gap-3">
          {stats.streak > 3 ? (
            <div className="bg-yellow-100 p-2 rounded-full">
              <Award className="h-6 w-6 text-yellow-600" />
            </div>
          ) : (
            <div className="bg-blue-100 p-2 rounded-full">
              <Zap className="h-6 w-6 text-blue-600" />
            </div>
          )}
          
          <div>
            <h3 className="font-bold text-lg text-blue-900">{getMotivationalMessage()}</h3>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant="secondary" className="bg-blue-100 text-blue-800 hover:bg-blue-200">
                Level: {stats.level}
              </Badge>
              
              {stats.streak > 0 && (
                <Badge variant="outline" className="bg-yellow-50 text-yellow-800 border-yellow-200">
                  {stats.streak} Tage Streak 🔥
                </Badge>
              )}
            </div>
          </div>
        </div>
        
        {/* Progress to Next Milestone */}
        {stats.totalContent > 0 && (
          <div className="space-y-1">
            <div className="flex items-center justify-between text-sm">
              <span className="text-blue-800">Fortschritt zum nächsten Meilenstein</span>
              <span className="text-blue-800 font-medium">{stats.totalContent}/{stats.nextMilestone}</span>
            </div>
            <div className="h-2 bg-blue-100 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full transition-all duration-500"
                style={{ width: `${(stats.totalContent / stats.nextMilestone) * 100}%` }}
              ></div>
            </div>
          </div>
        )}
        
        {/* Random Tip */}
        {tip && (
          <div className="bg-white/50 rounded-lg p-3 border border-blue-100">
            <div className="flex items-start gap-2">
              <Lightbulb className="h-5 w-5 text-amber-500 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-blue-800">
                <span className="font-medium">Tipp:</span> {tip}
              </div>
            </div>
          </div>
        )}
        
        {/* Action Button */}
        <Button 
          onClick={onCreateContent}
          className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
        >
          {stats.totalContent === 0 ? (
            <>
              <Zap className="h-4 w-4 mr-2" />
              Ersten Content erstellen
            </>
          ) : (
            <>
              <TrendingUp className="h-4 w-4 mr-2" />
              Neuen Content generieren
            </>
          )}
        </Button>
        
        {/* Target Suggestion */}
        <div className="flex items-center justify-between text-xs text-blue-700">
          <div className="flex items-center gap-1">
            <Target className="h-3 w-3" />
            <span>Ziel: {stats.nextMilestone} Inhalte</span>
          </div>
          
          <Button variant="link" size="sm" className="text-xs text-blue-700 p-0 h-auto">
            Mehr Tipps
            <ArrowRight className="h-3 w-3 ml-1" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default ContentAutomationEncouragementCard;