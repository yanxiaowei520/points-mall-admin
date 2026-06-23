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
