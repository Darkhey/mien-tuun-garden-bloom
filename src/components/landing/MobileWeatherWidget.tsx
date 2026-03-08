import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { CloudRain, Sun, CloudDrizzle, ChevronDown, MapPin } from 'lucide-react';
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from '@/components/ui/collapsible';
import { fetchCombinedWeatherData } from '@/queries/content';
import { WEATHER_LATITUDE, WEATHER_LONGITUDE, WEATHER_TIMEZONE } from '@/config/weather.config';

const MobileWeatherWidget: React.FC = () => {
  const [open, setOpen] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ['weather-combined', WEATHER_LATITUDE, WEATHER_LONGITUDE],
    queryFn: () => fetchCombinedWeatherData(WEATHER_LATITUDE, WEATHER_LONGITUDE, WEATHER_TIMEZONE),
    staleTime: 10 * 60 * 1000,
  });

  if (isLoading) {
    return (
      <div className="mx-4 my-3 h-12 bg-muted rounded-xl animate-pulse" />
    );
  }

  if (!data) return null;

  const precip = data.dailyPrecipitation ?? 0;
  const temp = data.dailyMaxTemperature;

  const getIcon = () => {
    if (temp !== null && temp >= 30) return <Sun className="w-5 h-5 text-destructive" />;
    if (precip > 5) return <CloudRain className="w-5 h-5 text-primary" />;
    if (precip > 0) return <CloudDrizzle className="w-5 h-5 text-muted-foreground" />;
    return <Sun className="w-5 h-5 text-accent" />;
  };

  const getShortDesc = () => {
    if (temp !== null && temp >= 30) return 'Heiß – gut gießen!';
    if (precip > 5) return 'Regnerisch – Innenpflege';
    if (precip > 0) return 'Leichter Regen';
    return 'Sonnig – ab in den Garten!';
  };

  const getTip = () => {
    if (temp !== null && temp >= 30) return 'Früh morgens oder abends gießen. Mulch schützt den Boden vor Austrocknung. Empfindliche Pflanzen beschatten.';
    if (precip > 5) return 'Perfekter Tag für Zimmerpflanzen-Pflege und Planung des nächsten Gartenprojekts.';
    if (precip > 0) return 'Leichter Regen bedeutet weniger gießen – nutze die Zeit für andere Gartenarbeiten.';
    return 'Perfektes Wetter für Aussaat, Unkraut jäten oder Ernten im Garten!';
  };

  return (
    <div className="mx-4 my-3">
      <Collapsible open={open} onOpenChange={setOpen}>
        <CollapsibleTrigger className="w-full">
          <div className="flex items-center gap-3 bg-card rounded-xl px-4 py-3 border border-border" style={{ boxShadow: 'var(--shadow-card)' }}>
            {getIcon()}
            <div className="flex-1 text-left">
              <span className="text-sm font-medium text-foreground">{getShortDesc()}</span>
              {temp !== null && (
                <span className="text-xs text-muted-foreground ml-2">{temp.toFixed(0)}°C</span>
              )}
            </div>
            <div className="flex items-center gap-1 text-muted-foreground">
              <MapPin className="w-3 h-3" />
              <span className="text-[10px]">Ostfriesland</span>
              <ChevronDown className={`w-4 h-4 transition-transform ${open ? 'rotate-180' : ''}`} />
            </div>
          </div>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <div className="bg-card rounded-b-xl px-4 pb-4 pt-2 border-x border-b border-border -mt-2 space-y-2">
            <div className="flex gap-4 text-xs text-muted-foreground">
              <span>Niederschlag: <strong className="text-foreground">{precip.toFixed(1)} mm</strong></span>
              {temp !== null && <span>Max: <strong className="text-foreground">{temp.toFixed(1)}°C</strong></span>}
            </div>
            <div className="bg-secondary/50 rounded-lg p-3">
              <p className="text-xs font-medium text-foreground mb-1">🌱 Mariannes Tipp:</p>
              <p className="text-xs text-muted-foreground leading-relaxed">{getTip()}</p>
            </div>
          </div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
};

export default MobileWeatherWidget;
