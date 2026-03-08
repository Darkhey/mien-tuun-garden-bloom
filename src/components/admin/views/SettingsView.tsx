import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Settings, Save, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const SettingsView: React.FC = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: config, isLoading } = useQuery({
    queryKey: ["pipeline-config"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("pipeline_config")
        .select("*")
        .limit(1)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
  });

  const [form, setForm] = useState<{
    quality_threshold: number;
    batch_size: number;
    auto_publish: boolean;
    target_category: string;
  } | null>(null);

  const current = form ?? config;

  const mutation = useMutation({
    mutationFn: async (values: typeof form) => {
      if (!config?.id) {
        const { error } = await supabase.from("pipeline_config").insert([values!]);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("pipeline_config").update(values!).eq("id", config.id);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pipeline-config"] });
      toast({ title: "Gespeichert", description: "Einstellungen wurden aktualisiert." });
      setForm(null);
    },
    onError: (err: any) => {
      toast({ title: "Fehler", description: err.message, variant: "destructive" });
    },
  });

  if (isLoading) return <p className="text-muted-foreground p-4">Lade Einstellungen...</p>;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Settings className="h-6 w-6 text-primary" />
        <h1 className="text-2xl font-bold text-foreground">Einstellungen</h1>
      </div>

      <Card>
        <CardHeader><CardTitle>Pipeline-Konfiguration</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label>Quality Threshold</Label>
              <Input
                type="number"
                min={0}
                max={100}
                value={current?.quality_threshold ?? 80}
                onChange={(e) => setForm({ ...current!, quality_threshold: Number(e.target.value) })}
              />
              <p className="text-xs text-muted-foreground mt-1">Mindest-Qualitätsscore für automatische Veröffentlichung</p>
            </div>
            <div>
              <Label>Batch Size</Label>
              <Input
                type="number"
                min={1}
                max={50}
                value={current?.batch_size ?? 5}
                onChange={(e) => setForm({ ...current!, batch_size: Number(e.target.value) })}
              />
              <p className="text-xs text-muted-foreground mt-1">Anzahl Artikel pro Batch-Generierung</p>
            </div>
            <div>
              <Label>Ziel-Kategorie</Label>
              <Input
                value={current?.target_category ?? "kochen"}
                onChange={(e) => setForm({ ...current!, target_category: e.target.value })}
              />
            </div>
            <div className="flex items-center gap-3 pt-6">
              <Switch
                checked={current?.auto_publish ?? false}
                onCheckedChange={(checked) => setForm({ ...current!, auto_publish: checked })}
              />
              <Label>Auto-Publish aktivieren</Label>
            </div>
          </div>

          <Button
            onClick={() => mutation.mutate(form ?? {
              quality_threshold: current?.quality_threshold ?? 80,
              batch_size: current?.batch_size ?? 5,
              auto_publish: current?.auto_publish ?? false,
              target_category: current?.target_category ?? "kochen",
            })}
            disabled={mutation.isPending}
          >
            {mutation.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
            Speichern
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default SettingsView;
