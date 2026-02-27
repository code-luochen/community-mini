<template>
  <view class="login-container" :style="{ '--base-font-size': settingsStore.fontSize + 'px' }">
    <!-- 1. 头部 Logo 设计 -->
    <view class="login-header">
      <image class="logo" src="/static/logo.png" mode="aspectFit"></image>
      <text class="title" :style="{ fontSize: `${settingsStore.fontSize + 4}px` }">小区老年人服务</text>
      <text class="subtitle" :style="{ fontSize: `${settingsStore.fontSize - 2}px` }">适老化社区，智慧养老</text>
    </view>

    <!-- 2. 登录表单 -->
    <view class="login-form">
      <view class="input-item">
        <text class="label" :style="{ fontSize: `${settingsStore.fontSize}px` }">账号</text>
        <view class="input-wrapper">
          <input 
            class="input" 
            v-model="loginForm.username" 
            placeholder="请输入账号 (需包含 elderly_)" 
            placeholder-class="placeholder"
            :style="{ fontSize: `${settingsStore.fontSize}px` }"
          />
        </view>
      </view>

      <view class="input-item">
        <text class="label" :style="{ fontSize: `${settingsStore.fontSize}px` }">密码</text>
        <view class="input-wrapper">
          <input 
            class="input" 
            v-model="loginForm.password" 
            type="password" 
            placeholder="请输入密码" 
            placeholder-class="placeholder"
            :style="{ fontSize: `${settingsStore.fontSize}px` }"
          />
        </view>
      </view>

      <!-- 登录按钮 -->
      <view class="button-area">
        <ElderlyButton 
          :voice-text="`点击登录，当前账号为${loginForm.username || '空'}`" 
          @click="handleLogin"
        >
          登 录
        </ElderlyButton>
      </view>
    </view>

    <!-- 3. 技术支持与提示 -->
    <view class="footer-tips">
      <text class="tip-text" :style="{ fontSize: `${settingsStore.fontSize - 4}px` }">
        如无法登录，请联系小区管理员协助重置
      </text>
    </view>
  </view>
</template>

<script setup lang="ts">
import { reactive, onMounted } from 'vue';
import { onLoad, onShow } from '@dcloudio/uni-app';
import { useSettingsStore } from '@/stores/settings';
import { useUserStore } from '@/stores/user';
import { login } from '@/api/auth';
import ElderlyButton from '@/components/ElderlyButton.vue';

/**
 * @description 小区老年人登录页面
 * @author Uniapp Frontend Expert
 */

const settingsStore = useSettingsStore();
const userStore = useUserStore();

// 1. 表单状态定义
const loginForm = reactive({
  username: '',
  password: ''
});

// 2. 自动检查登录状态
onLoad(() => {
  if (userStore.token) {
    // 如果已经登录，直接跳转到首页
    uni.switchTab({
      url: '/pages/index/index'
    });
  }
});

// 3. 登录逻辑实现
const handleLogin = async () => {
  // 基础校验
  if (!loginForm.username || !loginForm.password) {
    uni.showToast({ title: '请填写完整账号密码', icon: 'none' });
    return;
  }

  // 账号规则校验（文档要求：账号需包含 elderly_ 前缀）
  if (!loginForm.username.startsWith('elderly_')) {
    uni.showToast({ title: '账号格式不正确 (需包含 elderly_)', icon: 'none' });
    return;
  }

  try {
    uni.showLoading({ title: '正在登录...', mask: true });
    
    // 调用登录接口
    const res = await login({
      username: loginForm.username,
      password: loginForm.password
    });

    // 存储 Token 和用户信息
    userStore.setToken(res.access_token);
    userStore.setUserInfo(res.user);

    uni.hideLoading();
    uni.showToast({ title: '登录成功', icon: 'success' });

    // 延迟跳转，提供更好的交互感知
    setTimeout(() => {
      uni.switchTab({
        url: '/pages/index/index'
      });
    }, 1000);

  } catch (error: any) {
    uni.hideLoading();
    // 错误已由 request 拦截器统一处理，这里可进行补充逻辑
    console.error('Login Error:', error);
  }
};

</script>

<style scoped lang="scss">
@import "@/styles/variables.scss";

.login-container {
  padding: 60rpx 40rpx;
  background-color: $bg-color;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.login-header {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-top: 80rpx;
  margin-bottom: 100rpx;

  .logo {
    width: 180rpx;
    height: 180rpx;
    margin-bottom: 24rpx;
    /* 适老化圆角 */
    border-radius: 20rpx;
  }

  .title {
    font-weight: bold;
    color: $primary-color;
    margin-bottom: 8rpx;
  }

  .subtitle {
    color: $text-color-light;
  }
}

.login-form {
  .input-item {
    margin-bottom: 48rpx;

    .label {
      display: block;
      font-weight: bold;
      color: $text-color;
      margin-bottom: 20rpx;
      padding-left: 8rpx;
    }

    .input-wrapper {
      background-color: #F5F7FA;
      border-radius: 24rpx;
      padding: 0 32rpx;
      border: 4rpx solid transparent;
      transition: all 0.3s ease;

      &:focus-within {
        border-color: $primary-color;
        background-color: #E8F3FF;
      }

      .input {
        width: 100%;
        height: 120rpx; /* 加大交互热区，方便老年人操作 */
        color: $text-color;
      }

      .placeholder {
        color: #999;
      }
    }
  }

  .button-area {
    margin-top: 80rpx;
    /* 移除原有冗余 button 样式，依赖 ElderlyButton 特供版 */
  }
}

.footer-tips {
  margin-top: auto;
  text-align: center;
  padding-bottom: 40rpx;

  .tip-text {
    color: #999;
  }
}
</style>