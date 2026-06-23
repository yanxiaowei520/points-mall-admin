import type { Product } from '../types/product';

export function generateId(products: Product[]): string {
  const today = new Date().toISOString().slice(0, 10).replace(/-/g, '');

  let maxSeq = 0;
  for (const p of products) {
    if (p.id.startsWith(`P${today}`)) {
      const seq = parseInt(p.id.slice(-4), 10);
      if (seq > maxSeq) maxSeq = seq;
    }
  }

  return `P${today}${String(maxSeq + 1).padStart(4, '0')}`;
}
