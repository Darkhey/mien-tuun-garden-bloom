import { useState, useCallback, useEffect } from 'react';

const STORAGE_KEY = 'sowing-calendar-favorites';

function loadFavorites(): Set<string> {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? new Set(JSON.parse(stored)) : new Set();
  } catch {
    return new Set();
  }
}

function saveFavorites(favs: Set<string>) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify([...favs]));
}

export function usePlantFavorites() {
  const [favorites, setFavorites] = useState<Set<string>>(loadFavorites);
  const [showOnlyFavorites, setShowOnlyFavorites] = useState(false);

  useEffect(() => {
    saveFavorites(favorites);
  }, [favorites]);

  const toggleFavorite = useCallback((plantId: string) => {
    setFavorites(prev => {
      const next = new Set(prev);
      if (next.has(plantId)) {
        next.delete(plantId);
      } else {
        next.add(plantId);
      }
      return next;
    });
  }, []);

  const isFavorite = useCallback((plantId: string) => favorites.has(plantId), [favorites]);

  return { favorites, toggleFavorite, isFavorite, showOnlyFavorites, setShowOnlyFavorites, count: favorites.size };
}
