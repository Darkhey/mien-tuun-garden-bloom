
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Bot, ChefHat, Sparkles } from "lucide-react";
import KIRecipeCreator from "../KIRecipeCreator";

const KIRecipeCreatorView: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-blue-100 rounded-lg">
          <Bot className="h-6 w-6 text-blue-600" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">KI-Rezept-Creator</h1>
          <p className="text-gray-600">Erstelle automatisch neue Rezepte mit KI-Unterstützung</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <ChefHat className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-sm text-gray-600">Erstellt heute</p>
                <p className="text-lg font-semibold">12 Rezepte</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-sm text-gray-600">Qualitätsscore</p>
                <p className="text-lg font-semibold">94%</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Bot className="h-5 w-5 text-purple-600" />
              <div>
                <p className="text-sm text-gray-600">KI-Modell</p>
                <p className="text-lg font-semibold">GPT-4</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <KIRecipeCreator />
    </div>
  );
};

export default KIRecipeCreatorView;
