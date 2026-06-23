import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { ConfigProvider } from 'antd';
import zhCN from 'antd/locale/zh_CN';
import ProductFormPage from '../ProductFormPage';

function renderAddPage() {
  return render(
    <ConfigProvider locale={zhCN}>
      <MemoryRouter initialEntries={['/products/add']}>
        <Routes>
          <Route path="/products/add" element={<ProductFormPage />} />
        </Routes>
      </MemoryRouter>
    </ConfigProvider>,
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
    <ConfigProvider locale={zhCN}>
      <MemoryRouter initialEntries={['/products/edit/P202606230001']}>
        <Routes>
          <Route path="/products/edit/:id" element={<ProductFormPage />} />
        </Routes>
      </MemoryRouter>
    </ConfigProvider>,
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

    await user.click(screen.getByRole('button', { name: '提 交' }));

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
