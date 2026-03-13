import { request } from '@/utils/request';

export interface FamilyBindingModel {
  id: number;
  familyId: number;
  elderlyId: number;
  relation: string;
  status: number;
  createdAt: string;
  family: {
    id: number;
    username: string;
    nickname: string;
    realName: string;
    phone: string;
    avatar: string;
  };
}

/**
 * 老人端获取已绑定家属列表
 */
export function getMyFamilyList() {
  return request<{ data: FamilyBindingModel[] }>({
    url: '/api/family-binding/my-family',
    method: 'GET'
  });
}

/**
 * 老人端解除与某个家属的绑定
 */
export function unbindFamily(familyId: number) {
  return request({
    url: `/api/family-binding/family/${familyId}`,
    method: 'DELETE'
  });
}

/**
 * 老人端主动绑定家属
 */
export function bindFamily(data: { phone: string; relation: string }) {
  return request({
    url: '/api/family-binding/bind', // 假设此时是由后端统一处理 或 另外的路由
    method: 'POST',
    data
  });
}
