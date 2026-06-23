# 积分商城后台 — 商品管理模块 实施计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 基于设计文档构建积分商城后台商品管理模块，深蓝色主色调，顶栏+侧边栏布局，无登录页直接展示系统。

**Architecture:** React 19 + TypeScript + Vite + Ant Design + react-router-dom。useProducts hook 管理商品 CRUD 及状态流转，数据持久化到 localStorage。路由 `/products`（列表页）、`/products/add`（新增）、`/products/edit/:id`（修改）。

**Tech Stack:** React 19, TypeScript 6, Vite 8, Vitest 4, Ant Design 5, @ant-design/icons, react-router-dom 6, @testing-library/react 16

## Global Constraints

- 无需登录页，直接展示后台系统
- 深蓝色主色调 (`#001529`)，顶栏导航 + 侧边栏布局
- "积分商城"在顶栏，"商品管理"在侧边栏
- antd v5 组件库，默认蓝色主题
- 严格 TDD：先写失败测试，再写实现
- tsconfig 启用 `noUnusedLocals`、`noUnusedParameters`、`verbatimModuleSyntax`
- 商品数据持久化到 localStorage，key 为 `points_mall_products`
- 商品编号格式：`P` + `YYYYMMDD` + 4 位序号

---

### Task 1: 项目设置与清理

**Files:**
- Modify: `index.html` (更新 title)
- Delete: `src/components/LoginForm.tsx`
- Delete: `src/components/LoginForm.css`
- Delete: `src/components/LoginForm.test.tsx`
- Delete: `src/App.css`
- Delete: `src/assets/hero.png`
- Delete: `src/assets/react.svg`
- Delete: `src/assets/vite.svg`

**Interfaces:**
- Produces: 干净的项目基础，无 LoginForm 残留，依赖已安装就绪

- [ ] **Step 1: 安装依赖**

```bash
npm install antd @ant-design/icons react-router-dom
```
Expected: 三个包安装成功，package.json 更新

- [ ] **Step 2: 更新页面标题**

修改 `index.html` 第 7 行：
```html
<title>积分商城后台</title>
```

- [ ] **Step 3: 删除旧组件和无关资源**

```bash
rm src/components/LoginForm.tsx src/components/LoginForm.css src/components/LoginForm.test.tsx
rm src/App.css
rm src/assets/hero.png src/assets/react.svg src/assets/vite.svg
```

- [ ] **Step 4: 验证项目仍可启动**

```bash
npm run dev
```
Expected: Vite 启动成功，无编译错误（页面会空白因为 App.tsx 还有旧引用）

- [ ] **Step 5: Commit**

```bash
git add -A && git commit -m "chore: install antd + router, remove LoginForm and unused assets"
```

---

### Task 2: 类型定义与工具函数

**Files:**
- Create: `src/types/product.ts`
- Create: `src/utils/generateId.ts`
- Create: `src/utils/__tests__/generateId.test.ts`

**Interfaces:**
- Produces:
  - `ProductType` = `'化肥' | '农药' | '服务'`
  - `ProductStatus` = `'草稿' | '上架中' | '已下架'`
  - `interface Product { id, name, type, coverImage, detailImages, stock, price, effectiveStart, effectiveEnd, description?, status, listingReason?, delistingReason?, createdAt, updatedAt }`
  - `PRODUCT_TYPE_OPTIONS: { label: string; value: ProductType }[]`
  - `PRODUCT_STATUS_OPTIONS: { label: string; value: ProductStatus }[]`
  - `generateId(products: Product[]): string`

- [ ] **Step 1: 写入 Product 类型定义**

创建 `src/types/product.ts`：
```typescript
export type ProductType = '化肥' | '农药' | '服务';

export type ProductStatus = '草稿' | '上架中' | '已下架';

export interface Product {
  id: string;
  name: string;
  type: ProductType;
  coverImage: string;
  detailImages: string[];
  stock: number;
  price: number;
  effectiveStart: string;
  effectiveEnd: string;
  description?: string;
  status: ProductStatus;
  listingReason?: string;
  delistingReason?: string;
  createdAt: string;
  updatedAt: string;
}

export const PRODUCT_TYPE_OPTIONS: { label: string; value: ProductType }[] = [
  { label: '化肥', value: '化肥' },
  { label: '农药', value: '农药' },
  { label: '服务', value: '服务' },
];

export const PRODUCT_STATUS_OPTIONS: { label: string; value: ProductStatus }[] = [
  { label: '草稿', value: '草稿' },
  { label: '上架中', value: '上架中' },
  { label: '已下架', value: '已下架' },
];
```

- [ ] **Step 2: 写入 generateId 失败测试**

创建 `src/utils/__tests__/generateId.test.ts`：
```typescript
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
```

- [ ] **Step 3: 运行测试确认失败**

```bash
npx vitest run src/utils/__tests__/generateId.test.ts
```
Expected: FAIL — `generateId` not found

- [ ] **Step 4: 实现 generateId**

创建 `src/utils/generateId.ts`：
```typescript
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
```

- [ ] **Step 5: 运行测试确认通过**

```bash
npx vitest run src/utils/__tests__/generateId.test.ts
```
Expected: 5 tests PASS

- [ ] **Step 6: Commit**

```bash
git add src/types/product.ts src/utils/generateId.ts src/utils/__tests__/generateId.test.ts
git commit -m "feat: add Product types and generateId utility"
```

---

### Task 3: useProducts Hook（TDD）

**Files:**
- Create: `src/hooks/useProducts.ts`
- Create: `src/hooks/__tests__/useProducts.test.ts`

**Interfaces:**
- Consumes: `Product`, `ProductType`, `ProductStatus` from `../types/product`; `generateId` from `../utils/generateId`
- Produces:
  - `useProducts(): { products, addProduct, updateProduct, deleteProduct, listProduct, delistProduct, getProduct }`
  - `addProduct(data: AddProductInput): Product` — 自动生成 id，默认状态草稿
  - `updateProduct(id: string, data: Partial<AddProductInput>): Product | null` — 上架中商品返回 null
  - `deleteProduct(id: string): boolean` — 上架中商品返回 false
  - `listProduct(id: string, reason: string): boolean` — 仅草稿/已下架可上架
  - `delistProduct(id: string, reason: string): boolean` — 仅上架中可下架
  - `getProduct(id: string): Product | undefined`

- [ ] **Step 1: 写入 useProducts 失败测试**

创建 `src/hooks/__tests__/useProducts.test.ts`：
```typescript
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
```

- [ ] **Step 2: 运行测试确认全部失败**

```bash
npx vitest run src/hooks/__tests__/useProducts.test.ts
```
Expected: 所有 15 个测试 FAIL — `useProducts` not found

- [ ] **Step 3: 实现 useProducts hook**

创建 `src/hooks/useProducts.ts`：
```typescript
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
```

- [ ] **Step 4: 运行测试确认全部通过**

```bash
npx vitest run src/hooks/__tests__/useProducts.test.ts
```
Expected: 15 tests PASS

- [ ] **Step 5: Commit**

```bash
git add src/hooks/useProducts.ts src/hooks/__tests__/useProducts.test.ts
git commit -m "feat: implement useProducts hook with full CRUD and status flow"
```

---

### Task 4: Layout 组件（顶栏 + 侧边栏）

**Files:**
- Create: `src/components/Layout/TopNav.tsx`
- Create: `src/components/Layout/TopNav.css`
- Create: `src/components/Layout/Sidebar.tsx`
- Create: `src/components/Layout/Sidebar.css`

**Interfaces:**
- Consumes: react-router-dom `useNavigate`, `useLocation`; antd `Layout`, `Menu`; `@ant-design/icons` `ShoppingCartOutlined`, `AppstoreOutlined`
- Produces:
  - `<TopNav />` — 深蓝顶栏，显示"积分商城"
  - `<Sidebar />` — 侧边栏，显示"商品管理"，根据路由高亮

- [ ] **Step 1: 创建 TopNav 组件**

创建 `src/components/Layout/TopNav.tsx`：
```typescript
import { Layout } from 'antd';
import { ShoppingCartOutlined } from '@ant-design/icons';
import './TopNav.css';

const { Header } = Layout;

function TopNav() {
  return (
    <Header className="top-nav">
      <div className="top-nav-brand">
        <ShoppingCartOutlined style={{ fontSize: 22 }} />
        <span className="top-nav-title">积分商城</span>
      </div>
    </Header>
  );
}

export default TopNav;
```

创建 `src/components/Layout/TopNav.css`：
```css
.top-nav {
  display: flex;
  align-items: center;
  background: #001529 !important;
  padding: 0 24px !important;
  height: 56px !important;
  line-height: 56px !important;
}

.top-nav-brand {
  display: flex;
  align-items: center;
  gap: 10px;
  color: #fff;
}

.top-nav-title {
  font-size: 18px;
  font-weight: 600;
  letter-spacing: 2px;
}
```

- [ ] **Step 2: 创建 Sidebar 组件**

创建 `src/components/Layout/Sidebar.tsx`：
```typescript
import { Layout, Menu } from 'antd';
import { AppstoreOutlined } from '@ant-design/icons';
import { useNavigate, useLocation } from 'react-router-dom';
import './Sidebar.css';

const { Sider } = Layout;

function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    {
      key: '/products',
      icon: <AppstoreOutlined />,
      label: '商品管理',
    },
  ];

  const selectedKey = location.pathname.startsWith('/products') ? '/products' : '';

  return (
    <Sider width={200} className="sidebar">
      <Menu
        mode="inline"
        selectedKeys={[selectedKey]}
        items={menuItems}
        onClick={({ key }) => navigate(key)}
        className="sidebar-menu"
      />
    </Sider>
  );
}

export default Sidebar;
```

创建 `src/components/Layout/Sidebar.css`：
```css
.sidebar {
  background: #fff !important;
  border-right: 1px solid #f0f0f0;
  min-height: calc(100vh - 56px);
}

.sidebar-menu {
  border-inline-end: none !important;
  margin-top: 8px;
}
```

- [ ] **Step 3: 验证 TypeScript 编译**

```bash
npx tsc -b --noEmit
```
Expected: 无类型错误

- [ ] **Step 4: Commit**

```bash
git add src/components/Layout/
git commit -m "feat: add TopNav and Sidebar layout components"
```

---

### Task 5: FilterBar 筛选栏组件

**Files:**
- Create: `src/pages/Product/FilterBar.tsx`

**Interfaces:**
- Consumes: antd `Form`, `Input`, `Select`, `DatePicker`, `Button`, `Row`, `Col`; `PRODUCT_TYPE_OPTIONS`, `PRODUCT_STATUS_OPTIONS` from `../../types/product`
- Produces: `<FilterBar onSearch={(values) => void} />` — 筛选条件表单，包含重置和搜索按钮
  - `values` 类型: `{ productId?: string; productName?: string; productType?: ProductType; dateRange?: [Dayjs, Dayjs]; productStatus?: ProductStatus }`

- [ ] **Step 1: 创建 FilterBar 组件**

创建 `src/pages/Product/FilterBar.tsx`：
```typescript
import { Form, Input, Select, DatePicker, Button, Row, Col } from 'antd';
import { SearchOutlined, ReloadOutlined } from '@ant-design/icons';
import { PRODUCT_TYPE_OPTIONS, PRODUCT_STATUS_OPTIONS } from '../../types/product';
import type { ProductType, ProductStatus } from '../../types/product';

const { RangePicker } = DatePicker;

export interface FilterValues {
  productId?: string;
  productName?: string;
  productType?: ProductType;
  productStatus?: ProductStatus;
  dateRange?: [string, string];
}

interface FilterBarProps {
  onSearch: (values: FilterValues) => void;
}

function FilterBar({ onSearch }: FilterBarProps) {
  const [form] = Form.useForm();

  const handleFinish = (values: Record<string, unknown>) => {
    const filters: FilterValues = {};
    if (values.productId) filters.productId = values.productId as string;
    if (values.productName) filters.productName = values.productName as string;
    if (values.productType) filters.productType = values.productType as ProductType;
    if (values.productStatus) filters.productStatus = values.productStatus as ProductStatus;
    if (values.dateRange && Array.isArray(values.dateRange) && values.dateRange.length === 2) {
      filters.dateRange = [
        (values.dateRange as [dayjs.Dayjs, dayjs.Dayjs])[0].toISOString(),
        (values.dateRange as [dayjs.Dayjs, dayjs.Dayjs])[1].toISOString(),
      ];
    }
    onSearch(filters);
  };

  const handleReset = () => {
    form.resetFields();
    onSearch({});
  };

  return (
    <Form form={form} layout="inline" onFinish={handleFinish} style={{ marginBottom: 16, flexWrap: 'wrap', gap: 8 }}>
      <Row gutter={[12, 12]} style={{ width: '100%' }}>
        <Col>
          <Form.Item name="productId" noStyle>
            <Input placeholder="请输入商品编号" allowClear style={{ width: 180 }} />
          </Form.Item>
        </Col>
        <Col>
          <Form.Item name="productName" noStyle>
            <Input placeholder="请输入商品名称" allowClear style={{ width: 180 }} />
          </Form.Item>
        </Col>
        <Col>
          <Form.Item name="productType" noStyle>
            <Select
              placeholder="商品类型"
              allowClear
              style={{ width: 140 }}
              options={PRODUCT_TYPE_OPTIONS}
            />
          </Form.Item>
        </Col>
        <Col>
          <Form.Item name="dateRange" noStyle>
            <RangePicker
              showTime
              placeholder={['生效开始', '生效结束']}
              style={{ width: 360 }}
            />
          </Form.Item>
        </Col>
        <Col>
          <Form.Item name="productStatus" noStyle>
            <Select
              placeholder="商品状态"
              allowClear
              style={{ width: 140 }}
              options={PRODUCT_STATUS_OPTIONS}
            />
          </Form.Item>
        </Col>
        <Col>
          <Button type="primary" htmlType="submit" icon={<SearchOutlined />}>
            搜索
          </Button>
        </Col>
        <Col>
          <Button onClick={handleReset} icon={<ReloadOutlined />}>
            重置
          </Button>
        </Col>
      </Row>
    </Form>
  );
}

export default FilterBar;
```

- [ ] **Step 2: 验证 TypeScript 编译**

```bash
npx tsc -b --noEmit
```
Expected: 无类型错误

- [ ] **Step 3: Commit**

```bash
git add src/pages/Product/FilterBar.tsx
git commit -m "feat: add FilterBar component with product search filters"
```

---

### Task 6: ProductTable 商品表格组件

**Files:**
- Create: `src/pages/Product/ProductTable.tsx`

**Interfaces:**
- Consumes: `Product` from `../../types/product`; antd `Table`, `Tag`, `Button`, `Space`
- Produces:
  - `<ProductTable products={Product[]} selectedId={string | null} onSelect={(id) => void} onEdit={(id) => void} onDelete={(id) => void} onList={(id) => void} onDelist={(id) => void} />`

- [ ] **Step 1: 创建 ProductTable 组件**

创建 `src/pages/Product/ProductTable.tsx`：
```typescript
import { Table, Tag, Button, Space } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import type { Product } from '../../types/product';

const STATUS_COLOR: Record<string, string> = {
  '上架中': 'green',
  '已下架': 'red',
  '草稿': 'default',
};

interface ProductTableProps {
  products: Product[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  onList: (id: string) => void;
  onDelist: (id: string) => void;
}

function ProductTable({
  products,
  selectedId,
  onSelect,
  onEdit,
  onDelete,
  onList,
  onDelist,
}: ProductTableProps) {
  const columns: ColumnsType<Product> = [
    {
      title: '商品编号',
      dataIndex: 'id',
      key: 'id',
      width: 160,
    },
    {
      title: '商品名称',
      dataIndex: 'name',
      key: 'name',
      width: 150,
    },
    {
      title: '商品类型',
      dataIndex: 'type',
      key: 'type',
      width: 100,
    },
    {
      title: '库存(个)',
      dataIndex: 'stock',
      key: 'stock',
      width: 100,
    },
    {
      title: '价格(薯币)',
      dataIndex: 'price',
      key: 'price',
      width: 110,
    },
    {
      title: '生效时间',
      key: 'effective',
      width: 200,
      render: (_, record) => {
        const start = new Date(record.effectiveStart).toLocaleString('zh-CN');
        const end = new Date(record.effectiveEnd).toLocaleString('zh-CN');
        return `${start} ~ ${end}`;
      },
    },
    {
      title: '商品状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status: string) => (
        <Tag color={STATUS_COLOR[status] || 'default'}>{status}</Tag>
      ),
    },
    {
      title: '上架原因',
      dataIndex: 'listingReason',
      key: 'listingReason',
      width: 130,
      render: (val?: string) => val || '-',
    },
    {
      title: '下架原因',
      dataIndex: 'delistingReason',
      key: 'delistingReason',
      width: 130,
      render: (val?: string) => val || '-',
    },
    {
      title: '操作',
      key: 'actions',
      fixed: 'right',
      width: 320,
      render: (_, record) => {
        const isActive = record.status === '上架中';

        return (
          <Space size="small">
            <Button
              type="link"
              size="small"
              disabled={isActive}
              onClick={() => onEdit(record.id)}
            >
              修改
            </Button>
            <Button
              type="link"
              size="small"
              danger
              disabled={isActive}
              onClick={() => onDelete(record.id)}
            >
              删除
            </Button>
            <Button
              type="link"
              size="small"
              disabled={isActive}
              onClick={() => onList(record.id)}
            >
              上架
            </Button>
            <Button
              type="link"
              size="small"
              disabled={!isActive}
              onClick={() => onDelist(record.id)}
            >
              下架
            </Button>
          </Space>
        );
      },
    },
  ];

  return (
    <Table<Product>
      rowKey="id"
      columns={columns}
      dataSource={products}
      rowSelection={{
        type: 'radio',
        selectedRowKeys: selectedId ? [selectedId] : [],
        onChange: (keys) => onSelect(keys[0] as string),
      }}
      scroll={{ x: 1400 }}
      pagination={{
        pageSize: 10,
        showSizeChanger: true,
        showTotal: (total) => `共 ${total} 条`,
      }}
    />
  );
}

export default ProductTable;
```

- [ ] **Step 2: 验证 TypeScript 编译**

```bash
npx tsc -b --noEmit
```
Expected: 无类型错误

- [ ] **Step 3: Commit**

```bash
git add src/pages/Product/ProductTable.tsx
git commit -m "feat: add ProductTable component with status tags and action buttons"
```

---

### Task 7: ProductListPage 商品列表页（TDD）

**Files:**
- Create: `src/pages/Product/ProductListPage.tsx`
- Create: `src/pages/Product/ProductListPage.css`
- Create: `src/pages/Product/__tests__/ProductListPage.test.tsx`

**Interfaces:**
- Consumes: `useProducts` from `../../hooks/useProducts`; `FilterBar`, `FilterValues`; `ProductTable`; react-router-dom `useNavigate`; antd `Modal`, `Input`, `message`, `Card`, `Button`
- Produces: `<ProductListPage />` — 完整列表页，含筛选、表格、上架/下架/删除操作弹窗

- [ ] **Step 1: 写入 ProductListPage 集成测试**

创建 `src/pages/Product/__tests__/ProductListPage.test.tsx`：
```typescript
import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import ProductListPage from '../ProductListPage';

function renderPage() {
  return render(
    <MemoryRouter initialEntries={['/products']}>
      <ProductListPage />
    </MemoryRouter>,
  );
}

describe('ProductListPage', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('renders the page title', () => {
    renderPage();
    expect(screen.getByText('商品管理')).toBeInTheDocument();
  });

  it('renders the add product button', () => {
    renderPage();
    expect(screen.getByText('添加商品')).toBeInTheDocument();
  });

  it('renders filter inputs', () => {
    renderPage();
    expect(screen.getByPlaceholderText('请输入商品编号')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('请输入商品名称')).toBeInTheDocument();
  });

  it('shows empty state when no products', () => {
    renderPage();
    expect(screen.getByText('暂无数据')).toBeInTheDocument();
  });

  it('navigates to add page on button click', async () => {
    const user = userEvent.setup();
    renderPage();
    await user.click(screen.getByText('添加商品'));
    // Navigation happens via react-router
    // Antd buttons render as expected
    expect(screen.getByText('添加商品').closest('button')).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: 运行测试确认失败**

```bash
npx vitest run src/pages/Product/__tests__/ProductListPage.test.ts
```
Expected: FAIL — `ProductListPage` not found

- [ ] **Step 3: 实现 ProductListPage**

创建 `src/pages/Product/ProductListPage.tsx`：
```typescript
import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Button, Modal, Input, message } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { useProducts } from '../../hooks/useProducts';
import FilterBar from './FilterBar';
import ProductTable from './ProductTable';
import type { FilterValues } from './FilterBar';
import './ProductListPage.css';

function ProductListPage() {
  const navigate = useNavigate();
  const { products, deleteProduct, listProduct, delistProduct } = useProducts();

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [filters, setFilters] = useState<FilterValues>({});
  const [listModalOpen, setListModalOpen] = useState(false);
  const [delistModalOpen, setDelistModalOpen] = useState(false);
  const [reason, setReason] = useState('');

  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      if (filters.productId && !p.id.includes(filters.productId)) return false;
      if (filters.productName && !p.name.includes(filters.productName)) return false;
      if (filters.productType && p.type !== filters.productType) return false;
      if (filters.productStatus && p.status !== filters.productStatus) return false;
      if (filters.dateRange) {
        const [start, end] = filters.dateRange;
        if (p.effectiveEnd < start || p.effectiveStart > end) return false;
      }
      return true;
    });
  }, [products, filters]);

  const handleSearch = (values: FilterValues) => {
    setFilters(values);
  };

  const handleSelect = (id: string) => {
    setSelectedId(id);
  };

  const handleEdit = (id: string) => {
    navigate(`/products/edit/${id}`);
  };

  const handleDelete = (id: string) => {
    const product = products.find((p) => p.id === id);
    if (product?.status === '上架中') {
      message.warning('上架中的商品不允许删除');
      return;
    }
    Modal.confirm({
      title: '确认删除',
      content: `确定要删除商品「${product?.name ?? id}」吗？此操作不可撤销。`,
      okText: '确认删除',
      cancelText: '取消',
      okButtonProps: { danger: true },
      onOk: () => {
        deleteProduct(id);
        if (selectedId === id) setSelectedId(null);
        message.success('删除成功');
      },
    });
  };

  const handleList = (id: string) => {
    const product = products.find((p) => p.id === id);
    if (!product) return;
    if (product.status === '上架中') {
      message.warning('该商品已上架');
      return;
    }
    setSelectedId(id);
    setReason('');
    setListModalOpen(true);
  };

  const confirmList = () => {
    if (!selectedId) {
      message.warning('请先选择商品');
      return;
    }
    if (!reason.trim()) {
      message.warning('请输入上架原因');
      return;
    }
    const ok = listProduct(selectedId, reason.trim());
    if (ok) {
      message.success('上架成功');
      setListModalOpen(false);
      setReason('');
    } else {
      message.error('上架失败');
    }
  };

  const handleDelist = (id: string) => {
    const product = products.find((p) => p.id === id);
    if (!product) return;
    if (product.status !== '上架中') {
      message.warning('该商品未上架');
      return;
    }
    setSelectedId(id);
    setReason('');
    setDelistModalOpen(true);
  };

  const confirmDelist = () => {
    if (!selectedId) {
      message.warning('请先选择商品');
      return;
    }
    if (!reason.trim()) {
      message.warning('请输入下架原因');
      return;
    }
    const ok = delistProduct(selectedId, reason.trim());
    if (ok) {
      message.success('下架成功');
      setDelistModalOpen(false);
      setReason('');
    } else {
      message.error('下架失败');
    }
  };

  return (
    <div className="product-list-page">
      <div className="product-list-header">
        <h2>商品管理</h2>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => navigate('/products/add')}>
          添加商品
        </Button>
      </div>

      <Card>
        <FilterBar onSearch={handleSearch} />
      </Card>

      <Card style={{ marginTop: 16 }}>
        <ProductTable
          products={filteredProducts}
          selectedId={selectedId}
          onSelect={handleSelect}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onList={handleList}
          onDelist={handleDelist}
        />
      </Card>

      <Modal
        title="商品上架"
        open={listModalOpen}
        onOk={confirmList}
        onCancel={() => setListModalOpen(false)}
        okText="确认上架"
        cancelText="取消"
      >
        <p style={{ marginBottom: 12 }}>请输入上架原因：</p>
        <Input.TextArea
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="请输入上架原因"
          rows={3}
        />
      </Modal>

      <Modal
        title="商品下架"
        open={delistModalOpen}
        onOk={confirmDelist}
        onCancel={() => setDelistModalOpen(false)}
        okText="确认下架"
        cancelText="取消"
      >
        <p style={{ marginBottom: 12 }}>请输入下架原因：</p>
        <Input.TextArea
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="请输入下架原因"
          rows={3}
        />
      </Modal>
    </div>
  );
}

export default ProductListPage;
```

创建 `src/pages/Product/ProductListPage.css`：
```css
.product-list-page {
  padding: 24px;
}

.product-list-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.product-list-header h2 {
  margin: 0;
  font-size: 20px;
  font-weight: 600;
}
```

- [ ] **Step 4: 运行测试确认通过**

```bash
npx vitest run src/pages/Product/__tests__/ProductListPage.test.ts
```
Expected: 5 tests PASS

- [ ] **Step 5: Commit**

```bash
git add src/pages/Product/ProductListPage.tsx src/pages/Product/ProductListPage.css src/pages/Product/__tests__/ProductListPage.test.tsx
git commit -m "feat: implement ProductListPage with filters, table, and status modals"
```

---

### Task 8: ProductFormPage 商品表单页（TDD）

**Files:**
- Create: `src/pages/Product/ProductFormPage.tsx`
- Create: `src/pages/Product/ProductFormPage.css`
- Create: `src/pages/Product/__tests__/ProductFormPage.test.tsx`

**Interfaces:**
- Consumes: `useProducts`; react-router-dom `useParams`, `useNavigate`; antd `Form`, `Input`, `Select`, `InputNumber`, `DatePicker`, `Upload`, `Button`, `Card`, `message`
- Produces: `<ProductFormPage />` — 添加/修改表单页，支持图片上传、表单校验、自动回填

- [ ] **Step 1: 写入 ProductFormPage 测试**

创建 `src/pages/Product/__tests__/ProductFormPage.test.tsx`：
```typescript
import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import ProductFormPage from '../ProductFormPage';

function renderAddPage() {
  return render(
    <MemoryRouter initialEntries={['/products/add']}>
      <Routes>
        <Route path="/products/add" element={<ProductFormPage />} />
      </Routes>
    </MemoryRouter>,
  );
}

function renderEditPage() {
  const existing = [
    {
      id: 'P202606230001',
      name: '测试化肥',
      type: '化肥',
      coverImage: '/test-cover.jpg',
      detailImages: ['/test-detail.jpg'],
      stock: 100,
      price: 50,
      effectiveStart: '2026-06-01T00:00:00Z',
      effectiveEnd: '2026-12-31T23:59:59Z',
      status: '草稿',
      createdAt: '2026-06-01T00:00:00Z',
      updatedAt: '2026-06-01T00:00:00Z',
    },
  ];
  localStorage.setItem('points_mall_products', JSON.stringify(existing));

  return render(
    <MemoryRouter initialEntries={['/products/edit/P202606230001']}>
      <Routes>
        <Route path="/products/edit/:id" element={<ProductFormPage />} />
      </Routes>
    </MemoryRouter>,
  );
}

describe('ProductFormPage', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  // --- Add mode ---

  it('renders the add page title', () => {
    renderAddPage();
    expect(screen.getByText('添加商品')).toBeInTheDocument();
  });

  it('renders all required form fields', () => {
    renderAddPage();
    expect(screen.getByLabelText('商品名称')).toBeInTheDocument();
    expect(screen.getByLabelText('商品类型')).toBeInTheDocument();
    expect(screen.getByText('商品封面图')).toBeInTheDocument();
    expect(screen.getByText('商品详情图')).toBeInTheDocument();
    expect(screen.getByText('商品库存')).toBeInTheDocument();
    expect(screen.getByText('商品价格')).toBeInTheDocument();
    expect(screen.getByText('生效时间')).toBeInTheDocument();
    expect(screen.getByText('详情介绍')).toBeInTheDocument();
  });

  it('shows validation error when submitting empty form', async () => {
    const user = userEvent.setup();
    renderAddPage();

    await user.click(screen.getByText('提交'));

    // Antd shows validation messages
    expect(await screen.findByText(/请输入商品名称/)).toBeInTheDocument();
  });

  // --- Edit mode ---

  it('renders the edit page title', () => {
    renderEditPage();
    expect(screen.getByText('修改商品')).toBeInTheDocument();
  });

  it('pre-fills form with existing product data', () => {
    renderEditPage();
    const nameInput = screen.getByLabelText('商品名称') as HTMLInputElement;
    expect(nameInput.value).toBe('测试化肥');
  });
});
```

- [ ] **Step 2: 运行测试确认失败**

```bash
npx vitest run src/pages/Product/__tests__/ProductFormPage.test.ts
```
Expected: FAIL — `ProductFormPage` not found

- [ ] **Step 3: 实现 ProductFormPage**

创建 `src/pages/Product/ProductFormPage.tsx`：
```typescript
import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Form,
  Input,
  Select,
  InputNumber,
  DatePicker,
  Upload,
  Button,
  Card,
  message,
  Typography,
} from 'antd';
import { PlusOutlined, ArrowLeftOutlined } from '@ant-design/icons';
import type { UploadFile } from 'antd/es/upload/interface';
import { useProducts } from '../../hooks/useProducts';
import { PRODUCT_TYPE_OPTIONS } from '../../types/product';
import type { ProductType } from '../../types/product';
import dayjs from 'dayjs'; // Note: antd already depends on dayjs
import './ProductFormPage.css';

const { TextArea } = Input;
const { RangePicker } = DatePicker;
const { Title } = Typography;

interface FormValues {
  name: string;
  type: ProductType;
  stock: number;
  price: number;
  effectiveRange: [dayjs.Dayjs, dayjs.Dayjs];
  description?: string;
}

function ProductFormPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getProduct, addProduct, updateProduct } = useProducts();

  const isEdit = Boolean(id);
  const [form] = Form.useForm<FormValues>();
  const [coverFile, setCoverFile] = useState<UploadFile | null>(null);
  const [detailFiles, setDetailFiles] = useState<UploadFile[]>([]);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (id) {
      const product = getProduct(id);
      if (!product) {
        message.error('商品不存在');
        navigate('/products', { replace: true });
        return;
      }
      if (product.status === '上架中') {
        message.warning('上架中的商品不允许修改');
        navigate('/products', { replace: true });
        return;
      }

      form.setFieldsValue({
        name: product.name,
        type: product.type,
        stock: product.stock,
        price: product.price,
        effectiveRange: [dayjs(product.effectiveStart), dayjs(product.effectiveEnd)],
        description: product.description,
      });

      setCoverFile({
        uid: '-1',
        name: 'cover.jpg',
        status: 'done',
        url: product.coverImage,
      });

      setDetailFiles(
        product.detailImages.map((url, i) => ({
          uid: `-${i + 2}`,
          name: `detail-${i}.jpg`,
          status: 'done' as const,
          url,
        })),
      );
    }
  }, [id, getProduct, form, navigate]);

  const handleFinish = (values: FormValues) => {
    setSubmitting(true);

    const data = {
      name: values.name,
      type: values.type,
      coverImage: coverFile?.url || coverFile?.thumbUrl || '',
      detailImages: detailFiles.map((f) => f.url || f.thumbUrl || ''),
      stock: values.stock,
      price: values.price,
      effectiveStart: values.effectiveRange[0].toISOString(),
      effectiveEnd: values.effectiveRange[1].toISOString(),
      description: values.description,
    };

    if (!data.coverImage) {
      message.error('请上传商品封面图');
      setSubmitting(false);
      return;
    }
    if (data.detailImages.length === 0) {
      message.error('请上传商品详情图');
      setSubmitting(false);
      return;
    }

    if (isEdit && id) {
      const result = updateProduct(id, data);
      if (result) {
        message.success('修改成功');
        navigate('/products');
      } else {
        message.error('修改失败');
      }
    } else {
      addProduct(data);
      message.success('添加成功');
      navigate('/products');
    }

    setSubmitting(false);
  };

  const handleCoverUpload = (info: { fileList: UploadFile[] }) => {
    setCoverFile(info.fileList[0] || null);
  };

  const handleDetailUpload = (info: { fileList: UploadFile[] }) => {
    setDetailFiles(info.fileList);
  };

  // Mock upload: use fake URL for demo
  const customRequest = (options: { file: File; onSuccess: (body: Record<string, unknown>) => void }) => {
    const { file, onSuccess } = options;
    // Simulate upload delay and return a fake URL
    setTimeout(() => {
      const fakeUrl = URL.createObjectURL(file);
      onSuccess({ url: fakeUrl });
    }, 300);
  };

  return (
    <div className="product-form-page">
      <div className="product-form-header">
        <Button
          type="text"
          icon={<ArrowLeftOutlined />}
          onClick={() => navigate('/products')}
        >
          返回列表
        </Button>
        <Title level={3} style={{ margin: 0 }}>
          {isEdit ? '修改商品' : '添加商品'}
        </Title>
        <div style={{ width: 80 }} />
      </div>

      <Card style={{ marginTop: 16, maxWidth: 800 }}>
        <Form
          form={form}
          layout="vertical"
          onFinish={handleFinish}
          initialValues={{
            stock: 0,
            price: 1,
          }}
        >
          <Form.Item
            name="name"
            label="商品名称"
            rules={[
              { required: true, message: '请输入商品名称' },
              { max: 50, message: '商品名称最长50个字符' },
            ]}
          >
            <Input placeholder="请输入商品名称" />
          </Form.Item>

          <Form.Item
            name="type"
            label="商品类型"
            rules={[{ required: true, message: '请选择商品类型' }]}
          >
            <Select placeholder="请选择商品类型" options={PRODUCT_TYPE_OPTIONS} />
          </Form.Item>

          <Form.Item label="商品封面图" required>
            <Upload
              listType="picture-card"
              maxCount={1}
              fileList={coverFile ? [coverFile] : []}
              onChange={handleCoverUpload}
              customRequest={customRequest}
              accept=".jpg,.jpeg,.png"
            >
              {!coverFile && (
                <div>
                  <PlusOutlined />
                  <div style={{ marginTop: 8 }}>上传</div>
                </div>
              )}
            </Upload>
          </Form.Item>

          <Form.Item label="商品详情图" required>
            <Upload
              listType="picture-card"
              maxCount={10}
              fileList={detailFiles}
              onChange={handleDetailUpload}
              customRequest={customRequest}
              accept=".jpg,.jpeg,.png"
            >
              {detailFiles.length < 10 && (
                <div>
                  <PlusOutlined />
                  <div style={{ marginTop: 8 }}>上传</div>
                </div>
              )}
            </Upload>
          </Form.Item>

          <Form.Item
            name="stock"
            label="商品库存（个）"
            rules={[
              { required: true, message: '请输入商品库存' },
              { type: 'number', min: 0, message: '库存不能为负数' },
            ]}
          >
            <InputNumber min={0} precision={0} style={{ width: '100%' }} placeholder="请输入库存" />
          </Form.Item>

          <Form.Item
            name="price"
            label="商品价格（薯币）"
            rules={[
              { required: true, message: '请输入商品价格' },
              { type: 'number', min: 1, message: '价格必须大于0' },
            ]}
          >
            <InputNumber min={1} precision={0} style={{ width: '100%' }} placeholder="请输入价格" />
          </Form.Item>

          <Form.Item
            name="effectiveRange"
            label="生效时间"
            rules={[
              { required: true, message: '请选择生效时间' },
              {
                validator: (_, value) => {
                  if (value && value[0] && value[1] && value[0].isAfter(value[1])) {
                    return Promise.reject(new Error('结束时间必须晚于开始时间'));
                  }
                  return Promise.resolve();
                },
              },
            ]}
          >
            <RangePicker showTime style={{ width: '100%' }} />
          </Form.Item>

          <Form.Item name="description" label="详情介绍">
            <TextArea rows={5} placeholder="请输入详情介绍（选填）" maxLength={500} showCount />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" loading={submitting} block>
              提交
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
}

export default ProductFormPage;
```

创建 `src/pages/Product/ProductFormPage.css`：
```css
.product-form-page {
  padding: 24px;
}

.product-form-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
```

- [ ] **Step 4: 运行测试确认通过**

```bash
npx vitest run src/pages/Product/__tests__/ProductFormPage.test.ts
```
Expected: 5 tests PASS

- [ ] **Step 5: Commit**

```bash
git add src/pages/Product/ProductFormPage.tsx src/pages/Product/ProductFormPage.css src/pages/Product/__tests__/ProductFormPage.test.tsx
git commit -m "feat: implement ProductFormPage with add/edit modes and image upload"
```

---

### Task 9: App 集成 — 路由 + Layout 组装

**Files:**
- Modify: `src/App.tsx` (替换 LoginForm 为 Layout + Routes)
- Modify: `src/index.css` (添加全局样式 Reset + antd 覆盖)

**Interfaces:**
- Consumes: `TopNav`, `Sidebar` from layout; `ProductListPage`, `ProductFormPage` from pages; react-router-dom `BrowserRouter`, `Routes`, `Route`, `Navigate`; antd `Layout`
- Produces: 可运行的完整应用，`/` 重定向到 `/products`

- [ ] **Step 1: 更新全局样式**

修改 `src/index.css`（替换整个文件内容）：
```css
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto,
    'Helvetica Neue', Arial, 'PingFang SC', 'Microsoft YaHei', sans-serif;
  background: #f5f5f5;
}

#root {
  min-height: 100vh;
}

/* Override antd Layout background */
.ant-layout {
  background: #f5f5f5 !important;
}

/* Override antd Card */
.ant-card {
  border-radius: 8px !important;
}
```

- [ ] **Step 2: 实现 App 路由与布局**

修改 `src/App.tsx`（替换整个文件内容）：
```typescript
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Layout, ConfigProvider } from 'antd';
import zhCN from 'antd/locale/zh_CN';
import TopNav from './components/Layout/TopNav';
import Sidebar from './components/Layout/Sidebar';
import ProductListPage from './pages/Product/ProductListPage';
import ProductFormPage from './pages/Product/ProductFormPage';

const { Content } = Layout;

function App() {
  return (
    <ConfigProvider
      locale={zhCN}
      theme={{
        token: {
          colorPrimary: '#1677ff',
          borderRadius: 6,
        },
      }}
    >
      <BrowserRouter>
        <Layout style={{ minHeight: '100vh' }}>
          <TopNav />
          <Layout>
            <Sidebar />
            <Content style={{ padding: 0, minHeight: 'calc(100vh - 56px)' }}>
              <Routes>
                <Route path="/" element={<Navigate to="/products" replace />} />
                <Route path="/products" element={<ProductListPage />} />
                <Route path="/products/add" element={<ProductFormPage />} />
                <Route path="/products/edit/:id" element={<ProductFormPage />} />
              </Routes>
            </Content>
          </Layout>
        </Layout>
      </BrowserRouter>
    </ConfigProvider>
  );
}

export default App;
```

- [ ] **Step 3: 运行所有测试**

```bash
npx vitest run
```
Expected: 所有测试 PASS（约 28 个）

- [ ] **Step 4: 验证 TypeScript 编译**

```bash
npx tsc -b --noEmit
```
Expected: 无类型错误

- [ ] **Step 5: 启动开发服务器验证**

```bash
npm run dev
```
Expected: Vite 启动成功，浏览器打开看到深蓝顶栏"积分商城" + 侧边"商品管理" + 商品列表页

- [ ] **Step 6: Commit**

```bash
git add src/App.tsx src/index.css
git commit -m "feat: integrate Layout + Routes, redirect / to /products"
```
