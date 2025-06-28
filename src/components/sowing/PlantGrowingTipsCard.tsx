import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Thermometer, Droplets, Sun, Clock, Sprout, AlertTriangle } from "lucide-react";
import type { PlantGrowingTips } from '@/types/sowing';

interface PlantGrowingTipsCardProps {
  plantName: string;
  tips: PlantGrowingTips | null;
  loading: boolean;
}

const PlantGrowingTipsCard: React.FC<PlantGrowingTipsCardProps> = ({ 
  plantName, 
  tips,
  loading
}) => {
  if (loading) {
    return (
      <Card className="border-sage-300 bg-sage-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <div className="animate-pulse h-5 w-5 bg-sage-300 rounded-full"></div>
            <div className="animate-pulse h-6 w-40 bg-sage-300 rounded"></div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="animate-pulse bg-white p-3 rounded-lg border border-sage-200">
                  <div className="h-4 w-20 bg-sage-300 rounded mb-1"></div>
                  <div className="h-3 w-full bg-sage-200 rounded"></div>
                </div>
              ))}
            </div>
            <div className="animate-pulse bg-white p-4 rounded-lg border border-sage-200">
              <div className="h-5 w-32 bg-sage-300 rounded mb-3"></div>
              <div className="space-y-2">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="h-3 w-full bg-sage-200 rounded"></div>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!tips) {
    return (
      <Card className="border-sage-300 bg-sage-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sprout className="h-5 w-5 text-sage-600" />
            Anbautipps
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4 text-sage-600">
            Wähle eine Pflanze aus, um spezifische Anbautipps zu sehen
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-sage-300 bg-sage-50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sprout className="h-5 w-5 text-sage-600" />
          Anbautipps für {plantName}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Quick Info Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="bg-white p-3 rounded-lg border border-sage-200">
              <div className="flex items-center gap-2 mb-1">
                <Thermometer className="h-4 w-4 text-orange-500" />
                <span className="text-xs font-medium text-earth-600">Temperatur</span>
              </div>
              <p className="text-sm text-earth-800">{tips.temperature}</p>
            </div>
            
            <div className="bg-white p-3 rounded-lg border border-sage-200">
              <div className="flex items-center gap-2 mb-1">
                <Droplets className="h-4 w-4 text-blue-500" />
                <span className="text-xs font-medium text-earth-600">Gießen</span>
              </div>
              <p className="text-sm text-earth-800">{tips.watering}</p>
            </div>
            
            <div className="bg-white p-3 rounded-lg border border-sage-200">
              <div className="flex items-center gap-2 mb-1">
                <Sun className="h-4 w-4 text-yellow-500" />
                <span className="text-xs font-medium text-earth-600">Licht</span>
              </div>
              <p className="text-sm text-earth-800">{tips.light}</p>
            </div>
            
            <div className="bg-white p-3 rounded-lg border border-sage-200">
              <div className="flex items-center gap-2 mb-1">
                <Clock className="h-4 w-4 text-green-500" />
                <span className="text-xs font-medium text-earth-600">Timing</span>
              </div>
              <p className="text-sm text-earth-800">{tips.timing}</p>
            </div>
          </div>

          {/* Difficulty Badge */}
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-earth-600">Schwierigkeit:</span>
            <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
              tips.difficulty === 'Einfach' 
                ? 'bg-green-100 text-green-800' 
                : tips.difficulty === 'Mittel'
                ? 'bg-yellow-100 text-yellow-800'
                : 'bg-red-100 text-red-800'
            }`}>
              {tips.difficulty}
            </span>
          </div>

          {/* Specific Tips */}
          <div className="bg-white p-4 rounded-lg border border-sage-200">
            <h4 className="font-medium text-earth-800 mb-3">💡 Profi-Tipps</h4>
            <ul className="space-y-2">
              {tips.specificTips.map((tip, index) => (
                <li key={index} className="flex items-start gap-2 text-sm text-earth-700">
                  <span className="text-sage-500 mt-1">•</span>
                  {tip}
                </li>
              ))}
            </ul>
          </div>

          {/* Common Mistakes */}
          <div className="bg-red-50 p-4 rounded-lg border border-red-200">
            <h4 className="font-medium text-earth-800 mb-3 flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-red-600" />
              Häufige Fehler vermeiden
            </h4>
            <ul className="space-y-2">
              {tips.commonMistakes.map((mistake, index) => (
                <li key={index} className="flex items-start gap-2 text-sm text-earth-700">
                  <span className="text-red-500 mt-1">•</span>
                  {mistake}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default PlantGrowingTipsCard;