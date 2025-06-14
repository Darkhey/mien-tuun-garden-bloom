export interface SiteConfig {
  // Grundlegende Site-Informationen
  name: string;
  title: string;
  description: string;
  url: string;
  author: string;
  
  // SEO & Meta
  keywords: string[];
  defaultOgImage: string;
  favicon: string;
  
  // Design & Theme
  theme: {
    primaryColor: string;
    secondaryColor: string;
    accentColor: string;
    backgroundColor: string;
    textColor: string;
    mutedColor: string;
  };
  
  // Social Media & Links
  social: {
    instagram?: string;
    pinterest?: string;
    facebook?: string;
    youtube?: string;
    email?: string;
    newsletter?: string;
  };
  
  // Content-Kategorien
  categories: string[];
  
  // Monetarisierung
  monetization: {
    adsEnabled: boolean;
    // Ergänzung: Optional AdSense Publisher-ID in config
    adsenseClientId: "", // <--- Hier ggf. echten Wert eintragen!
    affiliateEnabled: boolean;
    donationEnabled: boolean;
    donationLink?: string;
  };
  
  // API Keys (werden über Umgebungsvariablen geladen)
  apis: {
    openaiEnabled: boolean;
    pexelsEnabled: boolean;
    emailEnabled: boolean;
  };
}

export const siteConfig: SiteConfig = {
  name: "mien-tuun",
  title: "Mien Tuun - Garten, Küche & nachhaltiges Leben",
  description: "Entdecke saisonale Rezepte, Gartentipps und nachhaltige Ideen für ein bewusstes Leben. Dein Zuhause für Inspiration rund um Garten und Küche.",
  url: "https://mien-tuun.de",
  author: "Mien Tuun Team",
  
  keywords: [
    "Garten",
    "Rezepte", 
    "Nachhaltigkeit",
    "DIY",
    "Selbstversorgung",
    "saisonal kochen",
    "Gartenarbeit",
    "Kräuter",
    "Bio",
    "Zero Waste"
  ],
  
  defaultOgImage: "/images/og-default.jpg",
  favicon: "/favicon.ico",
  
  theme: {
    primaryColor: "#8B7355", // warmes braun
    secondaryColor: "#A8B5A0", // salbeigrün  
    accentColor: "#D4AF8C", // sanftes gold
    backgroundColor: "#FEFCF8", // cremeweiß
    textColor: "#2D3319", // dunkelgrün
    mutedColor: "#8B9A8B", // gedämpftes grün
  },
  
  social: {
    instagram: "https://instagram.com/mientuun.garten",  // <-- HIER aktualisiert
    pinterest: "https://pinterest.com/mientuun", 
    facebook: "https://facebook.com/mientuun",
    email: "hallo@mien-tuun.de",
    newsletter: "https://mien-tuun.de/newsletter"
  },
  
  categories: [
    "Garten & Pflanzen",
    "Saisonale Rezepte", 
    "DIY & Selbermachen",
    "Nachhaltigkeit",
    "Kräuter & Heilpflanzen",
    "Konservieren & Einmachen"
  ],
  
  monetization: {
    adsEnabled: true, // <-- Aktiviert Werbung!
    adsenseClientId: "ca-pub-1234567890123456", // <-- DEINE AdSense-ID hier eintragen!
    affiliateEnabled: true,
    donationEnabled: true,
    donationLink: "https://ko-fi.com/mientuun"
  },
  
  apis: {
    openaiEnabled: false, // wird aktiviert wenn API Key vorhanden
    pexelsEnabled: false, // wird aktiviert wenn API Key vorhanden  
    emailEnabled: false // wird aktiviert wenn Email Service konfiguriert
  }
};
