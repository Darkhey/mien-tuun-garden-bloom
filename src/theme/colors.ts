export const earth = {
  50: '#FEFCF8',
  100: '#FDF9F1',
  200: '#F9F1E6',
  300: '#F2E6D0',
  400: '#E6D1B0',
  500: '#D4AF8C',
  600: '#B8956F',
  700: '#8B7355',
  800: '#6B5642',
  900: '#4A3C2F',
} as const;

export const sage = {
  50: '#F6F8F6',
  100: '#EDF2ED',
  200: '#D8E3D8',
  300: '#B8C9B8',
  400: '#A8B5A0',
  500: '#8B9A8B',
  600: '#6F7F6F',
  700: '#556655',
  800: '#3D4F3D',
  900: '#2D3319',
} as const;

export const accent = {
  50: '#FDF9F3',
  100: '#FAF0E4',
  200: '#F4E0C6',
  300: '#EBCB9F',
  400: '#D4AF8C',
  500: '#C19660',
  600: '#A67B4A',
  700: '#8B6439',
  800: '#6F4F2B',
  900: '#573E20',
} as const;

export const cream = '#FEFCF8';

export const misc = {
  emailLink: '#19793a',
  viteLogoShadow: '#646cffaa',
  reactLogoShadow: '#61dafbaa',
  cardText: '#888',
  gridLine: '#ccc',
  white: '#fff',
} as const;

export const themeLight = {
  background: '0 0% 100%',
  foreground: '222.2 84% 4.9%',
  card: '0 0% 100%',
  cardForeground: '222.2 84% 4.9%',
  popover: '0 0% 100%',
  popoverForeground: '222.2 84% 4.9%',
  primary: '222.2 47.4% 11.2%',
  primaryForeground: '210 40% 98%',
  secondary: '210 40% 96.1%',
  secondaryForeground: '222.2 47.4% 11.2%',
  muted: '210 40% 96.1%',
  mutedForeground: '215.4 16.3% 46.9%',
  accent: '210 40% 96.1%',
  accentForeground: '222.2 47.4% 11.2%',
  destructive: '0 84.2% 60.2%',
  destructiveForeground: '210 40% 98%',
  border: '214.3 31.8% 91.4%',
  input: '214.3 31.8% 91.4%',
  ring: '222.2 84% 4.9%',
  radius: '0.5rem',
  sidebarBackground: '0 0% 98%',
  sidebarForeground: '240 5.3% 26.1%',
  sidebarPrimary: '240 5.9% 10%',
  sidebarPrimaryForeground: '0 0% 98%',
  sidebarAccent: '240 4.8% 95.9%',
  sidebarAccentForeground: '240 5.9% 10%',
  sidebarBorder: '220 13% 91%',
  sidebarRing: '217.2 91.2% 59.8%',
} as const;

export const themeDark = {
  background: '222.2 84% 4.9%',
  foreground: '210 40% 98%',
  card: '222.2 84% 4.9%',
  cardForeground: '210 40% 98%',
  popover: '222.2 84% 4.9%',
  popoverForeground: '210 40% 98%',
  primary: '210 40% 98%',
  primaryForeground: '222.2 47.4% 11.2%',
  secondary: '217.2 32.6% 17.5%',
  secondaryForeground: '210 40% 98%',
  muted: '217.2 32.6% 17.5%',
  mutedForeground: '215 20.2% 65.1%',
  accent: '217.2 32.6% 17.5%',
  accentForeground: '210 40% 98%',
  destructive: '0 62.8% 30.6%',
  destructiveForeground: '210 40% 98%',
  border: '217.2 32.6% 17.5%',
  input: '217.2 32.6% 17.5%',
  ring: '212.7 26.8% 83.9%',
  sidebarBackground: '240 5.9% 10%',
  sidebarForeground: '240 4.8% 95.9%',
  sidebarPrimary: '224.3 76.3% 48%',
  sidebarPrimaryForeground: '0 0% 100%',
  sidebarAccent: '240 3.7% 15.9%',
  sidebarAccentForeground: '240 4.8% 95.9%',
  sidebarBorder: '240 3.7% 15.9%',
  sidebarRing: '217.2 91.2% 59.8%',
} as const;

export default {
  earth,
  sage,
  accent,
  cream,
  misc,
  themeLight,
  themeDark,
};

export function applyColors(mode: 'light' | 'dark' = 'light') {
  const vars = mode === 'light' ? themeLight : themeDark;
  const root = document.documentElement;
  const toVar = (s: string) => `--${s.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase()}`;
  Object.entries(vars).forEach(([key, value]) => root.style.setProperty(toVar(key), value));
  Object.entries(misc).forEach(([key, value]) => root.style.setProperty(toVar(key), value));
}
