<template>
  <view class="login-container" :style="{ '--base-font-size': settingsStore.fontSize + 'px' }">
    <!-- 1. 顶部背景装饰 (Cyan Decor) -->
    <view class="top-decor"></view>

    <!-- 2. 头部 Logo 设计 -->
    <view class="login-header">
      <view class="logo-wrap">
         <image class="logo" src="/static/logo.png" mode="aspectFit"></image>
      </view>
      <text class="title" :style="{ fontSize: `${settingsStore.fontSize + 6}px` }">小区智慧养老</text>
      <text class="subtitle" :style="{ fontSize: `${settingsStore.fontSize}px` }">适老化社区，时刻为您守护</text>
    </view>

    <!-- 3. 登录表单 -->
    <view class="login-form-card">
      <view class="form-title" :style="{ fontSize: `${settingsStore.fontSize + 2}px` }">账号登录</view>
      
      <view class="input-item">
        <view class="label-row">
          <u-icon name="account" size="32" color="#0891B2"></u-icon>
          <text class="label" :style="{ fontSize: `${settingsStore.fontSize}px` }">管理账号</text>
        </view>
        <view class="input-wrapper">
          <input 
            class="input" 
            v-model="loginForm.username" 
            placeholder="请输入您的账号" 
            placeholder-class="placeholder"
            :style="{ fontSize: `${settingsStore.fontSize}px` }"
          />
        </view>
      </view>

      <view class="input-item">
        <view class="label-row">
          <u-icon name="lock" size="32" color="#0891B2"></u-icon>
          <text class="label" :style="{ fontSize: `${settingsStore.fontSize}px` }">登录密码</text>
        </view>
        <view class="input-wrapper">
          <input 
            class="input" 
            v-model="loginForm.password" 
            type="password" 
            placeholder="请输入六位以上密码" 
            placeholder-class="placeholder"
            :style="{ fontSize: `${settingsStore.fontSize}px` }"
          />
        </view>
      </view>

      <!-- 登录按钮 -->
      <view class="button-area">
        <ElderlyButton 
          :voice-text="`点击登录`" 
          @click="handleLogin"
        >
          安全登录
        </ElderlyButton>
      </view>
      
      <view class="tips">
        <text class="tip-text" :style="{ fontSize: `${settingsStore.fontSize - 4}px` }">
          温馨提示：账号建议包含 elderly_ 前缀以快速识别角色
        </text>
      </view>
    </view>

    <!-- 4. 底部版权 -->
    <view class="footer">
      <text class="copyright">社区养老服务中心 · 技术支持</text>
    </view>
  </view>
</template>

<script setup lang="ts">
import { reactive } from 'vue';
import { onLoad } from '@dcloudio/uni-app';
import { useSettingsStore } from '@/stores/settings';
import { useUserStore } from '@/stores/user';
import { login } from '@/api/auth';
import ElderlyButton from '@/components/ElderlyButton.vue';

const settingsStore = useSettingsStore();
const userStore = useUserStore();

const loginForm = reactive({
  username: '',
  password: ''
});

onLoad(() => {
  if (userStore.token) {
    uni.switchTab({ url: '/pages/index/index' });
  }
});

const handleLogin = async () => {
  if (!loginForm.username || !loginForm.password) {
    uni.showToast({ title: '请填写账号密码', icon: 'none' });
    return;
  }

  try {
    uni.showLoading({ title: '正在安全验证...', mask: true });
    
    // 调用登录接口 (后端返回 { data: { access_token, user } })
    const { data } = await login({
      username: loginForm.username,
      password: loginForm.password
    });

    userStore.setToken(data.access_token);
    userStore.setUserInfo(data.user);

    uni.hideLoading();
    uni.showToast({ title: '登录成功', icon: 'success' });

    setTimeout(() => {
      uni.switchTab({ url: '/pages/index/index' });
    }, 1000);

  } catch (error: any) {
    uni.hideLoading();
    console.error('Login Error:', error);
  }
};
</script>

<style scoped lang="scss">
@import "@/styles/variables.scss";

.login-container {
  min-height: 100vh;
  background-color: $bg-color;
  display: flex;
  flex-direction: column;
  position: relative;
  overflow: hidden;
}

.top-decor {
  position: absolute;
  top: -100rpx;
  right: -100rpx;
  width: 400rpx;
  height: 400rpx;
  background: radial-gradient(circle, $primary-light 0%, transparent 70%);
  z-index: 0;
}

.login-header {
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-top: 140rpx;
  margin-bottom: 60rpx;

  .logo-wrap {
    width: 200rpx;
    height: 200rpx;
    background: #FFFFFF;
    border-radius: 60rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: $card-shadow;
    margin-bottom: 40rpx;
    .logo { width: 140rpx; height: 140rpx; }
  }

  .title {
    font-weight: 900;
    color: $primary-color;
    margin-bottom: 12rpx;
    letter-spacing: 2rpx;
  }

  .subtitle {
    color: $text-color-light;
    opacity: 0.8;
  }
}

.login-form-card {
  position: relative;
  z-index: 1;
  margin: 0 40rpx;
  background: #FFFFFF;
  border-radius: 48rpx;
  padding: 60rpx 40rpx;
  box-shadow: $card-shadow;

  .form-title {
    font-weight: 800;
    color: $text-color;
    margin-bottom: 48rpx;
    text-align: center;
  }

  .input-item {
    margin-bottom: 40rpx;

    .label-row {
      display: flex;
      align-items: center;
      gap: 12rpx;
      margin-bottom: 16rpx;
      padding-left: 8rpx;
      .label { font-weight: bold; color: $text-color; }
    }

    .input-wrapper {
      background-color: $primary-light;
      border-radius: 24rpx;
      padding: 0 32rpx;
      border: 3rpx solid transparent;
      transition: all 0.2s;

      &:focus-within {
        border-color: $primary-color;
        background-color: #FFFFFF;
      }

      .input {
        width: 100%;
        height: 110rpx;
        color: $text-color;
      }
      .placeholder { color: $text-color-muted; }
    }
  }

  .button-area {
    margin-top: 60rpx;
  }
  
  .tips {
    margin-top: 32rpx;
    text-align: center;
    .tip-text { color: $text-color-muted; line-height: 1.5; }
  }
}

.footer {
  margin-top: auto;
  text-align: center;
  padding: 60rpx 0;
  .copyright {
    font-size: 24rpx;
    color: $text-color-muted;
  }
}
</style>