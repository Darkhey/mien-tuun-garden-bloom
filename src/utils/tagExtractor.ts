export function extractTagsFromText(
  text: string,
  limit = 5,
  minWordLength = 3
): string[] {
  const STOPWORDS = [
    'der','die','das','und','mit','von','auf','für','ein','eine','in','im','um','zu','den','dem','des','du','er','sie','es'
  ];
  const words = text
    .toLowerCase()
    .replace(/<[^>]*>/g, ' ')
    .replace(/<!--[\s\S]*?-->/g, ' ')
    .replace(/[^\p{L}\p{N}\s]/gu, ' ')
    .split(/\s+/)
    .filter(Boolean);
  const freq: Record<string, number> = {};
  for (const word of words) {
    if (word.length < minWordLength || STOPWORDS.includes(word)) continue;
    freq[word] = (freq[word] || 0) + 1;
  }
  return Object.entries(freq)
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([w]) => w);
}
