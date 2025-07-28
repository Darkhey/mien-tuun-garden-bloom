// Importiere zentrale Konfiguration
import { CATEGORIES, SEASONS, AUTHORS, TAGS, corsHeaders } from "../_shared/blog-config.ts";

// Re-exportiere für Kompatibilität
export { CATEGORIES, SEASONS, AUTHORS, TAGS };

export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};
