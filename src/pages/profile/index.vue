<template>
  <view class="container" :style="{ '--base-font-size': settingsStore.fontSize + 'px' }">
    <!-- 用户头像信息 -->
    <view class="user-header">
      <image class="avatar" src="https://img.js.design/assets/illustration/63f46f48a97217578205691e/preview.png" mode="aspectFill" />
      <view class="user-info">
        <text class="nickname" :style="{ fontSize: (settingsStore.fontSize + 4) + 'px' }">
          {{ userStore.userInfo?.nickname || '张爷爷' }}
        </text>
        <text class="identity">已认证业主</text>
      </view>
    </view>

    <!-- 常用功能列表 -->
    <view class="menu-list">
      <view class="menu-item" v-for="item in menuItems" :key="item.label" @click="handleNavigate(item.path)">
        <view class="item-left">
          <text class="item-icon">{{ item.icon }}</text>
          <text class="item-label" :style="{ fontSize: settingsStore.fontSize + 'px' }">{{ item.label }}</text>
        </view>
        <text class="arrow">&gt;</text>
      </view>
    </view>

    <!-- 底部保障 -->
    <view class="footer-badge">
      <text>🛡️ 社区智慧养老保障服务</text>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useSettingsStore } from '@/stores/settings';
import { useUserStore } from '@/stores/user';

const settingsStore = useSettingsStore();
const userStore = useUserStore();

const menuItems = [
  { label: '基础资料', icon: '👤', path: '/pages/profile/basic-info' },
  { label: '我的家属', icon: '👨‍👩‍👧', path: '' },
  { label: '服务评价', icon: '⭐', path: '' },
  { label: '系统设置', icon: '⚙️', path: '/pages/profile/setting' }
];

const handleNavigate = (path: string) => {
  if (path) {
    uni.navigateTo({ url: path });
  } else {
    uni.showToast({ title: '演示版暂未开放', icon: 'none' });
  }
};
</script>

<style scoped lang="scss">
@import "@/styles/variables.scss";

.container {
  min-height: 100vh;
  background-color: #F8F9FA;
}

.user-header {
  background-color: #FFFFFF;
  padding: 80rpx 40rpx 40rpx;
  display: flex;
  align-items: center;
  gap: 32rpx;
  margin-bottom: 24rpx;
  .avatar {
    width: 140rpx;
    height: 140rpx;
    border-radius: 70rpx;
    background-color: #F0F0F0;
  }
  .user-info {
    .nickname {
      font-weight: bold;
      color: $text-color;
      display: block;
    }
    .identity {
      font-size: 24rpx;
      color: $primary-color;
      background-color: #E8F3FF;
      padding: 4rpx 16rpx;
      border-radius: 20rpx;
      margin-top: 12rpx;
      display: inline-block;
    }
  }
}

.menu-list {
  background-color: #FFFFFF;
  margin: 0 32rpx;
  border-radius: 24rpx;
  overflow: hidden;
  .menu-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 40rpx 32rpx;
    border-bottom: 1px solid #F5F5F5;
    &:last-child { border-bottom: none; }
    &:active { background-color: #FAFAFA; }
    
    .item-left {
      display: flex;
      align-items: center;
      .item-icon {
        font-size: 40rpx;
        margin-right: 20rpx;
      }
      .item-label {
        font-weight: bold;
        color: $text-color;
      }
    }
    .arrow { color: #CCC; font-size: 32rpx; }
  }
}

.footer-badge {
  text-align: center;
  margin-top: 60rpx;
  font-size: 24rpx;
  color: #BBB;
}
</style>
