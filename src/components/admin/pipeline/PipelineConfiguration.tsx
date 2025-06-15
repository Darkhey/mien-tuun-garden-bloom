
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Settings } from "lucide-react";

export interface PipelineConfig {
  batchSize: number;
  quality_threshold: number;
  auto_publish: boolean;
  target_category: string;
}

interface PipelineConfigurationProps {
  config: PipelineConfig;
  onConfigChange: (config: PipelineConfig) => void;
  onSave: () => void;
}

const PipelineConfiguration: React.FC<PipelineConfigurationProps> = ({
  config,
  onConfigChange,
  onSave
}) => {
  const handleInputChange = (field: keyof PipelineConfig, value: any) => {
    onConfigChange({
      ...config,
      [field]: value
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Pipeline-Konfiguration</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="text-sm font-medium">Batch-Größe</label>
            <Input
              type="number"
              value={config.batchSize}
              onChange={(e) => handleInputChange('batchSize', parseInt(e.target.value))}
            />
          </div>
          <div>
            <label className="text-sm font-medium">Qualitäts-Schwellenwert</label>
            <Input
              type="number"
              value={config.quality_threshold}
              onChange={(e) => handleInputChange('quality_threshold', parseInt(e.target.value))}
            />
          </div>
          <div>
            <label className="text-sm font-medium">Ziel-Kategorie</label>
            <Select
              value={config.target_category}
              onValueChange={(value) => handleInputChange('target_category', value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="kochen">Kochen</SelectItem>
                <SelectItem value="garten">Garten</SelectItem>
                <SelectItem value="haushalt">Haushalt</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-end">
            <Button onClick={onSave} className="w-full">
              <Settings className="h-4 w-4 mr-2" />
              Konfiguration speichern
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default PipelineConfiguration;
