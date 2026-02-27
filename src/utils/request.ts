import { useUserStore } from '@/stores/user';

const BASE_URL = 'http://127.0.0.1:3000';

interface RequestOptions extends UniApp.RequestOptions {
  custom?: {
    hideLoading?: boolean;
    noAuth?: boolean;
  };
}

// 标志位：是否正在刷新 Token
let isRefreshing = false;
// 等待刷新的请求队列
let requestsQueue: Array<() => void> = [];

export const request = <T = unknown>(options: RequestOptions): Promise<T> => {
  return new Promise((resolve, reject) => {
    const userStore = useUserStore();
    
    const executeRequest = () => {
      uni.request({
        ...options,
        url: options.url.startsWith('http') ? options.url : `${BASE_URL}${options.url}`,
        header: {
          ...options.header,
          // 自动注入 JWT Token
          Authorization: !options.custom?.noAuth && userStore.token ? `Bearer ${userStore.token}` : '',
        },
        success: (res) => {
          // HTTP 状态码统一拦截
          if (res.statusCode >= 200 && res.statusCode < 300) {
            resolve(res.data as T);
          } else if (res.statusCode === 401) {
            // Token 过期（401）无感知刷新逻辑
            if (!isRefreshing) {
              isRefreshing = true;
              
              // 假设有刷新 Token 的接口 /auth/refresh
              uni.request({
                url: `${BASE_URL}/auth/refresh`,
                method: 'POST',
                header: {
                  Authorization: `Bearer ${userStore.token}` // 或者传入 refreshToken
                },
                success: (refreshRes: any) => {
                  if (refreshRes.statusCode >= 200 && refreshRes.statusCode < 300 && refreshRes.data?.token) {
                    // 更新新的 Token
                    userStore.setToken(refreshRes.data.token);
                    // 重新执行队列中的请求
                    requestsQueue.forEach((cb) => cb());
                    requestsQueue = []; // 清空队列
                    // 重新执行当前被 401 的请求
                    executeRequest();
                  } else {
                    handleAuthFail(userStore, reject);
                  }
                },
                fail: () => {
                  handleAuthFail(userStore, reject);
                },
                complete: () => {
                  isRefreshing = false;
                }
              });
            } else {
              // 正在刷新的话，将当前请求存入队列
              requestsQueue.push(() => {
                executeRequest();
              });
            }
          } else {
            uni.showToast({
              title: `请求错误: ${res.statusCode}`,
              icon: 'none',
            });
            reject(new Error(`请求错误: ${res.statusCode}`));
          }
        },
        fail: (err) => {
          // 无网全局友好提示
          uni.getNetworkType({
            success: (res) => {
              if (res.networkType === 'none') {
                uni.showToast({
                  title: '当前无网络，请检查网络设置',
                  icon: 'none',
                  duration: 3000,
                });
              } else {
                uni.showToast({
                  title: '请求失败，请稍后重试',
                  icon: 'none',
                });
              }
            },
            fail: () => {
              uni.showToast({
                title: '请求失败，请稍后重试',
                icon: 'none',
              });
            }
          });
          reject(err);
        },
      });
    };

    executeRequest();
  });
};

function handleAuthFail(userStore: any, reject: any) {
  uni.showToast({
    title: '登录已过期，请重新登录',
    icon: 'none',
  });
  userStore.logout();
  // TODO: 跳转到登录页 uni.navigateTo({ url: '/pages/login/login' })
  reject(new Error('Unauthorized'));
}
