<template>
  <view class="container" :style="{ '--base-font-size': settingsStore.fontSize + 'px' }">
    <!-- 1. 顶部大型健康卡片 (Hero Health Status) -->
    <view class="health-hero-card">
       <view class="hero-bg-decor"></view>
       <view class="hero-content">
         <view class="status-indicator">
           <view class="inner-circle">
             <text class="status-icon">🛡️</text>
           </view>
         </view>
         <view class="status-info">
           <text class="status-title" :style="{ fontSize: (settingsStore.fontSize + 8) + 'px' }">健康状态良好</text>
           <text class="status-desc">系统已为您全天候守护中</text>
         </view>
       </view>
       <view class="update-info">
         <text class="time">最后更新：今天 10:30</text>
         <text class="sync-tag">数据已同步</text>
       </view>
    </view>

    <!-- 2. 健康核心指标 (Core Metrics) -->
    <view class="metrics-grid">
      <view class="metric-card" v-for="item in latestData" :key="item.label">
        <view class="card-top">
          <text class="card-icon">{{ item.icon }}</text>
          <text class="label">{{ item.label }}</text>
        </view>
        <view class="card-main">
          <text class="value" :style="{ fontSize: (settingsStore.fontSize + 12) + 'px' }">{{ item.value }}</text>
          <text class="unit">{{ item.unit }}</text>
        </view>
        <view class="status-pill" :class="item.statusType">
          {{ item.statusText }}
        </view>
      </view>
    </view>

    <!-- 3. 趋势图分析 (Trend Analysis) -->
    <view class="trend-card">
      <view class="card-header">
        <text class="title">📈 血压趋势 (近7天)</text>
        <view class="legend">
          <view class="dot high"></view><text>收缩压</text>
          <view class="dot low"></view><text>舒张压</text>
        </view>
      </view>
      <view class="chart-box">
        <view class="chart-area">
          <!-- 模拟高保真图表 -->
          <view class="bar-group" v-for="h in [65, 78, 62, 85, 70, 75, 68]" :key="h">
             <view class="bar-top" :style="{ height: h + '%' }"></view>
             <view class="bar-bottom" :style="{ height: (h - 20) + '%' }"></view>
          </view>
        </view>
        <view class="chart-xaxis">
          <text v-for="d in ['一','二','三','四','五','六','日']" :key="d">{{ d }}</text>
        </view>
      </view>
    </view>

    <!-- 4. 固定操作栏 -->
    <view class="action-footer">
      <elderly-button @click="handleRecord">录入今日数据</elderly-button>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useSettingsStore } from '@/stores/settings';
import ElderlyButton from '@/components/ElderlyButton.vue';

const settingsStore = useSettingsStore();

const latestData = ref([
  { label: '血压', value: '128/82', unit: 'mmHg', icon: '🩸', statusType: 'normal', statusText: '正常范围' },
  { label: '心率', value: '72', unit: '次/分', icon: '💓', statusType: 'normal', statusText: '平稳' },
  { label: '血糖', value: '5.6', unit: 'mmol/L', icon: '🍬', statusType: 'normal', statusText: '正常' },
  { label: '体温', value: '36.5', unit: '℃', icon: '🌡️', statusType: 'normal', statusText: '正常' }
]);

const handleRecord = () => {
  uni.navigateTo({ url: '/pages/health/record' });
};
</script>

<style scoped lang="scss">
@import "@/styles/variables.scss";

.container {
  padding: 32rpx;
  background-color: $bg-color;
  min-height: 100vh;
  padding-bottom: 220rpx;
}

// 1. 顶部 Hero 卡片
.health-hero-card {
  position: relative;
  background: linear-gradient(135deg, $primary-color 0%, $secondary-color 100%);
  border-radius: 48rpx;
  padding: 48rpx;
  color: #FFFFFF;
  box-shadow: 0 12rpx 32rpx rgba(8, 145, 178, 0.2);
  margin-bottom: 40rpx;
  overflow: hidden;

  .hero-bg-decor {
    position: absolute;
    top: -20rpx;
    right: -20rpx;
    width: 200rpx; height: 200rpx;
    background: rgba(255,255,255,0.1);
    border-radius: 100rpx;
  }

  .hero-content {
    display: flex;
    align-items: center;
    gap: 32rpx;
    margin-bottom: 40rpx;
  }

  .status-indicator {
    width: 140rpx;
    height: 140rpx;
    background: rgba(255,255,255,0.2);
    border-radius: 70rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    .inner-circle {
      width: 100rpx; height: 100rpx;
      background: #FFFFFF;
      border-radius: 50rpx;
      display: flex;
      align-items: center;
      justify-content: center;
      .status-icon { font-size: 48rpx; }
    }
  }

  .status-info {
    .status-title { font-weight: 900; display: block; margin-bottom: 8rpx; }
    .status-desc { font-size: 28rpx; opacity: 0.85; }
  }

  .update-info {
    font-size: 24rpx;
    display: flex;
    justify-content: space-between;
    opacity: 0.8;
    border-top: 1rpx solid rgba(255,255,255,0.2);
    padding-top: 24rpx;
    .sync-tag { font-weight: bold; }
  }
}

// 2. 指标卡片
.metrics-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 24rpx;
  margin-bottom: 40rpx;
}

.metric-card {
  background: #FFFFFF;
  border-radius: 40rpx;
  padding: 32rpx;
  box-shadow: $item-shadow;
  
  .card-top {
    display: flex;
    align-items: center;
    gap: 12rpx;
    margin-bottom: 16rpx;
    .card-icon { font-size: 36rpx; }
    .label { font-size: 28rpx; color: $text-color-light; font-weight: bold; }
  }

  .card-main {
    display: flex;
    align-items: baseline;
    margin-bottom: 16rpx;
    .value { font-weight: 900; color: $text-color; }
    .unit { font-size: 24rpx; color: $text-color-muted; margin-left: 8rpx; }
  }

  .status-pill {
    display: inline-block;
    font-size: 22rpx;
    padding: 4rpx 16rpx;
    border-radius: 20rpx;
    font-weight: bold;
    &.normal { background: $primary-light; color: $primary-color; }
    &.warning { background: #FFF7ED; color: #EA580C; }
  }
}

// 3. 趋势卡片
.trend-card {
  background: #FFFFFF;
  border-radius: 48rpx;
  padding: 40rpx;
  box-shadow: $card-shadow;

  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 48rpx;
    .title { font-weight: bold; font-size: 32rpx; color: $text-color; }
    .legend {
      display: flex;
      align-items: center;
      gap: 10rpx;
      font-size: 22rpx;
      color: $text-color-light;
      .dot { width: 16rpx; height: 16rpx; border-radius: 8rpx; }
      .high { background: $primary-color; }
      .low { background: $secondary-color; }
    }
  }

  .chart-box {
    .chart-area {
      height: 240rpx;
      display: flex;
      align-items: flex-end;
      justify-content: space-around;
      padding-bottom: 16rpx;
      border-bottom: 2rpx solid #F1F5F9;
      
      .bar-group {
        width: 32rpx;
        position: relative;
        .bar-top {
          width: 100%;
          background: linear-gradient(180deg, $primary-color 0%, $primary-light 100%);
          border-radius: 12rpx 12rpx 0 0;
          position: absolute; bottom: 0; left: 0; z-index: 2;
        }
        .bar-bottom {
          width: 100%;
          background: rgba(34, 211, 238, 0.3);
          border-radius: 6rpx 6rpx 0 0;
          position: absolute; bottom: 0; left: 0; z-index: 1;
        }
      }
    }
    .chart-xaxis {
      display: flex;
      justify-content: space-around;
      margin-top: 20rpx;
      text { font-size: 24rpx; color: $text-color-muted; font-weight: bold; }
    }
  }
}

// 4. 操作栏
.action-footer {
  position: fixed;
  bottom: 0; left: 0; right: 0;
  padding: 32rpx 40rpx 60rpx;
  background: rgba(255,255,255,0.9);
  backdrop-filter: blur(10rpx);
  box-shadow: 0 -8rpx 24rpx rgba(0,0,0,0.04);
}
</style>
