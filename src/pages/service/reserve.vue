<template>
  <view class="container" :style="{ '--base-font-size': settingsStore.fontSize + 'px' }">
    <view class="service-summary">
      <text class="service-name" :style="{ fontSize: (settingsStore.fontSize + 4) + 'px' }">{{ serviceName }}</text>
      <text class="service-price">预估价格：¥{{ servicePrice }}</text>
    </view>

    <view class="form-section">
      <view class="form-item">
        <text class="label">预约时间</text>
        <picker mode="time" @change="onTimeChange">
          <view class="picker-val">{{ reservedTime || '点击选择时间 >' }}</view>
        </picker>
      </view>

      <view class="form-item">
        <text class="label">服务地址</text>
        <textarea 
          placeholder="请输入详细地址" 
          class="addr-area"
          v-model="address"
        ></textarea>
      </view>

      <view class="form-item">
        <text class="label">备注信息</text>
        <input type="text" placeholder="如有特别需求请注明" class="remark-input" v-model="remark" />
      </view>
    </view>

    <view class="bottom-bar">
      <elderly-button class="submit-btn" @click="handleConfirm">
        确认预约
      </elderly-button>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { onLoad } from '@dcloudio/uni-app';
import { useSettingsStore } from '@/stores/settings';
import ElderlyButton from '@/components/ElderlyButton.vue';

const settingsStore = useSettingsStore();

const serviceName = ref('助老服务');
const servicePrice = ref(0);
const reservedTime = ref('');
const address = ref('幸福小区1号楼101室');
const remark = ref('');

onLoad((options: any) => {
  if (options.name) serviceName.value = decodeURIComponent(options.name);
  if (options.id) servicePrice.value = options.id == 1 ? 15 : options.id == 2 ? 8 : 30;
});

const onTimeChange = (e: any) => {
  reservedTime.value = e.detail.value;
};

const handleConfirm = () => {
  if (!reservedTime.value) {
    uni.showToast({ title: '请选择时间', icon: 'none' });
    return;
  }
  uni.showLoading({ title: '提交预约...' });
  setTimeout(() => {
    uni.hideLoading();
    uni.showModal({
      title: '预约成功',
      content: '您的服务预约已成功提交，商家会在15分钟内确认单。',
      showCancel: false,
      success: () => {
        uni.switchTab({ url: '/pages/order/list' });
      }
    });
  }, 1000);
};
</script>

<style scoped lang="scss">
@import "@/styles/variables.scss";

.container { padding: 32rpx; background-color: #F8F9FA; min-height: 100vh; padding-bottom: 200rpx; }

.service-summary {
  background: #FFF;
  padding: 40rpx;
  border-radius: 20rpx;
  margin-bottom: 32rpx;
  .service-name { font-weight: bold; color: $text-color; display: block; margin-bottom: 12rpx; }
  .service-price { color: $danger-color; font-weight: bold; }
}

.form-section {
  background: #FFF;
  border-radius: 20rpx;
  padding: 0 32rpx;
  .form-item {
    padding: 32rpx 0;
    border-bottom: 1px solid #F5F5F5;
    &:last-child { border-bottom: none; }
    .label { font-weight: bold; color: $text-color; display: block; margin-bottom: 20rpx; }
    .picker-val { background: #F9F9F9; padding: 24rpx; border-radius: 12rpx; color: #333; }
    .addr-area { background: #F9F9F9; width: 100%; border-radius: 12rpx; padding: 20rpx; height: 160rpx; box-sizing: border-box; }
    .remark-input { background: #F9F9F9; width: 100%; height: 100rpx; border-radius: 12rpx; padding: 0 20rpx; box-sizing: border-box; }
  }
}

.bottom-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 32rpx;
  background: #FFF;
  box-shadow: 0 -4rpx 12rpx rgba(0,0,0,0.05);
  .submit-btn { margin: 0; }
}
</style>
