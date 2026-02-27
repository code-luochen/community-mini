<template>
  <view class="container" :style="{ '--base-font-size': settingsStore.fontSize + 'px' }">
    <view class="setting-group">
      <view class="group-title">适老化设置</view>
      
      <!-- 字体大小设置 -->
      <view class="setting-item vertical">
        <text class="item-label" :style="{ fontSize: settingsStore.fontSize + 'px' }">字体大小</text>
        <view class="font-options">
          <view 
            v-for="size in [18, 20, 24]" 
            :key="size"
            class="size-box"
            :class="{ active: settingsStore.fontSize === size }"
            @click="settingsStore.setFontSize(size)"
          >
            <text :style="{ fontSize: size + 'px' }">
              {{ size === 18 ? '标准' : size === 20 ? '较大' : '特大' }}
            </text>
          </view>
        </view>
        <text class="item-tip">选择最适合您的阅读体验</text>
      </view>

      <!-- 语音播报开关 -->
      <view class="setting-item horizontal">
        <text class="item-label" :style="{ fontSize: settingsStore.fontSize + 'px' }">语音辅助播报</text>
        <switch 
          :checked="settingsStore.enableVoice" 
          @change="settingsStore.toggleVoice" 
          color="#0052D9"
        />
      </view>
    </view>

    <view class="setting-group">
      <view class="group-title">其他</view>
      <view class="setting-item horizontal" @click="handleLogout">
        <text class="item-label">退出登录</text>
        <text class="arrow">></text>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { useSettingsStore } from '@/stores/settings';
import { useUserStore } from '@/stores/user';

const settingsStore = useSettingsStore();
const userStore = useUserStore();

const handleLogout = () => {
  uni.showModal({
    title: '提示',
    content: '确定要退出登录吗？',
    success: (res) => {
      if (res.confirm) {
        userStore.logout();
        uni.reLaunch({ url: '/pages/login/index' });
      }
    }
  });
};
</script>

<style scoped lang="scss">
@import "@/styles/variables.scss";

.container {
  min-height: 100vh;
  background-color: #F8F9FA;
  padding: 32rpx;
}

.setting-group {
  margin-bottom: 40rpx;
  .group-title {
    font-size: 26rpx;
    color: #999;
    padding-left: 20rpx;
    margin-bottom: 16rpx;
  }
}

.setting-item {
  background-color: #FFFFFF;
  border-radius: 20rpx;
  padding: 32rpx;
  margin-bottom: 20rpx;
  
  &.horizontal {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  
  &.vertical {
    display: flex;
    flex-direction: column;
  }

  .item-label {
    font-weight: bold;
    color: $text-color;
  }
  
  .item-tip {
    font-size: 24rpx;
    color: #999;
    margin-top: 16rpx;
  }
}

.font-options {
  display: flex;
  gap: 20rpx;
  margin-top: 32rpx;
  .size-box {
    flex: 1;
    height: 120rpx;
    background-color: #F5F7FA;
    border-radius: 16rpx;
    display: flex;
    justify-content: center;
    align-items: center;
    border: 4rpx solid transparent;
    transition: all 0.2s;
    
    text { color: $text-color; font-weight: bold; }
    
    &.active {
      background-color: #E8F3FF;
      border-color: $primary-color;
      text { color: $primary-color; }
    }
  }
}

.arrow {
  color: #CCC;
  font-size: 32rpx;
}
</style>
