import { request } from '@/utils/request';

/**
 * 后端健康检查示例接口
 */
export const healthCheck = () => {
  return request({
    url: '/health',
    method: 'GET',
    custom: {
      noAuth: true, // 不需要注入 Token
    },
  });
};
