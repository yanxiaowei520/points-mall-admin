import { useState, useCallback, useEffect, useRef } from 'react';
import type { Product, ProductType, ProductStatus } from '../types/product';
import { generateId } from '../utils/generateId';

const STORAGE_KEY = 'points_mall_products';

export interface AddProductInput {
  name: string;
  type: ProductType;
  coverImage: string;
  detailImages: string[];
  stock: number;
  price: number;
  effectiveStart: string;
  effectiveEnd: string;
  description?: string;
}

function loadProducts(): Product[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveProducts(products: Product[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(products));
}

export function useProducts() {
  const [products, setProducts] = useState<Product[]>(loadProducts);
  const isFirstRender = useRef(true);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    saveProducts(products);
  }, [products]);

  const addProduct = useCallback((data: AddProductInput): Product => {
    const now = new Date().toISOString();
    let newProduct: Product;

    setProducts(prev => {
      const id = generateId(prev);
      newProduct = {
        id,
        name: data.name,
        type: data.type,
        coverImage: data.coverImage,
        detailImages: data.detailImages,
        stock: data.stock,
        price: data.price,
        effectiveStart: data.effectiveStart,
        effectiveEnd: data.effectiveEnd,
        description: data.description,
        status: '草稿' as ProductStatus,
        createdAt: now,
        updatedAt: now,
      };
      return [...prev, newProduct];
    });

    return newProduct!;
  }, []);

  const updateProduct = useCallback((id: string, data: Partial<AddProductInput>): Product | null => {
    let result: Product | null = null;

    setProducts(prev => {
      const idx = prev.findIndex(p => p.id === id);
      if (idx === -1) return prev;
      if (prev[idx].status === '上架中') {
        result = null;
        return prev;
      }
      const updated = {
        ...prev[idx],
        ...data,
        updatedAt: new Date().toISOString(),
      };
      result = updated;
      return [...prev.slice(0, idx), updated, ...prev.slice(idx + 1)];
    });

    return result;
  }, []);

  const deleteProduct = useCallback((id: string): boolean => {
    let deleted = false;

    setProducts(prev => {
      const product = prev.find(p => p.id === id);
      if (!product || product.status === '上架中') {
        deleted = false;
        return prev;
      }
      deleted = true;
      return prev.filter(p => p.id !== id);
    });

    return deleted;
  }, []);

  const listProduct = useCallback((id: string, reason: string): boolean => {
    let ok = false;

    setProducts(prev => {
      const idx = prev.findIndex(p => p.id === id);
      if (idx === -1) return prev;
      if (prev[idx].status === '上架中') {
        ok = false;
        return prev;
      }
      ok = true;
      const updated: Product = {
        ...prev[idx],
        status: '上架中' as ProductStatus,
        listingReason: reason,
        delistingReason: undefined,
        updatedAt: new Date().toISOString(),
      };
      return [...prev.slice(0, idx), updated, ...prev.slice(idx + 1)];
    });

    return ok;
  }, []);

  const delistProduct = useCallback((id: string, reason: string): boolean => {
    let ok = false;

    setProducts(prev => {
      const idx = prev.findIndex(p => p.id === id);
      if (idx === -1) return prev;
      if (prev[idx].status !== '上架中') {
        ok = false;
        return prev;
      }
      ok = true;
      const updated: Product = {
        ...prev[idx],
        status: '已下架' as ProductStatus,
        delistingReason: reason,
        listingReason: undefined,
        updatedAt: new Date().toISOString(),
      };
      return [...prev.slice(0, idx), updated, ...prev.slice(idx + 1)];
    });

    return ok;
  }, []);

  const getProduct = useCallback((id: string): Product | undefined => {
    return products.find(p => p.id === id);
  }, [products]);

  return {
    products,
    addProduct,
    updateProduct,
    deleteProduct,
    listProduct,
    delistProduct,
    getProduct,
  };
}
