import { describe, it, expect } from 'vitest';
import { trefleApiService } from '../TrefleApiService';

const mockPlant: any = {
  id: 1,
  scientific_name: 'Solanum lycopersicum',
  common_name: 'Tomate',
  family: 'Solanaceae',
  image_url: 'img',
  year: 1753,
  family_common_name: 'Nachtschatten',
  growth: {
    days_to_harvest: null,
    minimum_temperature: { deg_c: 10, deg_f: 50 },
    maximum_temperature: { deg_c: 30, deg_f: 86 },
    soil_humidity: 5,
    soil_nutriments: null,
    soil_salinity: null,
    soil_texture: null,
    soil_ph_minimum: null,
    soil_ph_maximum: null,
    light: 8,
    atmospheric_humidity: null,
    growth_months: [4,5,6,7,8],
    bloom_months: [6,7,8],
    fruit_months: [7,8,9],
    row_spacing: { cm: 50, in: null },
    spread: { cm: 40, in: null },
    sowing_method: 'indirect'
  },
  specifications: {
    ligneous_type: null,
    growth_form: null,
    growth_habit: null,
    growth_rate: null,
    edible: true,
    vegetable: true,
    edible_part: ['fruits'],
    edible_use: 'fresh',
    medicinal: null,
    toxicity: null
  },
  distributions: { native: null, introduced: null }
};

describe('TrefleApiService mapToSowingCalendarFormat', () => {
  it('converts plant details', () => {
    const result = trefleApiService.mapToSowingCalendarFormat(mockPlant);
    expect(result.name).toBe('Tomate');
    expect(result.type).toBe('Gemüse');
    expect(result.season).toContain('Frühling');
    expect(result.season).toContain('Sommer');
    expect(result.directSow.length).toBe(0);
    expect(result.indoor[0]).toBe(1);
    expect(result.plantOut[0]).toBe(3);
    expect(result.harvest).toContain(9);
  });
});
