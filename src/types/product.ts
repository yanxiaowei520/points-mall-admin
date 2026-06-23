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
