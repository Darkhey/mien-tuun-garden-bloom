import type { PlantData, SowingCategory } from '@/types/sowing';

const CATEGORY_LABELS: Record<string, string> = {
  directSow: 'Aussaat draußen',
  indoor: 'Vorziehen',
  plantOut: 'Auspflanzen',
  harvest: 'Ernte',
};

function getMonthsForCategory(plant: PlantData, key: string): number[] {
  switch (key) {
    case 'directSow': return plant.directSow || [];
    case 'indoor': return plant.indoor || [];
    case 'plantOut': return plant.plantOut || [];
    case 'harvest': return plant.harvest || [];
    default: return [];
  }
}

function pad(n: number): string {
  return n.toString().padStart(2, '0');
}

function formatDate(year: number, month: number, day: number): string {
  return `${year}${pad(month)}${pad(day)}`;
}

export function generateICalForPlants(plants: PlantData[], categories: SowingCategory[]): string {
  const year = new Date().getFullYear();
  const now = new Date();
  const timestamp = `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}T${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}Z`;

  const lines: string[] = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//MienTuun//Aussaatkalender//DE',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'X-WR-CALNAME:Aussaatkalender',
    'X-WR-TIMEZONE:Europe/Berlin',
  ];

  let uid = 0;

  for (const plant of plants) {
    for (const cat of categories) {
      const months = getMonthsForCategory(plant, cat.key);
      if (months.length === 0) continue;

      // Group consecutive months into ranges
      const sorted = [...months].sort((a, b) => a - b);
      let rangeStart = sorted[0];
      let rangeEnd = sorted[0];

      const ranges: [number, number][] = [];
      for (let i = 1; i < sorted.length; i++) {
        if (sorted[i] === rangeEnd + 1) {
          rangeEnd = sorted[i];
        } else {
          ranges.push([rangeStart, rangeEnd]);
          rangeStart = sorted[i];
          rangeEnd = sorted[i];
        }
      }
      ranges.push([rangeStart, rangeEnd]);

      for (const [start, end] of ranges) {
        uid++;
        const dtStart = formatDate(year, start, 1);
        // End date: last day of end month
        const lastDay = new Date(year, end, 0).getDate();
        const dtEnd = formatDate(year, end, lastDay);
        const label = CATEGORY_LABELS[cat.key] || cat.label;

        lines.push(
          'BEGIN:VEVENT',
          `UID:mien-tuun-${uid}@aussaatkalender`,
          `DTSTAMP:${timestamp}`,
          `DTSTART;VALUE=DATE:${dtStart}`,
          `DTEND;VALUE=DATE:${dtEnd}`,
          `SUMMARY:${plant.name} – ${label}`,
          `DESCRIPTION:${plant.name}: ${label}${plant.notes ? '. ' + plant.notes : ''}`,
          `CATEGORIES:${label}`,
          'TRANSP:TRANSPARENT',
          'END:VEVENT',
        );
      }
    }
  }

  lines.push('END:VCALENDAR');
  return lines.join('\r\n');
}

export function downloadICal(plants: PlantData[], categories: SowingCategory[]) {
  const ical = generateICalForPlants(plants, categories);
  const blob = new Blob([ical], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'aussaatkalender.ics';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
