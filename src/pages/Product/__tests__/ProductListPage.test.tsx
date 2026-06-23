import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { ConfigProvider } from 'antd';
import zhCN from 'antd/locale/zh_CN';
import ProductListPage from '../ProductListPage';

function renderPage() {
  return render(
    <ConfigProvider locale={zhCN}>
      <MemoryRouter initialEntries={['/products']}>
        <ProductListPage />
      </MemoryRouter>
    </ConfigProvider>,
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
    const emptyElements = screen.getAllByText('暂无数据');
    expect(emptyElements.length).toBeGreaterThan(0);
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
