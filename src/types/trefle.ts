export interface TreflePlant {
  id: number;
  scientific_name: string;
  common_name: string | null;
  family: string;
  image_url: string | null;
  year: number | null;
  family_common_name: string | null;
}

export interface TreflePlantDetails extends TreflePlant {
  growth: {
    days_to_harvest: string | null;
    minimum_temperature: {
      deg_c: number | null;
      deg_f: number | null;
    };
    maximum_temperature: {
      deg_c: number | null;
      deg_f: number | null;
    };
    soil_humidity: number | null;
    soil_nutriments: number | null;
    soil_salinity: number | null;
    soil_texture: number | null;
    soil_ph_minimum: number | null;
    soil_ph_maximum: number | null;
    light: number | null;
    atmospheric_humidity: number | null;
    growth_months: number[] | null;
    bloom_months: number[] | null;
    fruit_months: number[] | null;
    row_spacing: {
      cm: number | null;
      in: number | null;
    };
    spread: {
      cm: number | null;
      in: number | null;
    };
    sowing_method: string | null;
  };
  specifications: {
    ligneous_type: string | null;
    growth_form: string | null;
    growth_habit: string | null;
    growth_rate: string | null;
    edible: boolean | null;
    vegetable: boolean | null;
    edible_part: string[] | null;
    edible_use: string | null;
    medicinal: boolean | null;
    toxicity: string | null;
  };
  distributions: {
    native: string[] | null;
    introduced: string[] | null;
  };
}

export interface TrefleSearchResponse {
  plants: TreflePlant[];
  meta: {
    total: number;
    last_page: number;
    current_page: number;
  };
  links: {
    self: string;
    first: string;
    next: string | null;
    prev: string | null;
    last: string;
  };
}

export interface TrefleFilterOptions {
  edible?: boolean;
  vegetable?: boolean;
  category?: string;
  page?: number;
  limit?: number;
}