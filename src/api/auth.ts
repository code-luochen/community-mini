import { request } from '@/utils/request';

export interface LoginResponse {
  data: {
    access_token: string;
  user: {
    id: number;
    username: string;
    role: number;
    nickname: string;
  };
  }
}

/**
 * 用户登录
 * @param data { username, password }
 */
export function login(data: any) {
  return request<LoginResponse>({
    url: '/api/auth/login',
    method: 'POST',
    data, 
    custom: {
      noAuth: true, // 登录接口不需要 Token
    }
  });
}
