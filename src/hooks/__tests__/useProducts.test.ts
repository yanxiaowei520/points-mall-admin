import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useProducts } from '../useProducts';
import type { Product } from '../../types/product';

const STORAGE_KEY = 'points_mall_products';

function seedStorage(products: Product[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(products));
}

describe('useProducts', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  // --- CRUD ---

  it('initializes with empty array when localStorage is empty', () => {
    const { result } = renderHook(() => useProducts());
    expect(result.current.products).toEqual([]);
  });

  it('loads products from localStorage on init', () => {
    const existing: Product[] = [
      {
        id: 'P202606230001',
        name: '测试化肥',
        type: '化肥',
        coverImage: '/a.jpg',
        detailImages: ['/b.jpg'],
        stock: 100,
        price: 50,
        effectiveStart: '2026-06-01T00:00:00Z',
        effectiveEnd: '2026-12-31T23:59:59Z',
        status: '草稿',
        createdAt: '2026-06-01T00:00:00Z',
        updatedAt: '2026-06-01T00:00:00Z',
      },
    ];
    seedStorage(existing);
    const { result } = renderHook(() => useProducts());
    expect(result.current.products).toEqual(existing);
  });

  it('addProduct creates a product with auto-generated ID and draft status', () => {
    const { result } = renderHook(() => useProducts());
    let newProduct: Product | undefined;

    act(() => {
      newProduct = result.current.addProduct({
        name: '新商品',
        type: '农药',
        coverImage: '/cover.jpg',
        detailImages: ['/detail1.jpg'],
        stock: 10,
        price: 200,
        effectiveStart: '2026-07-01T00:00:00Z',
        effectiveEnd: '2026-08-01T00:00:00Z',
      });
    });

    expect(newProduct).toBeDefined();
    expect(newProduct!.id).toMatch(/^P\d{8}\d{4}$/);
    expect(newProduct!.name).toBe('新商品');
    expect(newProduct!.type).toBe('农药');
    expect(newProduct!.status).toBe('草稿');
    expect(result.current.products).toHaveLength(1);
  });

  it('getProduct returns product by id', () => {
    const existing: Product[] = [
      {
        id: 'P202606230001',
        name: '商品A',
        type: '化肥',
        coverImage: '/a.jpg',
        detailImages: ['/b.jpg'],
        stock: 10,
        price: 100,
        effectiveStart: '2026-01-01T00:00:00Z',
        effectiveEnd: '2026-12-31T23:59:59Z',
        status: '草稿',
        createdAt: '2026-01-01T00:00:00Z',
        updatedAt: '2026-01-01T00:00:00Z',
      },
    ];
    seedStorage(existing);
    const { result } = renderHook(() => useProducts());
    expect(result.current.getProduct('P202606230001')).toEqual(existing[0]);
    expect(result.current.getProduct('nonexistent')).toBeUndefined();
  });

  it('updateProduct updates allowed fields on non-active product', () => {
    const existing: Product[] = [
      {
        id: 'P202606230001',
        name: '旧名称',
        type: '化肥',
        coverImage: '/a.jpg',
        detailImages: ['/b.jpg'],
        stock: 10,
        price: 100,
        effectiveStart: '2026-01-01T00:00:00Z',
        effectiveEnd: '2026-12-31T23:59:59Z',
        status: '草稿',
        createdAt: '2026-01-01T00:00:00Z',
        updatedAt: '2026-01-01T00:00:00Z',
      },
    ];
    seedStorage(existing);
    const { result } = renderHook(() => useProducts());

    act(() => {
      result.current.updateProduct('P202606230001', { name: '新名称', price: 200 });
    });

    expect(result.current.products[0].name).toBe('新名称');
    expect(result.current.products[0].price).toBe(200);
    expect(result.current.products[0].updatedAt).not.toBe('2026-01-01T00:00:00Z');
  });

  it('updateProduct returns null when product is 上架中', () => {
    const existing: Product[] = [
      {
        id: 'P202606230001',
        name: '已上架商品',
        type: '化肥',
        coverImage: '/a.jpg',
        detailImages: ['/b.jpg'],
        stock: 10,
        price: 100,
        effectiveStart: '2026-01-01T00:00:00Z',
        effectiveEnd: '2026-12-31T23:59:59Z',
        listingReason: '新品上架',
        status: '上架中',
        createdAt: '2026-01-01T00:00:00Z',
        updatedAt: '2026-01-01T00:00:00Z',
      },
    ];
    seedStorage(existing);
    const { result } = renderHook(() => useProducts());

    let returned: Product | null = null;
    act(() => {
      returned = result.current.updateProduct('P202606230001', { name: '修改名称' });
    });

    expect(returned).toBeNull();
    expect(result.current.products[0].name).toBe('已上架商品');
  });

  it('deleteProduct removes product when status is 草稿 or 已下架', () => {
    const existing: Product[] = [
      {
        id: 'P202606230001',
        name: '草稿商品',
        type: '化肥',
        coverImage: '/a.jpg',
        detailImages: ['/b.jpg'],
        stock: 10,
        price: 100,
        effectiveStart: '2026-01-01T00:00:00Z',
        effectiveEnd: '2026-12-31T23:59:59Z',
        status: '草稿',
        createdAt: '2026-01-01T00:00:00Z',
        updatedAt: '2026-01-01T00:00:00Z',
      },
      {
        id: 'P202606230002',
        name: '已下架商品',
        type: '农药',
        coverImage: '/c.jpg',
        detailImages: ['/d.jpg'],
        stock: 5,
        price: 50,
        effectiveStart: '2026-01-01T00:00:00Z',
        effectiveEnd: '2026-12-31T23:59:59Z',
        status: '已下架',
        createdAt: '2026-01-01T00:00:00Z',
        updatedAt: '2026-01-01T00:00:00Z',
      },
    ];
    seedStorage(existing);
    const { result } = renderHook(() => useProducts());

    act(() => {
      result.current.deleteProduct('P202606230001');
    });
    expect(result.current.products).toHaveLength(1);
    expect(result.current.products[0].id).toBe('P202606230002');

    act(() => {
      result.current.deleteProduct('P202606230002');
    });
    expect(result.current.products).toHaveLength(0);
  });

  it('deleteProduct returns false when product is 上架中', () => {
    const existing: Product[] = [
      {
        id: 'P202606230001',
        name: '上架商品',
        type: '化肥',
        coverImage: '/a.jpg',
        detailImages: ['/b.jpg'],
        stock: 10,
        price: 100,
        effectiveStart: '2026-01-01T00:00:00Z',
        effectiveEnd: '2026-12-31T23:59:59Z',
        listingReason: '已上架',
        status: '上架中',
        createdAt: '2026-01-01T00:00:00Z',
        updatedAt: '2026-01-01T00:00:00Z',
      },
    ];
    seedStorage(existing);
    const { result } = renderHook(() => useProducts());

    let ok = true;
    act(() => {
      ok = result.current.deleteProduct('P202606230001');
    });

    expect(ok).toBe(false);
    expect(result.current.products).toHaveLength(1);
  });

  // --- 上架 / 下架 ---

  it('listProduct changes status from 草稿 to 上架中 with reason', () => {
    const existing: Product[] = [
      {
        id: 'P202606230001',
        name: '待上架',
        type: '化肥',
        coverImage: '/a.jpg',
        detailImages: ['/b.jpg'],
        stock: 10,
        price: 100,
        effectiveStart: '2026-01-01T00:00:00Z',
        effectiveEnd: '2026-12-31T23:59:59Z',
        status: '草稿',
        createdAt: '2026-01-01T00:00:00Z',
        updatedAt: '2026-01-01T00:00:00Z',
      },
    ];
    seedStorage(existing);
    const { result } = renderHook(() => useProducts());

    act(() => {
      result.current.listProduct('P202606230001', '新品发布');
    });

    expect(result.current.products[0].status).toBe('上架中');
    expect(result.current.products[0].listingReason).toBe('新品发布');
    expect(result.current.products[0].delistingReason).toBeUndefined();
  });

  it('listProduct from 已下架 changes status to 上架中', () => {
    const existing: Product[] = [
      {
        id: 'P202606230001',
        name: '重新上架',
        type: '化肥',
        coverImage: '/a.jpg',
        detailImages: ['/b.jpg'],
        stock: 10,
        price: 100,
        effectiveStart: '2026-01-01T00:00:00Z',
        effectiveEnd: '2026-12-31T23:59:59Z',
        status: '已下架',
        delistingReason: '库存不足',
        createdAt: '2026-01-01T00:00:00Z',
        updatedAt: '2026-01-01T00:00:00Z',
      },
    ];
    seedStorage(existing);
    const { result } = renderHook(() => useProducts());

    act(() => {
      result.current.listProduct('P202606230001', '补货完成');
    });

    expect(result.current.products[0].status).toBe('上架中');
    expect(result.current.products[0].listingReason).toBe('补货完成');
    expect(result.current.products[0].delistingReason).toBeUndefined();
  });

  it('listProduct returns false when product is already 上架中', () => {
    const existing: Product[] = [
      {
        id: 'P202606230001',
        name: '已上架',
        type: '化肥',
        coverImage: '/a.jpg',
        detailImages: ['/b.jpg'],
        stock: 10,
        price: 100,
        effectiveStart: '2026-01-01T00:00:00Z',
        effectiveEnd: '2026-12-31T23:59:59Z',
        listingReason: '已上架',
        status: '上架中',
        createdAt: '2026-01-01T00:00:00Z',
        updatedAt: '2026-01-01T00:00:00Z',
      },
    ];
    seedStorage(existing);
    const { result } = renderHook(() => useProducts());

    let ok = true;
    act(() => {
      ok = result.current.listProduct('P202606230001', '重复上架');
    });

    expect(ok).toBe(false);
    expect(result.current.products[0].status).toBe('上架中');
  });

  it('delistProduct changes status from 上架中 to 已下架 with reason', () => {
    const existing: Product[] = [
      {
        id: 'P202606230001',
        name: '要下架',
        type: '化肥',
        coverImage: '/a.jpg',
        detailImages: ['/b.jpg'],
        stock: 10,
        price: 100,
        effectiveStart: '2026-01-01T00:00:00Z',
        effectiveEnd: '2026-12-31T23:59:59Z',
        listingReason: '已上架',
        status: '上架中',
        createdAt: '2026-01-01T00:00:00Z',
        updatedAt: '2026-01-01T00:00:00Z',
      },
    ];
    seedStorage(existing);
    const { result } = renderHook(() => useProducts());

    act(() => {
      result.current.delistProduct('P202606230001', '库存售罄');
    });

    expect(result.current.products[0].status).toBe('已下架');
    expect(result.current.products[0].delistingReason).toBe('库存售罄');
    expect(result.current.products[0].listingReason).toBeUndefined();
  });

  it('delistProduct returns false when product is not 上架中', () => {
    const existing: Product[] = [
      {
        id: 'P202606230001',
        name: '草稿商品',
        type: '化肥',
        coverImage: '/a.jpg',
        detailImages: ['/b.jpg'],
        stock: 10,
        price: 100,
        effectiveStart: '2026-01-01T00:00:00Z',
        effectiveEnd: '2026-12-31T23:59:59Z',
        status: '草稿',
        createdAt: '2026-01-01T00:00:00Z',
        updatedAt: '2026-01-01T00:00:00Z',
      },
    ];
    seedStorage(existing);
    const { result } = renderHook(() => useProducts());

    let ok = true;
    act(() => {
      ok = result.current.delistProduct('P202606230001', '下架草稿');
    });

    expect(ok).toBe(false);
    expect(result.current.products[0].status).toBe('草稿');
  });

  // --- 持久化 ---

  it('persists to localStorage after addProduct', () => {
    const { result } = renderHook(() => useProducts());

    act(() => {
      result.current.addProduct({
        name: '持久化测试',
        type: '服务',
        coverImage: '/x.jpg',
        detailImages: ['/y.jpg'],
        stock: 1,
        price: 10,
        effectiveStart: '2026-01-01T00:00:00Z',
        effectiveEnd: '2026-12-31T23:59:59Z',
      });
    });

    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY)!);
    expect(stored).toHaveLength(1);
    expect(stored[0].name).toBe('持久化测试');
  });

  it('persists to localStorage after deleteProduct', () => {
    const existing: Product[] = [
      {
        id: 'P202606230001',
        name: '删除测试',
        type: '化肥',
        coverImage: '/a.jpg',
        detailImages: ['/b.jpg'],
        stock: 10,
        price: 100,
        effectiveStart: '2026-01-01T00:00:00Z',
        effectiveEnd: '2026-12-31T23:59:59Z',
        status: '草稿',
        createdAt: '2026-01-01T00:00:00Z',
        updatedAt: '2026-01-01T00:00:00Z',
      },
      {
        id: 'P202606230002',
        name: '保留商品',
        type: '农药',
        coverImage: '/c.jpg',
        detailImages: ['/d.jpg'],
        stock: 5,
        price: 50,
        effectiveStart: '2026-01-01T00:00:00Z',
        effectiveEnd: '2026-12-31T23:59:59Z',
        status: '草稿',
        createdAt: '2026-01-01T00:00:00Z',
        updatedAt: '2026-01-01T00:00:00Z',
      },
    ];
    seedStorage(existing);
    const { result } = renderHook(() => useProducts());

    act(() => {
      result.current.deleteProduct('P202606230001');
    });

    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY)!);
    expect(stored).toHaveLength(1);
    expect(stored[0].id).toBe('P202606230002');
  });
});
