export function getUnsplashFallback(category: string): string {
  const images: Record<string, string[]> = {
    garden: [
      "https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=1200&h=600&fit=crop",
      "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=1200&h=600&fit=crop",
      "https://images.unsplash.com/photo-1501854140801-50d01698950b?w=1200&h=600&fit=crop"
    ],
    kitchen: [
      "https://images.unsplash.com/photo-1556911220-bff31c812dba?w=1200&h=600&fit=crop",
      "https://images.unsplash.com/photo-1542838132-92c53300491e?w=1200&h=600&fit=crop",
      "https://images.unsplash.com/photo-1586093728648-04db0bd4c827?w=1200&h=600&fit=crop"
    ],
    default: [
      "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=1200&h=600&fit=crop",
      "https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=1200&h=600&fit=crop"
    ]
  };

  const key = category?.toLowerCase() || "default";
  const list = images[key] || images.default;
  return list[Math.floor(Math.random() * list.length)];
}
