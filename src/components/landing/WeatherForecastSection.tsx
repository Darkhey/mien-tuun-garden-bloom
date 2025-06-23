import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchRainForecast } from '@/queries/content';


const WeatherForecastSection: React.FC = () => {
  const { data, isLoading, error } = useQuery({
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
        ) : error ? (
          <p className="text-sage-600">Wetterdaten momentan nicht verfügbar.</p>
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
