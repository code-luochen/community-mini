import { request } from '@/utils/request';

/**
 * 提交健康记录
 */
export const createHealthRecord = (data: {
  elderlyId?: string | number; // 实际通常由后端通过 Token 解析得出，如果是家属代填则可能需要
  systolicBp?: number;
  diastolicBp?: number;
  heartRate?: number;
  bloodSugar?: number;
  temperature?: number;
}) => {
  return request({
    url: '/api/health-record',
    method: 'POST',
    data,
  });
};

/**
 * 查询历史健康记录
 */
export const getHealthRecords = (data?: {
  elderlyId?: number;
  isAbnormal?: number;
  page?: number;
  limit?: number;
}) => {
  return request({
    url: '/api/health-record',
    method: 'GET',
    data,
  });
};
