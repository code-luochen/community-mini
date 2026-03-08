<template>
  <view class="container" :style="{ '--base-font-size': settingsStore.fontSize + 'px' }">
    <view class="service-summary">
      <text class="service-name" :style="{ fontSize: (settingsStore.fontSize + 4) + 'px' }">{{ serviceName }}</text>
      <text class="service-price">预估价格：¥{{ Number(servicePrice).toFixed(2) }}</text>
    </view>

    <view class="form-section">
      <view class="form-item">
        <text class="label">预约日期</text>
        <picker mode="date" @change="onDateChange">
          <view class="picker-val">{{ reservedDate || '点击选择日期 >' }}</view>
        </picker>
      </view>

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
      <elderly-button class="submit-btn" :loading="isSubmitting" @click="handleConfirm">
        确认预约
      </elderly-button>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { onLoad } from '@dcloudio/uni-app';
import { useSettingsStore } from '@/stores/settings';
import { getServiceDetail } from '@/api/service';
import { createOrder } from '@/api/order';
import { getMyProfile } from '@/api/profile';
import ElderlyButton from '@/components/ElderlyButton.vue';

const settingsStore = useSettingsStore();

const serviceId = ref('');
const serviceName = ref('');
const servicePrice = ref(0);
const merchantId = ref('');
const serviceDesc = ref('');

// 默认今天
const today = new Date();
const y = today.getFullYear();
const m = String(today.getMonth() + 1).padStart(2, '0');
const d = String(today.getDate()).padStart(2, '0');

const reservedDate = ref(`${y}-${m}-${d}`);
const reservedTime = ref('');
const address = ref('');
const houseId = ref<number | undefined>(undefined);
const remark = ref('');
const isSubmitting = ref(false);

const onDateChange = (e: any) => {
  reservedDate.value = e.detail.value;
};

const onTimeChange = (e: any) => {
  reservedTime.value = e.detail.value;
};

onLoad(async (options: any) => {
  if (options.id) {
    serviceId.value = options.id;
    // 获取详情以获取 merchantId
    try {
      const res = await getServiceDetail(options.id);
      if (res.data) {
        serviceName.value = res.data.name;
        servicePrice.value = res.data.price;
        merchantId.value = res.data.merchantId;
        serviceDesc.value = res.data.description;
      }
    } catch (e: any) {
      uni.showToast({ title: '加载服务详情失败', icon: 'none' });
    }
  }
  
  // 加载个人档案获取默认地址
  try {
    const profileRes = await getMyProfile();
    const profile = profileRes.data;
    if (profile) {
      if (profile.house) {
        const h = profile.house;
        address.value = `${h.community?.name || ''} ${h.buildingNo}-${h.unitNo}-${h.roomNo}`;
        houseId.value = profile.houseId ?? undefined;
      }
    }
  } catch (e) {}
});

const handleConfirm = async () => {
  if (!reservedDate.value || !reservedTime.value) {
    uni.showToast({ title: '请选择完整的预约时间', icon: 'none' });
    return;
  }
  if (!address.value) {
    uni.showToast({ title: '请输入服务地址', icon: 'none' });
    return;
  }

  isSubmitting.value = true;
  uni.showLoading({ title: '提交中...' });

  const serviceTimeIso = new Date(`${reservedDate.value}T${reservedTime.value}:00+08:00`).toISOString();

  // 获取当前用户ID作为 elderlyId。通常从小程序全局状态或 localStorage 拿，这里演示用
  // TODO: 如果有 userStore 可以直接用 userStore.userInfo.id
  let currentUserId = '1';
  try {
    const userInfoStr = uni.getStorageSync('userInfo');
    if (userInfoStr) {
      const userInfo = JSON.parse(userInfoStr);
      currentUserId = String(userInfo.id);
    }
  } catch (e) {}

  try {
    await createOrder({
      elderlyId: currentUserId,
      merchantId: merchantId.value,
      serviceId: serviceId.value,
      serviceSnapshot: {
        name: serviceName.value,
        price: servicePrice.value,
        description: serviceDesc.value
      },
      serviceTime: serviceTimeIso,
      address: address.value,
      houseId: houseId.value,
      remark: remark.value
    });

    uni.hideLoading();
    uni.showModal({
      title: '预约成功',
      content: '您的服务预约已成功提交，商家会在尽快确认。',
      showCancel: false,
      success: () => {
        // 返回订单列表
        uni.switchTab({ url: '/pages/order/list' });
      }
    });

  } catch (err: any) {
    uni.hideLoading();
    uni.showToast({ title: err.message || '预约失败', icon: 'none' });
  } finally {
    isSubmitting.value = false;
  }
};
</script>

<style scoped lang="scss">
@import "@/styles/variables.scss";

.container { 
  padding: 32rpx; 
  background-color: #F8F9FA; 
  min-height: 100vh; 
  padding-bottom: 200rpx; 
}

.service-summary {
  background: #FFF;
  padding: 40rpx;
  border-radius: 20rpx;
  margin-bottom: 32rpx;
  .service-name { font-weight: bold; color: $text-color; display: block; margin-bottom: 12rpx; }
  .service-price { color: $danger-color; font-weight: bold; font-size: 34rpx; }
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
