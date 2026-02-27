<template>
  <view class="container" :style="{ '--base-font-size': settingsStore.fontSize + 'px' }">
    <view class="tabs">
      <view class="tab active">全部订单</view>
      <view class="tab">待服务</view>
      <view class="tab">已完成</view>
    </view>
    <view class="order-list">
      <view class="order-card" v-for="i in 3" :key="i">
        <view class="order-header">
          <text class="order-no">单号：SN20260227100{{ i }}</text>
          <text class="status">待服务</text>
        </view>
        <view class="order-body">
          <text class="name" :style="{ fontSize: settingsStore.fontSize + 'px' }">助老送餐服务</text>
          <text class="time">预约时间：今天 12:00</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { useSettingsStore } from '@/stores/settings';
const settingsStore = useSettingsStore();
</script>

<style scoped lang="scss">
@import "@/styles/variables.scss";
.container { padding: 32rpx; background-color: #F5F5F5; min-height: 100vh; }
.tabs { display: flex; justify-content: space-around; margin-bottom: 32rpx; background: #FFF; border-radius: 12rpx; padding: 20rpx 0; }
.tab.active { color: $primary-color; font-weight: bold; border-bottom: 4rpx solid $primary-color; }
.order-card { background: #FFF; padding: 32rpx; border-radius: 20rpx; margin-bottom: 24rpx; }
.order-header { display: flex; justify-content: space-between; border-bottom: 1px solid #EEE; padding-bottom: 16rpx; margin-bottom: 16rpx; }
.status { color: $primary-color; font-weight: bold; }
</style>
