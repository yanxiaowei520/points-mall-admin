import dayjs from 'dayjs';
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
