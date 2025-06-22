/**
 * Converts a string into a URL-friendly slug.
 *
 * Transforms the input by lowercasing, replacing German umlauts and ß with ASCII equivalents, removing invalid characters, and formatting spaces and hyphens for use in URLs.
 *
 * @param title - The input string to convert
 * @returns The generated slug string
 */
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

/**
 * Returns a random element from a non-empty array.
 *
 * @param arr - The array to select a random element from. Must not be empty.
 * @returns A randomly selected element from the input array.
 * @throws Error if the input is not a non-empty array.
 */
export function getRandom<T>(arr: T[]): T {
  if (!Array.isArray(arr) || arr.length === 0) {
    throw new Error("getRandom requires a non-empty array");
  }
  return arr[Math.floor(Math.random() * arr.length)];
}
