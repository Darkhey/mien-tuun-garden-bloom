import React from 'react';
import { useQuery } from '@tanstack/react-query';

interface WeatherData {
  daily: {
    precipitation_sum: number[];
    time: string[];
  };
}

const fetchRainForecast = async (): Promise<number | null> => {
  const url =
    'https://api.open-meteo.com/v1/forecast?latitude=53.5&longitude=7.1&daily=precipitation_sum&timezone=Europe%2FBerlin';
  const res = await fetch(url);
  if (!res.ok) return null;
  const data = (await res.json()) as WeatherData;
  return data.daily.precipitation_sum[0] ?? null;
};

const WeatherForecastSection: React.FC = () => {
  const { data, isLoading } = useQuery({
    queryKey: ['rain-forecast'],
    queryFn: fetchRainForecast,
  });

  return (
    <section className="py-16 px-4 bg-accent-50">
      <div className="max-w-xl mx-auto text-center">
        <h2 className="text-2xl md:text-3xl font-serif font-bold text-earth-800 mb-4">
          Wettervorschau
        </h2>
        {isLoading ? (
          <p className="text-sage-600">Lade Wetterdaten...</p>
        ) : data !== null ? (
          <p className="text-earth-700 text-lg">
            Voraussichtlicher Niederschlag heute: <strong>{data.toFixed(1)} mm</strong>
          </p>
        ) : (
          <p className="text-sage-600">Keine Wetterdaten verfügbar.</p>
        )}
      </div>
    </section>
  );
};

export default WeatherForecastSection;
