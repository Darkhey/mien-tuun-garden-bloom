
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Settings } from "lucide-react";
import { PipelineConfig } from "@/services/PipelineService";

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
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div>
            <Label htmlFor="batch_size" className="text-sm font-medium">Batch-Größe</Label>
            <Input
              id="batch_size"
              type="number"
              value={config.batch_size}
              onChange={(e) => handleInputChange('batch_size', parseInt(e.target.value))}
              min={1}
              max={50}
            />
          </div>
          <div>
            <Label htmlFor="quality_threshold" className="text-sm font-medium">Qualitäts-Schwellenwert</Label>
            <Input
              id="quality_threshold"
              type="number"
              value={config.quality_threshold}
              onChange={(e) => handleInputChange('quality_threshold', parseInt(e.target.value))}
              min={0}
              max={100}
            />
          </div>
          <div>
            <Label htmlFor="target_category" className="text-sm font-medium">Ziel-Kategorie</Label>
            <Select
              value={config.target_category}
              onValueChange={(value) => handleInputChange('target_category', value)}
            >
              <SelectTrigger id="target_category">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="kochen">Kochen</SelectItem>
                <SelectItem value="garten">Garten</SelectItem>
                <SelectItem value="haushalt">Haushalt</SelectItem>
                <SelectItem value="wellness">Wellness</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center space-x-2">
            <Switch
              id="auto_publish"
              checked={config.auto_publish}
              onCheckedChange={(value) => handleInputChange('auto_publish', value)}
            />
            <Label htmlFor="auto_publish" className="text-sm font-medium">Auto-Publish</Label>
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
