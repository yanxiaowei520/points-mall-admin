import { describe, it, expect, vi } from 'vitest';
import { generateId } from '../generateId';
import type { Product } from '../../types/product';

function mockProduct(id: string): Product {
  return {
    id,
    name: '测试商品',
    type: '化肥',
    coverImage: '/test.jpg',
    detailImages: ['/test1.jpg'],
    stock: 10,
    price: 100,
    effectiveStart: '2026-01-01T00:00:00Z',
    effectiveEnd: '2026-12-31T23:59:59Z',
    status: '草稿',
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z',
  };
}

describe('generateId', () => {
  it('returns ID starting with P + today date', () => {
    const result = generateId([]);
    const today = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    expect(result).toMatch(new RegExp(`^P${today}\\d{4}$`));
  });

  it('starts sequence at 0001 when no products exist', () => {
    const result = generateId([]);
    expect(result.endsWith('0001')).toBe(true);
  });

  it('increments sequence when products exist for today', () => {
    const today = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const existing = [mockProduct(`P${today}0001`), mockProduct(`P${today}0002`)];
    const result = generateId(existing);
    expect(result).toBe(`P${today}0003`);
  });

  it('restarts sequence at 0001 for a new day', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-06-24T10:00:00Z'));
    const existing = [mockProduct('P2026062300005')];
    const result = generateId(existing);
    expect(result).toBe('P202606240001');
    vi.useRealTimers();
  });

  it('ignores products from other days when computing sequence', () => {
    const today = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const yesterday = '20260622';
    const existing = [mockProduct(`P${yesterday}0005`)];
    const result = generateId(existing);
    expect(result).toBe(`P${today}0001`);
  });
});
