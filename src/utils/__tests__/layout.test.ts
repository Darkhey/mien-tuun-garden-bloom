import { describe, it, expect } from 'vitest';
import { detectOverlaps, resolveOverlaps, resizeItem, LayoutItem } from '../layout';

describe('layout utilities', () => {
  it('detects overlaps', () => {
    const layout: LayoutItem[] = [
      { i: 'a', x: 0, y: 0, w: 2, h: 2 },
      { i: 'b', x: 1, y: 1, w: 2, h: 2 },
      { i: 'c', x: 3, y: 0, w: 1, h: 1 }
    ];
    const overlaps = detectOverlaps(layout);
    expect(overlaps).toEqual([{ item1: 'a', item2: 'b' }]);
  });

  it('resolves overlaps by moving items', () => {
    const layout: LayoutItem[] = [
      { i: 'a', x: 0, y: 0, w: 2, h: 2 },
      { i: 'b', x: 1, y: 1, w: 2, h: 2 }
    ];
    const resolved = resolveOverlaps(layout);
    expect(detectOverlaps(resolved)).toHaveLength(0);
    const a = resolved.find(i => i.i === 'a')!;
    const b = resolved.find(i => i.i === 'b')!;
    expect(b.y).toBeGreaterThanOrEqual(a.y + a.h);
  });

  it('resizes item and keeps layout valid', () => {
    const layout: LayoutItem[] = [
      { i: 'a', x: 0, y: 0, w: 1, h: 1 },
      { i: 'b', x: 0, y: 1, w: 1, h: 1 }
    ];
    const resized = resizeItem(layout, 'a', 1, 2);
    expect(detectOverlaps(resized)).toHaveLength(0);
    const b = resized.find(i => i.i === 'b')!;
    expect(b.y).toBe(2);
  });
});
