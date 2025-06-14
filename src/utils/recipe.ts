
const SUPABASE_STORAGE_URL = "https://ublbxvpmoccmegtwaslh.supabase.co/storage/v1/object/public/recipe-images/";

export function parseJsonArray(val: any): any[] {
  if (Array.isArray(val)) return val;
  if (typeof val === "string") {
    try { 
      const arr = JSON.parse(val); 
      if(Array.isArray(arr)) return arr;
    } catch (e) {
      // Ignore parsing error, return empty array
    }
  }
  return [];
}

export function getRecipeImageUrl(imagePath: string | null): string {
  if (!imagePath) return "/placeholder.svg";
  return SUPABASE_STORAGE_URL + imagePath;
}
