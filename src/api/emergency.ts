import { request } from '@/utils/request';

export interface CreateEmergencyParams {
  location: string;
  remark?: string;
}

/**
 * BE-16: 一键求助触发
 * @param data { location, remark }
 */
export function createEmergency(data: CreateEmergencyParams) {
  return request({
    url: '/api/emergency',
    method: 'POST',
    data
  });
}

/**
 * 获取紧急求助记录
 * @param params { elderlyId?, status?, page?, limit? }
 */
export function getEmergencyLogs(params: any = {}) {
  return request({
    url: '/api/emergency',
    method: 'GET',
    data: params
  });
}
