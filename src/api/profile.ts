import { request } from '@/utils/request';

export interface ElderlyProfile {
  age: number;
  gender: number; // 1-男 2-女
  address: string;
  emergencyContact: string;
  emergencyPhone: string;
}

/**
 * 获取当前登录老人档案
 */
export function getMyProfile() {
  return request<ElderlyProfile>({
    url: '/api/elderly-profile/me',
    method: 'GET',
  });
}

/**
 * 创建/更新当前登录老人档案
 */
export function updateMyProfile(data: ElderlyProfile) {
  return request({
    url: '/api/elderly-profile/me',
    method: 'POST',
    data,
  });
}
