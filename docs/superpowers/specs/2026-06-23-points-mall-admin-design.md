# 积分商城后台 — 商品管理模块 设计文档

**日期**: 2026-06-23
**状态**: 待审核

---

## 1. 概述

基于积分商城产品文档，构建积分商城后台管理系统的商品管理模块。无需登录页面，直接展示系统页面。

### 技术选型

| 项 | 选择 | 原因 |
|----|------|------|
| UI 框架 | Ant Design (antd) | 企业级后台首选，蓝色主题与深蓝主色调一致，Table/Form/Modal 开箱即用 |
| 路由 | react-router-dom | React 生态标准路由方案 |
| 状态管理 | React useState + localStorage | 初期 mock 数据方案，结构为后续真实 API 预留 |
| 图标 | @ant-design/icons | 与 antd 配套 |
| 测试 | Vitest + @testing-library/react | 项目已有配置 |

---

## 2. 路由设计

| 路径 | 页面 | 说明 |
|------|------|------|
| `/products` | 商品列表 | 默认首页，包含筛选、表格、操作 |
| `/products/add` | 添加商品 | 表单页，所有字段按文档 |
| `/products/edit/:id` | 修改商品 | 复用表单组件，自动预填已有数据 |

`/` 根路径重定向到 `/products`。无需登录验证。

---

## 3. 布局结构

深蓝色主色调，顶部导航 + 侧边栏布局：

```
┌──────────────────────────────────────────────┐
│  🛒 积分商城                    [深蓝顶栏]   │
├──────────┬───────────────────────────────────┤
│ 商品管理  │  [内容区 - 白色背景]              │
│ [侧边栏] │    - 筛选栏                       │
│          │    - 数据表格                     │
│          │    - 分页                         │
└──────────┴───────────────────────────────────┘
```

- **顶栏**: 深蓝色背景 + 白色文字，"积分商城"作为主菜单项
- **侧边栏**: 跟随顶栏的菜单类别，"商品管理"链接
- **内容区**: 白色背景，圆角卡片式

---

## 4. 数据模型

```typescript
// 商品类型
type ProductType = '化肥' | '农药' | '服务';

// 商品状态
type ProductStatus = '草稿' | '上架中' | '已下架';

// 商品实体
interface Product {
  id: string;                    // 自动生成，如 P202606230001
  name: string;                  // 商品名称（必填）
  type: ProductType;             // 商品类型（必填）
  coverImage: string;            // 封面图 URL（必填）
  detailImages: string[];        // 详情图 URL 数组（必填）
  stock: number;                 // 库存（必填，单位：个）
  price: number;                 // 价格（必填，单位：薯币）
  effectiveStart: string;        // 生效开始时间 ISO string（必填）
  effectiveEnd: string;          // 生效结束时间 ISO string（必填）
  description?: string;          // 详情介绍（非必填）
  status: ProductStatus;         // 商品状态，默认草稿
  listingReason?: string;        // 上架原因
  delistingReason?: string;      // 下架原因
  createdAt: string;             // 创建时间
  updatedAt: string;             // 更新时间
}
```

商品编号格式：`P` + `YYYYMMDD` + 序号（如 `P202606230001`）

---

## 5. 组件树

```
App
├── Layout
│   ├── TopNav (深蓝顶栏 - "积分商城")
│   └── Sidebar (侧边栏 - "商品管理")
└── Routes
    ├── ProductListPage (商品列表 /products)
    │   ├── FilterBar (筛选栏)
    │   └── ProductTable (数据表格)
    │       ├── StatusTag (状态标签)
    │       └── ActionButtons (操作按钮组)
    └── ProductFormPage (添加/修改 /products/add, /products/edit/:id)
        ├── ProductForm (表单)
        └── ImageUpload (图片上传)
```

---

## 6. 状态管理与 CRUD

### 数据 Hook

```typescript
// src/hooks/useProducts.ts — 商品数据 hook
// 封装 CRUD 操作，内部管理 products 数组
// 数据持久化到 localStorage
function useProducts() {
  // products: Product[] — 从 localStorage 初始化
  // addProduct(data)     — 新增，自动生成 ID，默认状态草稿
  // updateProduct(id, data) — 修改
  // deleteProduct(id)   — 删除（仅草稿/已下架可删）
  // listProduct(id, reason)  — 上架（仅草稿/已下架可上架）
  // delistProduct(id, reason) — 下架（仅上架中可下架）
  // getProduct(id)      — 获取单个商品
}
```

### 状态流转规则

| 操作 | 草稿 | 上架中 | 已下架 |
|------|------|--------|--------|
| 修改 | ✅ | ❌ | ✅ |
| 删除 | ✅ | ❌ | ✅ |
| 上架 | ✅ | ❌ | ✅ |
| 下架 | ❌ | ✅ | ❌ |

### 交互流程

- **上架/下架**: 表格单选行 → 点击按钮 → Modal 弹窗录入原因 → 确认 → 状态更新
- **删除**: 点击删除按钮 → Modal 二次确认 → 确认 → 执行删除
- **未选择**: 点击上架/下架时没有选中行 → `message.warning` 提示"请先选择商品"
- **状态违规**: 对不可操作状态的商品执行操作 → `message.warning` 提示具体原因

---

## 7. 筛选功能

| 筛选条件 | 组件 | 说明 |
|----------|------|------|
| 商品编号 | Input | placeholder: "请输入商品编号" |
| 商品名称 | Input | placeholder: "请输入商品名称" |
| 商品类型 | Select (单选) | 选项: 化肥/农药/服务 |
| 生效时间 | DatePicker.RangePicker | 时间范围 |
| 商品状态 | Select (单选) | 选项: 上架中/已下架/草稿 |

操作按钮：**重置**（清空所有条件）、**搜索**（按条件筛选）

---

## 8. 表单校验规则

| 字段 | 组件 | 规则 |
|------|------|------|
| 商品名称 | Input | 必填，最长 50 字符 |
| 商品类型 | Select | 必选 |
| 封面图 | Upload | 必传，1 张，jpg/png，最大 2MB |
| 详情图 | Upload | 必传，1-10 张，jpg/png，单张最大 2MB |
| 库存 | InputNumber | 必填，≥0 的整数 |
| 价格 | InputNumber | 必填，>0 的整数 |
| 生效时间 | DatePicker.RangePicker | 必选，结束 > 开始 |
| 详情介绍 | Input.TextArea | 非必填 |

---

## 9. 文件结构

```
src/
├── main.tsx                       # 入口，挂载 App
├── App.tsx                        # 路由配置 + Layout 包裹
├── App.css                        # 全局样式覆盖（移除）
├── index.css                      # 全局样式 + antd 深蓝色主题覆盖
├── components/
│   └── Layout/
│       ├── TopNav.tsx             # 深蓝顶栏 "积分商城"
│       ├── TopNav.css
│       ├── Sidebar.tsx            # 侧边栏 "商品管理"
│       └── Sidebar.css
├── pages/
│   └── Product/
│       ├── ProductListPage.tsx    # 列表页：筛选 + 表格 + 分页
│       ├── ProductListPage.css
│       ├── ProductFormPage.tsx    # 添加/修改表单页
│       ├── ProductFormPage.css
│       ├── FilterBar.tsx          # 筛选栏组件
│       └── ProductTable.tsx       # 表格组件
├── hooks/
│   └── useProducts.ts           # 商品数据 CRUD hook
├── types/
│   └── product.ts               # Product 类型定义 + 字典常量
└── utils/
    └── generateId.ts            # 商品编号生成器
```

---

## 10. 依赖与测试

### 新增依赖

| 包 | 用途 |
|----|------|
| `antd` | UI 组件库 |
| `@ant-design/icons` | 图标 |
| `react-router-dom` | 路由 |

### 测试策略（TDD）

| 测试目标 | 类型 | 内容 |
|----------|------|------|
| `useProducts` hook | 单元测试 | CRUD 操作正确性、状态流转规则、ID 自动生成 |
| `ProductListPage` | 集成测试 | 筛选功能、表格渲染、操作按钮交互 |
| `ProductFormPage` | 集成测试 | 表单校验、新增流程、修改预填、提交行为 |

---

## 11. 需求对照检查

- [x] 无登录页，直接展示系统
- [x] 深蓝色主色调 + 顶栏导航 + 侧边栏
- [x] "积分商城"在顶栏，"商品管理"在侧边
- [x] 商品管理完整 CRUD（含商品编号自动生成）
- [x] 商品状态：草稿/上架中/已下架
- [x] 上架/下架交互（单选 + Modal 录入原因）
- [x] 状态流转规则（上架中不可修改/删除，草稿和已下架可上架等）
- [x] 筛选条件：编号/名称/类型/时间/状态 + 重置/搜索
- [x] 表单校验：名称/类型/图片/库存/价格/时间
