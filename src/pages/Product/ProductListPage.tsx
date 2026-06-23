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
