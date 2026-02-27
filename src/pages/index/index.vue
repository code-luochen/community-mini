<template>
  <view class="container" :style="{ '--base-font-size': settingsStore.fontSize + 'px' }">
    <!-- 自定义导航栏：解决微信小程序胶囊避让 -->
    <view class="custom-navbar" :style="{ paddingTop: statusBarHeight + 'px', height: navBarHeight + 'px' }">
      <view class="nav-content">
        <view class="greeting">
          <text class="weather-icon">🌤️</text>
          <text class="user-name" :style="{ fontSize: (settingsStore.fontSize + 2) + 'px' }">
            {{ userInfo?.nickname || '张爷爷' }}，{{ greeting }}
          </text>
        </view>
        <view class="nav-info">
          <text class="date">{{ currentDate }}</text>
        </view>
      </view>
    </view>

    <!-- 占位符，防止内容被固定导航栏遮挡 -->
    <view :style="{ height: (statusBarHeight + navBarHeight) + 'px' }"></view>

    <!-- 功能入口金刚区 -->
    <view class="grid-section">
      <view class="grid-item" v-for="item in gridItems" :key="item.path" @click="handleNavigate(item.path)">
        <view class="icon-box" :style="{ backgroundColor: item.color }">
          <text class="grid-icon">{{ item.icon }}</text>
        </view>
        <text class="grid-label" :style="{ fontSize: settingsStore.fontSize + 'px' }">{{ item.label }}</text>
      </view>
    </view>

    <!-- 今日推荐 -->
    <view class="section-card">
      <view class="section-title">
        <text class="title-text" :style="{ fontSize: (settingsStore.fontSize + 2) + 'px' }">🎯 今日推荐</text>
      </view>
      <view class="service-list">
        <view class="service-card" v-for="service in recommendations" :key="service.id">
          <image class="service-img" src="https://img.js.design/assets/illustration/63f46f48a97217578205691e/preview.png" mode="aspectFill" />
          <view class="service-info">
            <text class="service-name" :style="{ fontSize: settingsStore.fontSize + 'px' }">{{ service.name }}</text>
            <view class="service-bottom">
              <text class="service-price">¥{{ service.price }}</text>
              <elderly-button class="mini-btn" @click="handleBooking(service)">
                立即预约
              </elderly-button>
            </view>
          </view>
        </view>
      </view>
    </view>

    <!-- 固定底部 SOS 按钮 -->
    <view class="sos-container">
      <view class="sos-btn" @click="handleSOS">
        <text class="sos-text">🔴 一 键 紧 急 求 助</text>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { onLoad } from '@dcloudio/uni-app';
import { useSettingsStore } from '@/stores/settings';
import { useUserStore } from '@/stores/user';
import ElderlyButton from '@/components/ElderlyButton.vue';

const settingsStore = useSettingsStore();
const userStore = useUserStore();
const userInfo = computed(() => userStore.userInfo);

// 系统信息
const statusBarHeight = ref(20);
const navBarHeight = ref(44);

// 业务数据
const greeting = ref('下午好！');
const currentDate = ref('2026年2月27日 星期五');
const gridItems = [
  { label: '服务预约', icon: '📋', path: '/pages/service/list', color: '#E8F3FF' },
  { label: '健康记录', icon: '🩺', path: '/pages/health/record', color: '#EEFBF5' },
  { label: '求助记录', icon: '🆘', path: '/pages/health/index', color: '#FFF2F2' },
  { label: '订单管理', icon: '📦', path: '/pages/order/list', color: '#FFF8E6' }
];

const recommendations = ref([
  { id: 1, name: '送餐服务', price: 15, star: 4.8 },
  { id: 2, name: '药品配送', price: 8, star: 4.9 },
  { id: 3, name: '上门理发', price: 30, star: 4.7 }
]);

onLoad(() => {
  // 获取胶囊按钮位置 (仅小程序)
  // #ifdef MP-WEIXIN
  const menuButton = uni.getMenuButtonBoundingClientRect();
  const res = uni.getSystemInfoSync();
  statusBarHeight.value = res.statusBarHeight || 20;
  navBarHeight.value = (menuButton.top - statusBarHeight.value) * 2 + menuButton.height;
  // #endif

  // 设置问候语
  const hour = new Date().getHours();
  if (hour < 12) greeting.value = '上午好！';
  else if (hour < 18) greeting.value = '下午好！';
  else greeting.value = '晚上好！';
});

const handleNavigate = (path: string) => {
  uni.navigateTo({ url: path });
};

const handleBooking = (service: any) => {
  uni.navigateTo({
    url: `/pages/service/reserve?id=${service.id}&name=${encodeURIComponent(service.name)}`
  });
};

const handleSOS = () => {
  uni.showModal({
    title: '紧急求助',
    content: '确定需要紧急帮助吗？系统将立即通知您的家属和管理员。',
    confirmColor: '#D54941',
    success: (res) => {
      if (res.confirm) {
        uni.showLoading({ title: '求助发送中...' });
        setTimeout(() => {
          uni.hideLoading();
          uni.showToast({ title: '求助已发出', icon: 'success' });
        }, 1500);
      }
    }
  });
};
</script>

<style scoped lang="scss">
@import "@/styles/variables.scss";

.container {
  min-height: 100vh;
  background-color: #F5F5F5;
  padding-bottom: 200rpx; // 为底部求助按钮留空
}

.custom-navbar {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  background-color: #FFFFFF;
  z-index: 1000;
  .nav-content {
    display: flex;
    flex-direction: column;
    justify-content: center;
    padding: 0 32rpx;
    height: 100%;
  }
  .greeting {
    display: flex;
    align-items: center;
    .user-name {
      font-weight: bold;
      color: $text-color;
      margin-left: 12rpx;
    }
  }
  .nav-info {
    font-size: 24rpx;
    color: $text-color-light;
    margin-top: 4rpx;
  }
}

.grid-section {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 24rpx;
  padding: 32rpx;
  .grid-item {
    background-color: #FFFFFF;
    border-radius: 24rpx;
    padding: 40rpx 0;
    display: flex;
    flex-direction: column;
    align-items: center;
    box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.05);
    .icon-box {
      width: 100rpx;
      height: 100rpx;
      border-radius: 50rpx;
      display: flex;
      justify-content: center;
      align-items: center;
      margin-bottom: 16rpx;
      .grid-icon {
        font-size: 50rpx;
      }
    }
    .grid-label {
      font-weight: bold;
      color: $text-color;
    }
  }
}

.section-card {
  margin: 0 32rpx;
  background-color: #FFFFFF;
  border-radius: 24rpx;
  padding: 32rpx;
  .section-title {
    margin-bottom: 24rpx;
    .title-text {
      font-weight: bold;
      color: $text-color;
    }
  }
}

.service-list {
  display: flex;
  flex-direction: column;
  gap: 24rpx;
}

.service-card {
  display: flex;
  gap: 20rpx;
  padding-bottom: 24rpx;
  border-bottom: 1px solid #F0F0F0;
  &:last-child {
    border-bottom: none;
    padding-bottom: 0;
  }
  .service-img {
    width: 160rpx;
    height: 160rpx;
    border-radius: 12rpx;
    background-color: #F9F9F9;
  }
  .service-info {
    flex: 1;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    .service-name {
      font-weight: bold;
      color: $text-color;
    }
    .service-bottom {
      display: flex;
      justify-content: space-between;
      align-items: center;
      .service-price {
        font-size: 36rpx;
        color: $danger-color;
        font-weight: bold;
      }
      .mini-btn {
        margin: 0;
        min-height: 80rpx;
        padding: 0 24rpx;
      }
    }
  }
}

.sos-container {
  position: fixed;
  bottom: 40rpx;
  left: 32rpx;
  right: 32rpx;
  z-index: 99;
  .sos-btn {
    height: 120rpx;
    background-color: $danger-color;
    border-radius: 60rpx;
    display: flex;
    justify-content: center;
    align-items: center;
    box-shadow: 0 8rpx 20rpx rgba(213, 73, 65, 0.3);
    &:active {
      opacity: 0.9;
    }
    .sos-text {
      color: #FFFFFF;
      font-size: 36rpx;
      font-weight: bold;
    }
  }
}
</style>
