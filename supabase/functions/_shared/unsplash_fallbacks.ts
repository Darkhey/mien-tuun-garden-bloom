
// Comprehensive Unsplash fallback images for all blog categories
export function getUnsplashFallback(category: string): string {
  const images: Record<string, string[]> = {
    "garten & planung": [
      "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=1200&h=600&fit=crop",
      "https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?w=1200&h=600&fit=crop",
      "https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=1200&h=600&fit=crop",
      "https://images.unsplash.com/photo-1523348837708-15d4a09cfac2?w=1200&h=600&fit=crop"
    ],
    "pflanzenpflege": [
      "https://images.unsplash.com/photo-1466692476868-aef1dfb1e735?w=1200&h=600&fit=crop",
      "https://images.unsplash.com/photo-1459411552884-841db9b3cc2a?w=1200&h=600&fit=crop",
      "https://images.unsplash.com/photo-1509223197845-458d87318791?w=1200&h=600&fit=crop"
    ],
    "ernte & küche": [
      "https://images.unsplash.com/photo-1542838132-92c53300491e?w=1200&h=600&fit=crop",
      "https://images.unsplash.com/photo-1556911220-bff31c812dba?w=1200&h=600&fit=crop",
      "https://images.unsplash.com/photo-1490818387583-1baba5e638af?w=1200&h=600&fit=crop",
      "https://images.unsplash.com/photo-1606787366850-de6330128bfc?w=1200&h=600&fit=crop"
    ],
    "nachhaltigkeit & umwelt": [
      "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=1200&h=600&fit=crop",
      "https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?w=1200&h=600&fit=crop",
      "https://images.unsplash.com/photo-1470058869958-2a77bde3e86a?w=1200&h=600&fit=crop"
    ],
    "spezielle gartenbereiche": [
      "https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=1200&h=600&fit=crop",
      "https://images.unsplash.com/photo-1598902108854-d1446e214c2d?w=1200&h=600&fit=crop",
      "https://images.unsplash.com/photo-1591857177580-dc82b9ac4e1e?w=1200&h=600&fit=crop"
    ],
    "selbermachen & ausrüstung": [
      "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=1200&h=600&fit=crop",
      "https://images.unsplash.com/photo-1592419044706-39796d40f98c?w=1200&h=600&fit=crop",
      "https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=1200&h=600&fit=crop"
    ],
    "philosophie & lifestyle": [
      "https://images.unsplash.com/photo-1501854140801-50d01698950b?w=1200&h=600&fit=crop",
      "https://images.unsplash.com/photo-1470058869958-2a77bde3e86a?w=1200&h=600&fit=crop",
      "https://images.unsplash.com/photo-1433086966358-54859d0ed716?w=1200&h=600&fit=crop"
    ],
    default: [
      "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=1200&h=600&fit=crop",
      "https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=1200&h=600&fit=crop",
      "https://images.unsplash.com/photo-1501854140801-50d01698950b?w=1200&h=600&fit=crop"
    ]
  };

  const key = category?.toLowerCase()?.trim() || "default";
  const list = images[key] || images.default;
  return list[Math.floor(Math.random() * list.length)];
}
