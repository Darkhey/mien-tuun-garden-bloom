export interface LayoutItem {
  i: string;
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface Overlap {
  item1: string;
  item2: string;
}

export const detectOverlaps = (layout: LayoutItem[]): Overlap[] => {
  const overlaps: Overlap[] = [];
  for (let i = 0; i < layout.length; i++) {
    for (let j = i + 1; j < layout.length; j++) {
      const item1 = layout[i];
      const item2 = layout[j];

      const item1Right = item1.x + item1.w;
      const item1Bottom = item1.y + item1.h;
      const item2Right = item2.x + item2.w;
      const item2Bottom = item2.y + item2.h;

      if (!(item1Right <= item2.x || item2Right <= item1.x ||
            item1Bottom <= item2.y || item2Bottom <= item1.y)) {
        overlaps.push({ item1: item1.i, item2: item2.i });
      }
    }
  }
  return overlaps;
};

export const resolveOverlaps = (layout: LayoutItem[]): LayoutItem[] => {
  const sorted = layout.map(item => ({ ...item })).sort((a, b) => a.y - b.y);
  for (let i = 0; i < sorted.length; i++) {
    const current = sorted[i];
    for (let j = i + 1; j < sorted.length; j++) {
      const other = sorted[j];
      const currentRight = current.x + current.w;
      const currentBottom = current.y + current.h;
      const otherRight = other.x + other.w;
      const otherBottom = other.y + other.h;
      if (!(currentRight <= other.x || otherRight <= current.x ||
            currentBottom <= other.y || otherBottom <= current.y)) {
        other.y = currentBottom;
      }
    }
  }
  return sorted;
};

export const resizeItem = (
  layout: LayoutItem[],
  id: string,
  newWidth: number,
  newHeight: number,
  resolve = true
): LayoutItem[] => {
  const updated = layout.map(item =>
    item.i === id
      ? { ...item, w: Math.max(1, newWidth), h: Math.max(1, newHeight) }
      : { ...item }
  );
  return resolve ? resolveOverlaps(updated) : updated;
};
