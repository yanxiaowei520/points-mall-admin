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
import type { UploadRequestOption } from '@rc-component/upload/es/interface';
import { useProducts } from '../../hooks/useProducts';
import { PRODUCT_TYPE_OPTIONS } from '../../types/product';
import type { ProductType } from '../../types/product';
import dayjs from 'dayjs';
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
  const customRequest = (options: UploadRequestOption) => {
    const { file, onSuccess } = options;
    // Simulate upload delay and return a fake URL
    setTimeout(() => {
      const fakeUrl = URL.createObjectURL(file as File);
      onSuccess?.({ url: fakeUrl });
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
              beforeUpload={(file) => {
                const isLt2M = file.size / 1024 / 1024 < 2;
                if (!isLt2M) message.error('图片大小不能超过 2MB');
                return isLt2M || Upload.LIST_IGNORE;
              }}
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
              beforeUpload={(file) => {
                const isLt2M = file.size / 1024 / 1024 < 2;
                if (!isLt2M) message.error('图片大小不能超过 2MB');
                return isLt2M || Upload.LIST_IGNORE;
              }}
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
            label="商品库存"
            rules={[
              { required: true, message: '请输入商品库存' },
              { type: 'number', min: 0, message: '库存不能为负数' },
            ]}
          >
            <InputNumber min={0} precision={0} style={{ width: '100%' }} placeholder="请输入库存" />
          </Form.Item>

          <Form.Item
            name="price"
            label="商品价格"
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
            <Button type="primary" htmlType="submit" loading={submitting} style={{ width: '100%' }}>
              提交
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
}

export default ProductFormPage;
