import { request } from '@/utils/request';

// 订单接口响应和请求的类型定义
export interface OrderModel {
  id: string;
  orderNo: string;
  elderlyId: string;
  merchantId: string;
  serviceId: string;
  serviceSnapshot: {
    name: string;
    price: number;
    description: string;
  };
  totalAmount: number;
  status: number; // 0: 待接单, 1: 配送/服务中, 2: 待确认(待收货), 3: 已完成, 4: 已取消
  evaluateStar: number;
  evaluateContent: string;
  createdAt: string;
  updatedAt: string;
}

export interface QueryOrderParams {
  elderlyId?: string;
  status?: number;
  page?: number;
  limit?: number;
}

/**
 * 获取订单列表（支持分页和状态过滤）
 */
export function getOrderList(params: QueryOrderParams) {
  return request<{data: { items: OrderModel[]; total: number }}>({
    url: '/api/order',
    method: 'GET',
    data: params,
    custom: {
      hideLoading: true, // 列表自己处理 loading
    }
  });
}

/**
 * 确认收货 (流转订单状态)
 * Elderly 确认服务完成
 */
export function confirmOrder(id: string) {
  return request<OrderModel>({
    url: `/api/order/${id}/status`,
    method: 'PUT',
    data: {
      status: 3, // 3 为已完成
    }
  });
}

/**
 * 评价订单
 */
export function evaluateOrder(id: string, evaluateStar: number, evaluateContent: string) {
  return request<OrderModel>({
    url: `/api/order/${id}/evaluate`,
    method: 'PUT',
    data: {
      evaluateStar,
      evaluateContent
    }
  });
}

