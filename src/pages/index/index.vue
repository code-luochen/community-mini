<template>
  <view class="home-container" :style="{ '--base-font-size': settingsStore.fontSize + 'px' }">
    <!-- 1. 沉浸式大顶部区域 (Extended Hero Section) -->
    <view class="hero-section">
      <!-- 状态栏占位 -->
      <view :style="{ height: statusBarHeight + 'px' }"></view>
      
      <!-- 顶部信息流 -->
      <view class="hero-content" :style="{ minHeight: (navBarHeight + 120) + 'px' }">
        <view class="user-greeting">
          <view class="avatar-box">
             <image class="avatar" src="https://img.js.design/assets/illustration/63f46f48a97217578205691e/preview.png" mode="aspectFill" />
          </view>
          <view class="greeting-text">
            <text class="title" :style="{ fontSize: (settingsStore.fontSize + 6) + 'px' }">
              {{ userInfo?.nickname || userInfo?.username }}，{{ greeting }}
            </text>
            <text class="subtitle" :style="{ fontSize: settingsStore.fontSize + 'px' }">
              愿您今天平安健康，心情舒畅
            </text>
          </view>
          <view class="bell-box" @click="handleNavigate('/pages/notification/index')">
            <u-icon name="bell" color="#FFFFFF" size="44"></u-icon>
            <view v-if="unreadCount > 0" class="badge">{{ unreadCount > 99 ? '99+' : unreadCount }}</view>
          </view>
        </view>
        
        <view class="weather-pill">
          <text class="icon">🌤️</text>
          <view class="info">
            <text class="temp" :style="{ fontSize: settingsStore.fontSize + 'px' }">22°C</text>
            <text class="city">多云 · 适宜活动</text>
          </view>
        </view>
      </view>
    </view>

    <!-- 2. 功能金刚区 (Floated Category Grid) -->
    <view class="main-content">
      <view class="grid-card">
        <view 
          class="grid-item" 
          v-for="item in gridItems" 
          :key="item.path" 
          @click="handleNavigate(item.path)"
          class-active="item-active"
        >
          <view class="icon-wrap" :style="{ backgroundColor: item.color }">
            <u-icon :name="item.icon" size="64" :color="item.iconColor"></u-icon>
          </view>
          <text class="label" :style="{ fontSize: settingsStore.fontSize + 'px' }">{{ item.label }}</text>
        </view>
      </view>

      <!-- 3. 健康概览小卡片 (Quick Health Summary) -->
      <view class="section-container">
        <view class="health-summary-card" @click="handleNavigate('/pages/health/index')">
          <view class="card-header">
             <text class="card-title">💓 健康守护</text>
             <text class="time">最后记录：今天 10:30</text>
          </view>
          <view class="card-body">
            <view class="indicator">
              <text class="val">128/82</text>
              <text class="unit">血压</text>
            </view>
            <view class="divider"></view>
            <view class="indicator">
              <text class="val">72</text>
              <text class="unit">心率</text>
            </view>
            <u-button type="primary" size="mini" shape="circle" :plain="true" class="record-btn">去记录</u-button>
          </view>
        </view>
      </view>

      <!-- 4. 服务推荐区 (Service Recommendations) -->
      <view class="section-container">
        <view class="section-header">
          <text class="section-title">✨ 为您甄选</text>
          <text class="more" @click="handleNavigate('/pages/service/list')">查看全部</text>
        </view>
        <view class="service-scroll">
          <view 
            class="service-item" 
            v-for="service in recommendations" 
            :key="service.id"
            @click="handleBooking(service)"
          >
            <image class="service-img" :src="service.img" mode="aspectFill" />
            <view class="service-info">
              <text class="name" :style="{ fontSize: settingsStore.fontSize + 'px' }">{{ service.name }}</text>
              <view class="price-row">
                <text class="price">¥{{ service.price }}</text>
                <text class="unit">/次</text>
              </view>
            </view>
          </view>
        </view>
      </view>
    </view>

    <!-- 5. 紧急求救 (SOS Floating Action Button) -->
    <view class="sos-wrapper">
      <view class="sos-btn-outer" @click="handleSOS">
        <view class="sos-btn-inner">
           <text class="sos-icon">🆘</text>
           <text class="sos-label">紧急求助</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { onLoad, onShow } from '@dcloudio/uni-app';
import { useSettingsStore } from '@/stores/settings';
import { useUserStore } from '@/stores/user';
import { createEmergency } from '@/api/emergency';
import { getUnreadCount } from '@/api/notification';

const settingsStore = useSettingsStore();
const userStore = useUserStore();
const userInfo = computed(() => userStore.userInfo);

// 系统高度适配
const statusBarHeight = ref(20);
const navBarHeight = ref(44);

// 业务状态
const greeting = ref('下午好');
const gridItems = [
  { label: '服务预约', icon: 'order', iconColor: '#0891B2', color: '#E0F2FE', path: '/pages/service/list' },
  { label: '健康记录', icon: 'heart', iconColor: '#22C55E', color: '#F0FDF4', path: '/pages/health/record' },
  { label: '订单管理', icon: 'bag', iconColor: '#F59E0B', color: '#FFFBEB', path: '/pages/order/list' },
  { label: '我的家属', icon: 'man-add', iconColor: '#8B5CF6', color: '#F5F3FF', path: '/pages/profile/index' }
];

const recommendations = ref([
  { id: 1, name: '营养午餐送餐', price: 15, img: 'https://img.js.design/assets/illustration/63f46f48a97217578205691e/preview.png' },
  { id: 2, name: '专业康复理疗', price: 120, img: 'https://img.js.design/assets/illustration/63f46f4a21578205691e/preview.png' },
  { id: 3, name: '暖心陪诊服务', price: 80, img: 'https://img.js.design/assets/illustration/63f46f48a97217578205691e/preview.png' }
]);

onLoad(() => {
  // 1. 登录校验
  if (!userStore.token) {
    uni.reLaunch({ url: '/pages/login/index' });
    return;
  }

  // 2. 导航栏适配
  // #ifdef MP-WEIXIN
  const menuButton = uni.getMenuButtonBoundingClientRect();
  const res = uni.getSystemInfoSync();
  statusBarHeight.value = res.statusBarHeight || 20;
  navBarHeight.value = (menuButton.top - statusBarHeight.value) * 2 + menuButton.height;
  // #endif

  // 3. 动态问候
  const hour = new Date().getHours();
  if (hour < 6) greeting.value = '凌晨好';
  else if (hour < 11) greeting.value = '上午好';
  else if (hour < 13) greeting.value = '中午好';
  else if (hour < 18) greeting.value = '下午好';
  else greeting.value = '晚上好';
});

const unreadCount = ref(0);
const fetchUnreadCount = async () => {
  if (!userStore.token) return;
  try {
    const res: any = await getUnreadCount();
    unreadCount.value = res.data || 0;
  } catch (err) {
    // ignore
  }
};

onShow(() => {
  fetchUnreadCount();
});

const handleNavigate = (url: string) => {
  const tabPages = ['/pages/index/index', '/pages/health/index', '/pages/order/list', '/pages/profile/index'];
  if (tabPages.includes(url.split('?')[0])) {
    uni.switchTab({ url });
  } else {
    uni.navigateTo({ url });
  }
};
const handleBooking = (service: any) => {
  uni.navigateTo({
    url: `/pages/service/reserve?id=${service.id}&name=${encodeURIComponent(service.name)}`
  });
};

const handleSOS = () => {
  uni.showModal({
    title: '紧急求助确认',
    content: '确定向家属及社区管家发送求援信号？（误触请点击取消）',
    confirmText: '立刻呼叫',
    confirmColor: '#E11D48',
    success: (res) => {
      if (res.confirm) {
        uni.showLoading({ title: '定位中...' });
        uni.getLocation({
          type: 'gcj02',
          success: async (locationRes) => {
            const locationStr = `纬度: ${locationRes.latitude}, 经度: ${locationRes.longitude}`;
            try {
              uni.showLoading({ title: '呼叫中...' });
              await createEmergency({ location: locationStr, remark: '页面一键紧急求助' });
              uni.hideLoading();
              uni.showToast({ title: '信号已发出，请保持电话通畅', icon: 'success', duration: 3000 });
            } catch (err: any) {
              uni.hideLoading();
              uni.showToast({ title: err.message || '发送失败，请直接拨打急救电话', icon: 'none', duration: 3000 });
            }
          },
          fail: async () => {
            try {
              uni.showLoading({ title: '呼叫中...' });
              await createEmergency({ location: '定位失败/未授权', remark: '页面一键紧急求助(无坐标)' });
              uni.hideLoading();
              uni.showToast({ title: '信号发出，位置暂缺，请等待电话', icon: 'success', duration: 3000 });
            } catch (err: any) {
              uni.hideLoading();
              uni.showToast({ title: err.message || '发送失败，请直接拨打紧急电话', icon: 'none', duration: 3000 });
            }
          }
        });
      }
    }
  });
};
</script>

<style scoped lang="scss">
@import "@/styles/variables.scss";

.home-container {
  min-height: 100vh;
  background-color: $bg-color;
  padding-bottom: 240rpx;
}

// 1. Hero 顶部大感官区
.hero-section {
  background: linear-gradient(135deg, $primary-color 0%, $secondary-color 100%);
  border-bottom-left-radius: 64rpx;
  border-bottom-right-radius: 64rpx;
  color: #FFFFFF;
  padding: 0 40rpx 80rpx;

  .hero-content {
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    padding-top: 20rpx;
  }

  .user-greeting {
    display: flex;
    align-items: center;
    gap: 24rpx;
    margin-bottom: 40rpx;
    
    .avatar-box {
      width: 120rpx;
      height: 120rpx;
      border-radius: 60rpx;
      border: 4rpx solid rgba(255,255,255,0.4);
      overflow: hidden;
      background: $primary-light;
      .avatar { width: 100%; height: 100%; }
    }

    .greeting-text {
      flex: 1;
      .title { font-weight: 800; display: block; margin-bottom: 8rpx; }
      .subtitle { color: rgba(255,255,255,0.85); display: block; }
    }
    
    .bell-box {
      position: relative;
      width: 80rpx;
      height: 80rpx;
      display: flex;
      align-items: center;
      justify-content: center;
      background: rgba(255,255,255,0.2);
      border-radius: 50%;
      margin-left: 12rpx;
      
      &:active {
        opacity: 0.8;
      }
      
      .badge {
        position: absolute;
        top: -4rpx;
        right: -8rpx;
        background: $danger-color;
        color: #FFFFFF;
        font-size: 20rpx;
        font-weight: bold;
        padding: 4rpx 10rpx;
        border-radius: 20rpx;
      }
    }
  }

  .weather-pill {
    align-self: flex-start;
    background: rgba(255,255,255,0.15);
    backdrop-filter: blur(10rpx);
    border-radius: 40rpx;
    padding: 16rpx 32rpx;
    display: flex;
    align-items: center;
    gap: 16rpx;
    border: 1rpx solid rgba(255,255,255,0.2);
    
    .icon { font-size: 40rpx; }
    .info {
       display: flex;
       flex-direction: column;
       .temp { font-weight: bold; }
       .city { font-size: 24rpx; opacity: 0.8; }
    }
  }
}

// 2. 浮动内容区
.main-content {
  margin-top: -60rpx;
  padding: 0 32rpx;
}

// 金刚区卡片
.grid-card {
  background: #FFFFFF;
  border-radius: 40rpx;
  padding: 40rpx 20rpx;
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  box-shadow: $card-shadow;
  margin-bottom: 32rpx;

  .grid-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 16rpx;
    &:active { opacity: 0.7; transform: scale(0.95); transition: all 0.2s; }
    
    .icon-wrap {
      width: 100rpx;
      height: 100rpx;
      border-radius: 32rpx;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    
    .label {
      font-weight: bold;
      color: $text-color;
    }
  }
}

// 指标卡片
.health-summary-card {
  background: #FFFFFF;
  border-radius: 40rpx;
  padding: 32rpx;
  box-shadow: $item-shadow;
  margin-bottom: 32rpx;
  
  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 24rpx;
    .card-title { font-weight: bold; color: $text-color; font-size: 36rpx; }
    .time { font-size: 24rpx; color: $text-color-muted; }
  }

  .card-body {
    display: flex;
    align-items: center;
    justify-content: space-between;
    
    .indicator {
      text-align: center;
      .val { font-size: 44rpx; font-weight: 800; color: $primary-color; display: block; }
      .unit { font-size: 24rpx; color: $text-color-light; }
    }
    
    .divider { width: 2rpx; height: 60rpx; background: #EEE; }
    .record-btn { margin: 0; }
  }
}

// 服务推荐
.section-container {
  margin-bottom: 40rpx;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20rpx;
  padding: 0 8rpx;
  .section-title { font-size: 36rpx; font-weight: bold; color: $text-color; }
  .more { font-size: 28rpx; color: $primary-color; }
}

.service-scroll {
  display: flex;
  gap: 24rpx;
  overflow-x: auto;
  padding: 4rpx;
  &::-webkit-scrollbar { display: none; }
  
  .service-item {
    flex-shrink: 0;
    width: 320rpx;
    background: #FFFFFF;
    border-radius: 32rpx;
    overflow: hidden;
    box-shadow: $item-shadow;
    
    .service-img { width: 100%; height: 200rpx; background: $primary-light; }
    
    .service-info {
      padding: 20rpx;
      .name { font-weight: bold; color: $text-color; margin-bottom: 12rpx; display: block; }
      .price-row {
        .price { color: $danger-color; font-size: 36rpx; font-weight: bold; }
        .unit { color: $text-color-light; font-size: 24rpx; margin-left: 4rpx; }
      }
    }
  }
}

// 🆘 SOS 绝对视觉中心
.sos-wrapper {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 40rpx 32rpx 60rpx;
  pointer-events: none;
  background: linear-gradient(to top, $bg-color 70%, transparent);

  .sos-btn-outer {
    pointer-events: auto;
    background: $danger-color;
    height: 140rpx;
    border-radius: 70rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 12rpx 32rpx rgba(225, 29, 72, 0.4);
    position: relative;
    overflow: hidden;
    
    &::after { 
      content: ''; 
      position: absolute; 
      top: 0; left: 0; right: 0; bottom: 0;
      background: radial-gradient(circle, rgba(255,255,255,0.2) 0%, transparent 70%);
    }

    &:active { transform: scale(0.96); opacity: 0.95; }
    
    .sos-btn-inner {
      display: flex;
      align-items: center;
      gap: 16rpx;
      z-index: 1;
      .sos-icon { font-size: 56rpx; }
      .sos-label { color: #FFFFFF; font-size: 40rpx; font-weight: 900; letter-spacing: 4rpx; }
    }
  }
}
</style>
