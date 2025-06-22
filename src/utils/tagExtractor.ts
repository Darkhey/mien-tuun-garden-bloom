/**
 * Extracts the most frequent significant words from a text as tags.
 *
 * Processes the input text by removing HTML tags, filtering out short words and common German stopwords, and returns up to the specified number of the most frequent words.
 *
 * @param text - The input text to analyze
 * @param limit - The maximum number of tags to return (default is 5)
 * @returns An array of the most frequent significant words found in the text
 */
export function extractTagsFromText(text: string, limit = 5): string[] {
  const STOPWORDS = [
    'der','die','das','und','mit','von','auf','für','ein','eine','in','im','um','zu','den','dem','des','du','er','sie','es'
  ];
  const words = text
    .toLowerCase()
    .replace(/<[^>]+>/g, ' ')
    .replace(/[^\p{L}\p{N}\s]/gu, ' ')
    .split(/\s+/)
    .filter(Boolean);
  const freq: Record<string, number> = {};
  for (const word of words) {
    if (word.length <= 3 || STOPWORDS.includes(word)) continue;
    freq[word] = (freq[word] || 0) + 1;
  }
  return Object.entries(freq)
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([w]) => w);
}
