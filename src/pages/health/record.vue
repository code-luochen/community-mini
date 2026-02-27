<template>
  <view class="container" :style="{ '--base-font-size': settingsStore.fontSize + 'px' }">
    <view class="header">
      <text class="header-title" :style="{ fontSize: (settingsStore.fontSize + 4) + 'px' }">录入今日健康数据</text>
      <text class="header-desc">请保持心情平静，如实记录</text>
    </view>

    <!-- 血压录入 -->
    <view class="input-card">
      <view class="card-title">
        <text class="icon">🩸</text>
        <text :style="{ fontSize: (settingsStore.fontSize + 2) + 'px' }">血压 (mmHg)</text>
      </view>
      <view class="multi-input">
        <view class="input-group">
          <text class="label">收缩压 (高压)</text>
          <input 
            type="number" 
            v-model="healthData.systolic_bp" 
            placeholder="如 120"
            class="large-input"
            :class="{ 'warn-bg': checkBPStatus(healthData.systolic_bp, 'systolic') !== 'normal' }"
          />
        </view>
        <view class="divider">/</view>
        <view class="input-group">
          <text class="label">舒张压 (低压)</text>
          <input 
            type="number" 
            v-model="healthData.diastolic_bp" 
            placeholder="如 80"
            class="large-input"
            :class="{ 'warn-bg': checkBPStatus(healthData.diastolic_bp, 'diastolic') !== 'normal' }"
          />
        </view>
      </view>
      <view v-if="bpWarning" class="warning-text">
        ❗ 当前血压数值不在正常范围内
      </view>
    </view>

    <!-- 心率录入 -->
    <view class="input-card">
      <view class="card-title">
        <text class="icon">💓</text>
        <text :style="{ fontSize: (settingsStore.fontSize + 2) + 'px' }">心率 (次/分)</text>
      </view>
      <input 
        type="number" 
        v-model="healthData.heart_rate" 
        placeholder="如 75"
        class="large-input"
        :class="{ 'warn-bg': checkHRStatus(healthData.heart_rate) !== 'normal' }"
      />
    </view>

    <!-- 血糖录入 -->
    <view class="input-card">
      <view class="card-title">
        <text class="icon">🍬</text>
        <text :style="{ fontSize: (settingsStore.fontSize + 2) + 'px' }">血糖 (mmol/L)</text>
      </view>
      <input 
        type="digit" 
        v-model="healthData.blood_sugar" 
        placeholder="如 5.5"
        class="large-input"
      />
    </view>

    <!-- 提交按钮 -->
    <view class="submit-area">
      <elderly-button class="submit-btn" @click="handleSubmit">
        提交记录
      </elderly-button>
      <text class="tip">家属和管理员将同步收到您的记录</text>
    </view>
  </view>
</template>

<script setup lang="ts">
import { reactive, computed } from 'vue';
import { useSettingsStore } from '@/stores/settings';
import ElderlyButton from '@/components/ElderlyButton.vue';

const settingsStore = useSettingsStore();

const healthData = reactive({
  systolic_bp: '',
  diastolic_bp: '',
  heart_rate: '',
  blood_sugar: '',
  temperature: '36.5'
});

const checkBPStatus = (val: string, type: 'systolic' | 'diastolic') => {
  const v = parseInt(val);
  if (isNaN(v)) return 'normal';
  if (type === 'systolic') {
    if (v >= 140) return 'high';
    if (v < 90) return 'low';
  } else {
    if (v >= 90) return 'high';
    if (v < 60) return 'low';
  }
  return 'normal';
};

const checkHRStatus = (val: string) => {
  const v = parseInt(val);
  if (isNaN(v)) return 'normal';
  if (v > 100 || v < 60) return 'abnormal';
  return 'normal';
};

const bpWarning = computed(() => {
  return checkBPStatus(healthData.systolic_bp, 'systolic') !== 'normal' || 
         checkBPStatus(healthData.diastolic_bp, 'diastolic') !== 'normal';
});

const handleSubmit = () => {
  if (!healthData.systolic_bp || !healthData.diastolic_bp || !healthData.heart_rate) {
    uni.showToast({ title: '请填写核心指标', icon: 'none' });
    return;
  }

  // 模拟提交
  uni.showLoading({ title: '保存中...' });
  setTimeout(() => {
    uni.hideLoading();
    
    if (bpWarning.value) {
      uni.showModal({
        title: '健康提醒',
        content: '您的血压数值偏离正常范围，系统已自动通知您的家属。请坐下休息，稍后再次测量。',
        showCancel: false,
        confirmText: '我知道了'
      });
    } else {
      uni.showToast({ title: '保存成功', icon: 'success' });
      setTimeout(() => uni.navigateBack(), 1500);
    }
  }, 1000);
};
</script>

<style scoped lang="scss">
@import "@/styles/variables.scss";

.container {
  padding: 32rpx;
  background-color: #F8F9FB;
  min-height: 100vh;
}

.header {
  margin-bottom: 40rpx;
  .header-title {
    font-weight: bold;
    color: $text-color;
    display: block;
  }
  .header-desc {
    font-size: 28rpx;
    color: $text-color-light;
    margin-top: 8rpx;
    display: block;
  }
}

.input-card {
  background-color: #FFFFFF;
  border-radius: 24rpx;
  padding: 32rpx;
  margin-bottom: 24rpx;
  box-shadow: 0 4rpx 10rpx rgba(0,0,0,0.02);
  
  .card-title {
    display: flex;
    align-items: center;
    margin-bottom: 24rpx;
    font-weight: bold;
    color: $text-color;
    .icon { margin-right: 12rpx; }
  }
}

.multi-input {
  display: flex;
  align-items: center;
  gap: 20rpx;
  .input-group {
    flex: 1;
    .label {
      font-size: 24rpx;
      color: $text-color-light;
      margin-bottom: 12rpx;
      display: block;
    }
  }
  .divider {
    font-size: 40rpx;
    color: #DDD;
    padding-top: 40rpx;
  }
}

.large-input {
  background-color: #F5F7FA;
  height: 110rpx;
  border-radius: 16rpx;
  padding: 0 24rpx;
  font-size: 44rpx;
  font-weight: bold;
  color: $text-color;
}

.warn-bg {
  background-color: #FFF2F2;
  border: 2rpx solid $danger-color;
  color: $danger-color;
}

.warning-text {
  color: $danger-color;
  font-size: 26rpx;
  margin-top: 16rpx;
  font-weight: bold;
}

.submit-area {
  margin-top: 60rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  .submit-btn {
    width: 100%;
    height: 110rpx;
    margin-bottom: 20rpx;
  }
  .tip {
    font-size: 24rpx;
    color: $text-color-light;
  }
}
</style>
