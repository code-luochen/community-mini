import { defineStore } from 'pinia';
import { ref } from 'vue';

export const useUserStore = defineStore('user', () => {
  const token = ref<string>(uni.getStorageSync('token') || '');
  const userInfo = ref<Record<string, unknown> | null>(uni.getStorageSync('userInfo') || null);

  const setToken = (newToken: string) => {
    token.value = newToken;
    uni.setStorageSync('token', newToken);
    // JWT Token 过期处理或者记录刷新时间可以放在这里
  };

  const setUserInfo = (info: Record<string, unknown>) => {
    userInfo.value = info;
    uni.setStorageSync('userInfo', info);
  };

  const logout = () => {
    token.value = '';
    userInfo.value = null;
    uni.removeStorageSync('token');
    uni.removeStorageSync('userInfo');
  };

  return {
    token,
    userInfo,
    setToken,
    setUserInfo,
    logout,
  };
});
