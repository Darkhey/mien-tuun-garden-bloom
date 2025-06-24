
import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { CloudRain, Sun, CloudDrizzle, MapPin, AlertCircle, BookOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Link } from 'react-router-dom';
import { fetchCombinedWeatherData } from '@/queries/content';
import { format } from 'date-fns';
import { WeatherContentService, WeatherCondition } from '@/services/WeatherContentService';
import { WEATHER_LATITUDE, WEATHER_LONGITUDE, WEATHER_TIMEZONE } from '@/config/weather.config';
import type { BlogPost } from '@/types/content';

const RAIN_WARNING_THRESHOLDS = {
  IMMEDIATE: 60, // minutes
  SHORT_TERM: 180, // minutes
};

const WeatherForecastSection: React.FC = () => {
  const [locationData, setLocationData] = useState<{
    lat: number;
    lon: number;
    granted: boolean;
    city?: string;
  } | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [isRequestingLocation, setIsRequestingLocation] = useState(false);
  const [weatherArticles, setWeatherArticles] = useState<BlogPost[]>([]);

  const { data: weatherData, isLoading, error } = useQuery({
    queryKey: ['weather-combined', locationData?.lat, locationData?.lon],
    queryFn: () =>
      fetchCombinedWeatherData(
        locationData?.lat || WEATHER_LATITUDE,
        locationData?.lon || WEATHER_LONGITUDE,
        WEATHER_TIMEZONE
      ),
    enabled: true,
  });

  const precipitation = weatherData?.dailyPrecipitation ?? null;
  const hourlyPrecipitation = weatherData?.hourly;

  // Lade passende Artikel basierend auf dem Wetter
  useEffect(() => {
    if (precipitation !== undefined) {
      const currentWeather = WeatherContentService.getWeatherCondition(precipitation);
      WeatherContentService.getWeatherBasedArticles(currentWeather, 3)
        .then(setWeatherArticles)
        .catch(console.error);
    }
  }, [precipitation]);

  const requestLocation = () => {
    setIsRequestingLocation(true);
    setLocationError(null);

    if (!navigator.geolocation) {
      setLocationError('Geolocation wird von diesem Browser nicht unterstützt');
      setIsRequestingLocation(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        
        try {
          setLocationData({
            lat: latitude,
            lon: longitude,
            granted: true,
            city: 'Dein Standort'
          });
        } catch {
          setLocationData({
            lat: latitude,
            lon: longitude,
            granted: true
          });
        }
        setIsRequestingLocation(false);
      },
      (error) => {
        let errorMessage = 'Standort konnte nicht ermittelt werden';
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = 'Standortzugriff wurde verweigert';
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = 'Standort nicht verfügbar';
            break;
          case error.TIMEOUT:
            errorMessage = 'Standortabfrage hat zu lange gedauert';
            break;
        }
        setLocationError(errorMessage);
        setIsRequestingLocation(false);
      },
      {
        timeout: 10000,
        enableHighAccuracy: false,
        maximumAge: 300000
      }
    );
  };

  const getWeatherIcon = (precipitation: number | null) => {
    if (precipitation === null) return <Sun className="w-12 h-12 text-yellow-500" />;
    if (precipitation > 5) return <CloudRain className="w-12 h-12 text-blue-600" />;
    if (precipitation > 0) return <CloudDrizzle className="w-12 h-12 text-gray-500" />;
    return <Sun className="w-12 h-12 text-yellow-500" />;
  };

  const getWeatherDescription = (precipitation: number | null) => {
    if (precipitation === null) return 'Wetterdaten werden geladen...';
    if (precipitation > 5) return 'Regnerisch - perfekt für Zimmerpflanzen!';
    if (precipitation > 0) return 'Leichter Regen - ideal zum Gießen sparen';
    return 'Sonnig - Zeit für Gartenarbeit im Freien!';
  };

  const getActivitySuggestion = (precipitation: number | null) => {
    if (precipitation === null) return '';
    if (precipitation > 5) return 'Heute ist ein guter Tag für Zimmerpflanzen-Pflege und Planung des nächsten Gartenprojekts.';
    if (precipitation > 0) return 'Leichter Regen bedeutet weniger gießen - nutze die Zeit für andere Gartenarbeiten.';
    return 'Perfektes Wetter für Aussaat, Unkraut jäten oder Ernten im Garten!';
  };

  const getWeatherBadgeColor = (precipitation: number | null) => {
    if (precipitation === null) return 'bg-gray-100 text-gray-700';
    if (precipitation > 5) return 'bg-blue-100 text-blue-700';
    if (precipitation > 0) return 'bg-gray-100 text-gray-700';
    return 'bg-yellow-100 text-yellow-700';
  };

  const getNextRainWindow = () => {
    if (!hourlyPrecipitation) return null;
    const { time, precipitation } = hourlyPrecipitation;
    const now = Date.now();
    for (let i = 0; i < precipitation.length; i++) {
      if (precipitation[i] > 0) {
        const start = new Date(time[i]);
        let j = i;
        while (j < precipitation.length && precipitation[j] > 0) {
          j++;
        }
        const end = new Date(time[j - 1]);
        if (start.getTime() > now) {
          return { start, end };
        }
        i = j - 1; // skip past current rain window
      }
    }
    return null;
  };

  const getRainAdvice = (window: { start: Date; end: Date } | null) => {
    if (!window) return null;
    const diffMs = window.start.getTime() - Date.now();
    const diffMinutes = Math.round(diffMs / 60000);
    if (diffMinutes < 0) return null;
    if (diffMinutes <= RAIN_WARNING_THRESHOLDS.IMMEDIATE) {
      return 'Jetzt schnell noch die Gartenstühle reinholen!';
    }
    if (diffMinutes <= RAIN_WARNING_THRESHOLDS.SHORT_TERM) {
      const hours = Math.round((diffMinutes / 60) * 10) / 10;
      return `Regen in ca. ${hours} Stunden.`;
    }
    return null;
  };

  const nextRainWindow = getNextRainWindow();
  const rainAdvice = getRainAdvice(nextRainWindow);

  return (
    <section className="py-12 px-4 bg-gradient-to-br from-sky-50 to-blue-50">
      <div className="max-w-4xl mx-auto">
        <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
          <CardHeader className="text-center pb-4">
            <CardTitle className="text-2xl md:text-3xl font-serif font-bold text-earth-800 mb-2">
              🌤️ Dein Gartenwetter heute
            </CardTitle>
            <p className="text-sage-600 text-sm">
              Möchtest du wissen, was du heute bei diesem Wetter machen kannst? 
              Erlaube uns den Standort und kriege nützliche Tipps und Artikel vorgeschlagen!
            </p>
          </CardHeader>
          
          <CardContent className="space-y-6">
            {/* Standort-Bereich */}
            {!locationData?.granted && (
              <div className="text-center space-y-4">
                <Button 
                  onClick={requestLocation}
                  disabled={isRequestingLocation}
                  className="bg-sage-600 hover:bg-sage-700 text-white px-6 py-3 rounded-full text-lg font-medium shadow-lg hover:shadow-xl transition-all"
                >
                  <MapPin className="w-5 h-5 mr-2" />
                  {isRequestingLocation ? 'Ermittle Standort...' : 'Standort für lokales Wetter teilen'}
                </Button>
                
                {locationError && (
                  <Alert className="border-red-200 bg-red-50">
                    <AlertCircle className="h-4 w-4 text-red-600" />
                    <AlertDescription className="text-red-700">
                      {locationError}. Wir zeigen dir das Wetter für Ostfriesland.
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            )}

            {/* Wetter-Anzeige */}
            <div className="text-center space-y-4">
              {locationData?.granted && (
                <div className="flex items-center justify-center gap-2 text-sage-600 mb-4">
                  <MapPin className="w-4 h-4" />
                  <span className="text-sm">{locationData.city || 'Dein Standort'}</span>
                </div>
              )}

              <div className="flex justify-center mb-4">
                {isLoading ? (
                  <div className="w-12 h-12 border-4 border-sage-200 border-t-sage-600 rounded-full animate-spin" />
                ) : error ? (
                  <AlertCircle className="w-12 h-12 text-orange-500" />
                ) : (
                  getWeatherIcon(precipitation)
                )}
              </div>

              {isLoading ? (
                <p className="text-sage-600">Lade Wetterdaten...</p>
              ) : error ? (
                <div className="space-y-2">
                  <p className="text-orange-600 font-medium">Wetterdaten momentan nicht verfügbar</p>
                  <p className="text-sage-600 text-sm">Aber Marianne hat trotzdem tolle Gartentipps für dich!</p>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="bg-gradient-to-r from-sage-100 to-blue-100 rounded-lg p-4">
                    <p className="text-earth-700 text-lg font-medium mb-1">
                      {getWeatherDescription(precipitation)}
                    </p>
                    {precipitation !== null && (
                      <div className="flex items-center justify-center gap-2 mt-2">
                        <p className="text-sage-600 text-sm">
                          Niederschlag heute: <strong>{precipitation.toFixed(1)} mm</strong>
                        </p>
                        <Badge className={getWeatherBadgeColor(precipitation)}>
                          {WeatherContentService.getWeatherCondition(precipitation)}
                        </Badge>
                      </div>
                    )}
                    {hourlyPrecipitation && nextRainWindow && (
                      <p className="text-sage-600 text-sm mt-1">
                        Regen von {format(nextRainWindow.start, 'HH:mm')} bis {format(nextRainWindow.end, 'HH:mm')}
                      </p>
                    )}
                  </div>

                  <div className="bg-accent-50 rounded-lg p-4 border border-accent-100">
                    <p className="text-earth-700 font-medium mb-2">🌱 Mariannes Tipp für heute:</p>
                    <p className="text-sage-700 text-sm">
                      {getActivitySuggestion(precipitation)}
                    </p>
                    {rainAdvice && (
                      <p className="text-sage-700 text-sm mt-2 font-medium">{rainAdvice}</p>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Wetter-basierte Artikel-Empfehlungen */}
            {weatherArticles.length > 0 && (
              <div className="space-y-4">
                <div className="flex items-center gap-2 justify-center">
                  <BookOpen className="w-5 h-5 text-sage-600" />
                  <h3 className="text-lg font-semibold text-earth-700">
                    Passende Artikel für heute
                  </h3>
                </div>
                
                <div className="grid gap-3">
                  {weatherArticles.map((article) => (
                    <Link
                      key={article.id}
                      to={`/blog/${article.slug}`}
                      className="group block bg-white rounded-lg p-4 border border-sage-100 hover:border-sage-300 hover:shadow-md transition-all"
                    >
                      <div className="flex items-start gap-3">
                        {article.featuredImage && (
                          <img
                            src={article.featuredImage}
                            alt={article.title}
                            className="w-16 h-16 rounded-lg object-cover flex-shrink-0"
                          />
                        )}
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-earth-800 group-hover:text-sage-700 transition-colors line-clamp-2">
                            {article.title}
                          </h4>
                          <p className="text-sm text-sage-600 mt-1 line-clamp-2">
                            {article.excerpt}
                          </p>
                          <div className="flex items-center gap-2 mt-2">
                            <Badge variant="outline" className="text-xs">
                              {article.category}
                            </Badge>
                            {article.weatherTags && article.weatherTags.length > 0 && (
                              <Badge className="text-xs bg-blue-100 text-blue-700">
                                {article.weatherTags[0]}
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {!locationData?.granted && (
              <p className="text-xs text-sage-500 mt-4 text-center">
                ✨ Mit deinem Standort können wir dir noch passendere Empfehlungen geben!
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </section>
  );
};

export default WeatherForecastSection;
