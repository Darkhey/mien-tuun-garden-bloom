
export function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/ä/g, 'ae')
    .replace(/ö/g, 'oe')
    .replace(/ü/g, 'ue')
    .replace(/ß/g, 'ss')
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function getRandom<T>(arr: T[]): T {
  if (!Array.isArray(arr) || arr.length === 0) {
    throw new Error("getRandom requires a non-empty array");
  }
  return arr[Math.floor(Math.random() * arr.length)];
}
