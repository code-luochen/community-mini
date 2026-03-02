import { request } from '@/utils/request';

export interface ServiceModel {
  id: string;
  merchantId: string;
  name: string;
  type: number;
  description: string;
  price: number;
  imageUrl: string;
  status: number;
  auditStatus: number;
  createdAt: string;
}

export interface QueryServiceParams {
  name?: string;
  type?: number;
  page?: number;
  limit?: number;
}

/**
 * 获取服务列表 (公共，仅展示审核通过且上架的服务)
 */
export function getServiceList(params: QueryServiceParams) {
  return request<{ data: { items: ServiceModel[]; total: number } }>({
    url: '/api/services',
    method: 'GET',
    data: params,
    custom: {
      hideLoading: false,
    }
  });
}

/**
 * 获取单个服务详情
 */
export function getServiceDetail(id: string | number) {
  return request<{ data: ServiceModel }>({
    url: `/api/services/${id}`,
    method: 'GET',
    custom: {
      hideLoading: false,
    }
  });
}
