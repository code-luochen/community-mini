<template>
  <view class="container" :style="{ '--base-font-size': settingsStore.fontSize + 'px' }">
    <!-- 1. 顶部大型健康卡片 (Hero Health Status) -->
    <view class="health-hero-card" :class="{ 'hero-abnormal': isAbnormalStatus }">
       <view class="hero-bg-decor"></view>
       <view class="hero-content">
         <view class="status-indicator">
           <view class="inner-circle">
             <text class="status-icon">{{ isAbnormalStatus ? '⚠️' : '🛡️' }}</text>
           </view>
         </view>
         <view class="status-info">
           <text class="status-title" :style="{ fontSize: (settingsStore.fontSize + 8) + 'px' }">{{ isAbnormalStatus ? '健康出现异常' : '健康状态良好' }}</text>
           <text class="status-desc">{{ isAbnormalStatus ? '已通知家属，请注意休息' : '系统已为您全天候守护中' }}</text>
         </view>
       </view>
       <view class="update-info">
         <text class="time">最后更新：{{ updateTime }}</text>
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



    <!-- 4. 固定操作栏 -->
    <view class="action-footer">
      <elderly-button @click="handleRecord">录入今日数据</elderly-button>
      <view class="history-link" @click="handleHistory">
        <text>查看历史记录</text>
      </view>
    </view>

    <!-- 悬浮球：模拟设备同步 -->
    <view class="fab-simulate-btn" :class="{ 'is-syncing': isSyncing }" @click="handleSimulateDevice">
      <view class="fab-icon">{{ isSyncing ? '🔄' : '⌚' }}</view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { onShow } from '@dcloudio/uni-app';
import { useSettingsStore } from '@/stores/settings';
import { useUserStore } from '@/stores/user';
import ElderlyButton from '@/components/ElderlyButton.vue';
import { getHealthRecords, createHealthRecord } from '@/api/health';

const settingsStore = useSettingsStore();
const userStore = useUserStore();

const updateTime = ref('暂无数据');
const isAbnormalStatus = ref(false);
const isSyncing = ref(false);



const latestData = ref([
  { label: '血压', value: '-/-', unit: 'mmHg', icon: '🩸', statusType: 'normal', statusText: '未知' },
  { label: '心率', value: '-', unit: '次/分', icon: '💓', statusType: 'normal', statusText: '未知' },
  { label: '血糖', value: '-', unit: 'mmol/L', icon: '🍬', statusType: 'normal', statusText: '未知' },
  { label: '体温', value: '-', unit: '℃', icon: '🌡️', statusType: 'normal', statusText: '未知' }
]);

const fetchHealthData = async () => {
  try {
    const res: any = await getHealthRecords({ elderlyId: userStore.userInfo?.id });
    const resData = res.data || res;
    const records = resData.items || (Array.isArray(resData) ? resData : []);

    if (records && records.length > 0) {
      const latest = records[0];
      
      let timeStr = latest.record_time || latest.createdAt;
      let recordDate = new Date(timeStr);
      if (isNaN(recordDate.getTime()) && typeof timeStr === 'string') {
        const safeStr = timeStr.replace(/-/g, '/').replace('T', ' ').replace('Z', '');
        recordDate = new Date(safeStr);
      }

      // 强制加 8 小时
      recordDate.setHours(recordDate.getHours() + 8);

      updateTime.value = `${recordDate.getMonth()+1}月${recordDate.getDate()}日 ${recordDate.getHours().toString().padStart(2,'0')}:${recordDate.getMinutes().toString().padStart(2,'0')}`;
      
      isAbnormalStatus.value = latest.is_abnormal === 1;

      latestData.value = [
        { 
          label: '血压', 
          value: `${latest.systolicBp || '-'}/${latest.diastolicBp || '-'}`, 
          unit: 'mmHg', 
          icon: '🩸', 
          statusType: (latest.systolicBp >= 140 || latest.diastolicBp >= 90 || latest.systolicBp < 90 || latest.diastolicBp < 60) ? 'warning' : 'normal', 
          statusText: (latest.systolicBp >= 140 || latest.diastolicBp >= 90) ? '偏高' : ((latest.systolicBp < 90 || latest.diastolicBp < 60) ? '偏低' : '正常')
        },
        { 
          label: '心率', 
          value: latest.heartRate || '-', 
          unit: '次/分', icon: '💓', 
          statusType: (latest.heartRate > 100 || latest.heartRate < 60) ? 'warning' : 'normal', 
          statusText: (latest.heartRate > 100) ? '偏高' : (latest.heartRate < 60 ? '偏低' : '平稳')
        },
        { 
          label: '血糖', 
          value: latest.bloodSugar || '-', 
          unit: 'mmol/L', icon: '🍬', 
          statusType: (latest.bloodSugar > 7.0 || latest.bloodSugar < 3.9) ? 'warning' : 'normal', 
          statusText: latest.bloodSugar > 7.0 ? '偏高' : (latest.bloodSugar < 3.9 ? '偏低' : '正常')
        },
        { 
          label: '体温', 
          value: latest.temperature || '-', 
          unit: '℃', icon: '🌡️', 
          statusType: latest.temperature > 37.3 ? 'warning' : 'normal', 
          statusText: latest.temperature > 37.3 ? '异常' : '正常' 
        }
      ];


    }
  } catch (err) {
    console.error('Failed to load records', err);
  }
};

onShow(() => {
  fetchHealthData();
});

const handleRecord = () => {
  uni.navigateTo({ url: '/pages/health/record' });
};

const handleHistory = () => {
  uni.navigateTo({ url: '/pages/health/history' });
};

const handleSimulateDevice = async () => {
  if (isSyncing.value) return;
  isSyncing.value = true;
  uni.showToast({ title: '正在连接设备...', icon: 'none' });

  // 模拟异步同步动画时长
  await new Promise(resolve => setTimeout(resolve, 2000));

  try {
    const systolicBp = Math.floor(Math.random() * (150 - 100 + 1)) + 100;
    const diastolicBp = Math.floor(Math.random() * (95 - 60 + 1)) + 60;
    const heartRate = Math.floor(Math.random() * (105 - 60 + 1)) + 60;
    const bloodSugar = parseFloat((Math.random() * (8.5 - 4.0) + 4.0).toFixed(1));
    const temperature = parseFloat((Math.random() * (37.8 - 36.1) + 36.1).toFixed(1));
    await createHealthRecord({
      elderlyId: userStore.userInfo?.id || '',
      systolicBp,
      diastolicBp,
      heartRate,
      bloodSugar,
      temperature
    });
    
    uni.showToast({ title: '设备数据同步成功', icon: 'success' });
    await fetchHealthData(); // 重新拉取展示
  } catch (error) {
    uni.showToast({ title: '同步失败', icon: 'none' });
  } finally {
    isSyncing.value = false;
  }
};
</script>

<style scoped lang="scss">
@import "@/styles/variables.scss";

.container {
  padding: 32rpx;
  background-color: $bg-color;
  min-height: 100vh;
  padding-bottom: 300rpx;
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

.health-hero-card.hero-abnormal {
  background: linear-gradient(135deg, #FF6B6B 0%, #EE5253 100%);
  box-shadow: 0 12rpx 32rpx rgba(238, 82, 83, 0.2);
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



// 4. 操作栏
.action-footer {
  position: fixed;
  bottom: 0; left: 0; right: 0;
  padding: 32rpx 40rpx 60rpx;
  background: rgba(255,255,255,0.9);
  backdrop-filter: blur(10rpx);
  box-shadow: 0 -8rpx 24rpx rgba(0,0,0,0.04);
  
  .history-link {
    text-align: center;
    padding: 20rpx 0;
    margin-top: 10rpx;
    font-size: 28rpx;
    color: $primary-color;
    font-weight: bold;
  }

}

// 悬浮球
.fab-simulate-btn {
  position: fixed;
  right: 40rpx;
  bottom: 240rpx;
  width: 120rpx;
  height: 120rpx;
  background: linear-gradient(135deg, $primary-color 0%, $secondary-color 100%);
  border-radius: 60rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 8rpx 24rpx rgba(8, 145, 178, 0.4);
  z-index: 100;
  transition: transform 0.2s;

  &:active {
    transform: scale(0.95);
  }

  .fab-icon {
    font-size: 56rpx;
    display: inline-block;
  }

  &.is-syncing {
    .fab-icon {
      animation: spin 1.2s linear infinite;
    }
  }
}

@keyframes spin {
  100% {
    transform: rotate(360deg);
  }
}
</style>
