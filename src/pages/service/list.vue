<template>
  <view class="container" :style="{ '--base-font-size': settingsStore.fontSize + 'px' }">
    <view class="search-bar">
      <input type="text" placeholder="搜索服务..." class="search-input" />
    </view>
    <view class="list">
       <view class="service-card" v-for="i in 5" :key="i">
         <text :style="{ fontSize: settingsStore.fontSize + 'px' }">演示服务项目 {{ i }}</text>
         <elderly-button>查看</elderly-button>
       </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { useSettingsStore } from '@/stores/settings';
import ElderlyButton from '@/components/ElderlyButton.vue';
const settingsStore = useSettingsStore();
</script>

<style scoped lang="scss">
@import "@/styles/variables.scss";
.container { padding: 32rpx; background-color: #F5F5F5; min-height: 100vh; }
.search-bar { margin-bottom: 32rpx; .search-input { background: #FFF; height: 100rpx; border-radius: 50rpx; padding: 0 40rpx; } }
.service-card { background: #FFF; padding: 32rpx; border-radius: 20rpx; margin-bottom: 24rpx; display: flex; justify-content: space-between; align-items: center; }
</style>
