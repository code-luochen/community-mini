<template>
  <view class="container" :style="{ '--base-font-size': settingsStore.fontSize + 'px' }">
    <!-- 顶部状态摘要 -->
    <view class="health-summary">
      <view class="status-box">
        <text class="status-icon">✅</text>
        <text class="status-text" :style="{ fontSize: (settingsStore.fontSize + 2) + 'px' }">状态良好</text>
      </view>
      <text class="update-time">最后更新：今天 10:30</text>
    </view>

    <!-- 最新指标卡片 -->
    <view class="data-grid">
      <view class="data-card" v-for="item in latestData" :key="item.label">
        <text class="label">{{ item.label }}</text>
        <view class="value-box">
          <text class="value" :style="{ fontSize: (settingsStore.fontSize + 8) + 'px', color: item.color }">{{ item.value }}</text>
          <text class="unit">{{ item.unit }}</text>
        </view>
      </view>
    </view>

    <!-- 趋势图占位区 -->
    <view class="trend-section">
      <view class="section-header">
        <text class="title" :style="{ fontSize: settingsStore.fontSize + 'px' }">📈 血压趋势 (近7天)</text>
      </view>
      <view class="chart-box">
        <!-- 这里实际可以使用 uCharts 或 mp-canvas -->
        <view class="chart-placeholder">
          <view class="bar" style="height: 60%"></view>
          <view class="bar" style="height: 70%"></view>
          <view class="bar" style="height: 65%"></view>
          <view class="bar" style="height: 80%"></view>
          <view class="bar" style="height: 75%"></view>
          <view class="bar" style="height: 60%"></view>
          <view class="bar" style="height: 65%"></view>
        </view>
        <view class="chart-labels">
          <text>周一</text><text>周二</text><text>周三</text><text>周四</text><text>周五</text><text>周六</text><text>周日</text>
        </view>
      </view>
    </view>

    <!-- 记录入口 -->
    <view class="action-bar">
      <elderly-button class="record-btn" @click="handleRecord">
        录入今日数据
      </elderly-button>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useSettingsStore } from '@/stores/settings';
import ElderlyButton from '@/components/ElderlyButton.vue';

const settingsStore = useSettingsStore();

const latestData = ref([
  { label: '血压', value: '128/82', unit: 'mmHg', color: '#0052D9' },
  { label: '心率', value: '72', unit: '次/分', color: '#0052D9' },
  { label: '血糖', value: '5.6', unit: 'mmol/L', color: '#0052D9' },
  { label: '体温', value: '36.5', unit: '℃', color: '#0052D9' }
]);

const handleRecord = () => {
  uni.navigateTo({ url: '/pages/health/record' });
};
</script>

<style scoped lang="scss">
@import "@/styles/variables.scss";

.container {
  padding: 32rpx;
  background-color: #F5F5F5;
  min-height: 100vh;
  padding-bottom: 160rpx;
}

.health-summary {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 32rpx;
  .status-box {
    display: flex;
    align-items: center;
    .status-icon { font-size: 40rpx; margin-right: 12rpx; }
    .status-text { font-weight: bold; color: $text-color; }
  }
  .update-time {
    font-size: 24rpx;
    color: $text-color-light;
  }
}

.data-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 24rpx;
  margin-bottom: 40rpx;
}

.data-card {
  background-color: #FFFFFF;
  border-radius: 20rpx;
  padding: 32rpx;
  box-shadow: 0 4rpx 10rpx rgba(0,0,0,0.03);
  .label {
    font-size: 28rpx;
    color: $text-color-light;
    margin-bottom: 16rpx;
    display: block;
  }
  .value-box {
    display: flex;
    align-items: baseline;
    .value {
      font-weight: bold;
    }
    .unit {
      font-size: 24rpx;
      color: $text-color-light;
      margin-left: 8rpx;
    }
  }
}

.trend-section {
  background-color: #FFFFFF;
  border-radius: 24rpx;
  padding: 32rpx;
  .section-header {
    margin-bottom: 40rpx;
    .title { font-weight: bold; color: $text-color; }
  }
}

.chart-box {
  height: 300rpx;
  display: flex;
  flex-direction: column;
  .chart-placeholder {
    flex: 1;
    display: flex;
    align-items: flex-end;
    justify-content: space-around;
    padding-bottom: 20rpx;
    border-bottom: 1px solid #EEE;
    .bar {
      width: 40rpx;
      background: linear-gradient(180deg, $primary-color 0%, rgba(0, 82, 217, 0.3) 100%);
      border-radius: 8rpx 8rpx 0 0;
    }
  }
  .chart-labels {
    display: flex;
    justify-content: space-around;
    margin-top: 12rpx;
    text { font-size: 20rpx; color: $text-color-light; }
  }
}

.action-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 20rpx 32rpx calc(20rpx + env(safe-area-inset-bottom));
  background-color: #FFFFFF;
  box-shadow: 0 -4rpx 16rpx rgba(0,0,0,0.05);
  .record-btn { margin: 0; }
}
</style>
