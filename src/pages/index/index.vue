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
             <image class="avatar" :src="userInfo?.avatar || 'https://img.js.design/assets/illustration/63f46f48a97217578205691e/preview.png'" mode="aspectFill" />
          </view>
          <view class="greeting-text">
            <text class="title" :style="{ fontSize: (settingsStore.fontSize + 6) + 'px' }" @longpress="speak(`你好，${userInfo?.nickname || userInfo?.username}`)">
              {{ userInfo?.nickname || userInfo?.username }}，{{ greeting }}
            </text>
            <text class="subtitle" :style="{ fontSize: settingsStore.fontSize + 'px' }">
              愿您今天平安健康，心情舒畅
            </text>
          </view>
          <view class="bell-box" @click="handleNavigate('/pages/notification/index')" @longpress="speak('消息通知')">
            <u-icon name="bell" color="#FFFFFF" size="44"></u-icon>
            <view v-if="unreadCount > 0" class="badge">{{ unreadCount > 99 ? '99+' : unreadCount }}</view>
          </view>
        </view>
        
        <view class="weather-pill" @longpress="speak(`当前天气${weather.temp}度，${weather.desc}`)">
          <text class="icon">{{ weather.icon }}</text>
          <view class="info">
            <text class="temp" :style="{ fontSize: settingsStore.fontSize + 'px' }">{{ weather.temp }}°C</text>
            <text class="city">{{ weather.desc }} · 适宜活动</text>
          </view>
        </view>
      </view>
    </view>

    <!-- 1.5 完善资料提醒 (Profile Completion Reminder) -->
    <view v-if="isProfileIncomplete" class="profile-notice" @click="handleNavigate('/pages/profile/basic-info')">
      <view class="notice-left">
        <text class="notice-icon">🛡️</text>
        <view class="notice-text">
          <text class="notice-title">请完善紧急联系人信息</text>
          <text class="notice-desc">完善后即可开启24小时一键求助保障</text>
        </view>
      </view>
      <view class="notice-btn">去完善</view>
    </view>

    <!-- 2. 功能金刚区 (Floated Category Grid) -->
    <view class="main-content">
      <view class="grid-card">
        <view 
          class="grid-item" 
          v-for="item in gridItems" 
          :key="item.path" 
          @click="handleNavigate(item.path)"
          @longpress="speak(item.label)"
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
        <view class="health-summary-card" @click="handleNavigate('/pages/health/index')" @longpress="speak('健康守护，点击查看详细记录')">
          <view class="card-header">
             <text class="card-title">💓 健康守护</text>
             <text class="time">最后记录：{{ latestHealth?.recordTime ? formatTime(latestHealth.recordTime) : '暂无记录' }}</text>
          </view>
          <view class="card-body">
            <view class="indicator">
              <text class="val" :class="{ 'abnormal': isBloodPressureAbnormal }">
                {{ latestHealth?.systolicBp ? `${latestHealth.systolicBp}/${latestHealth.diastolicBp}` : '--' }}
              </text>
              <text class="unit">血压</text>
            </view>
            <view class="divider"></view>
            <view class="indicator">
              <text class="val" :class="{ 'abnormal': isHeartRateAbnormal }">
                {{ latestHealth?.heartRate || '--' }}
              </text>
              <text class="unit">心率</text>
            </view>
            <u-button type="primary" size="mini" shape="circle" :plain="true" class="record-btn" @click.stop="handleNavigate('/pages/health/record')">去记录</u-button>
          </view>
          <view v-if="latestHealth?.isAbnormal" class="abnormal-notice">
            <u-icon name="warning-fill" color="#E11D48" size="32"></u-icon>
            <text class="notice-text">检测到数据异常，建议联系家属或预约医护服务</text>
          </view>
        </view>
      </view>

      <!-- 4. 服务推荐区 (Service Recommendations) -->
      <view class="section-container">
        <view class="section-header">
          <view class="title-with-tag">
            <text class="section-title">✨ {{ recommendationTitle }}</text>
            <view v-if="hasHealthRisk" class="risk-tag">为您推荐</view>
          </view>
          <text class="more" @click="handleNavigate('/pages/service/list')">查看全部</text>
        </view>
        
        <scroll-view scroll-x class="service-scroll">
          <view class="scroll-content">
            <view 
              class="service-item" 
              v-for="service in recommendations" 
              :key="service.id"
              @click="handleBooking(service)"
              @longpress="speak(service.name)"
            >
              <image class="service-img" :src="service.imageUrl || 'https://img.js.design/assets/illustration/63f46f48a97217578205691e/preview.png'" mode="aspectFill" />
              <view class="service-info">
                <text class="name" :style="{ fontSize: settingsStore.fontSize + 'px' }">{{ service.name }}</text>
                <view class="price-row">
                  <text class="price">¥{{ service.price }}</text>
                  <text class="unit">/次</text>
                </view>
              </view>
            </view>
            <view v-if="recommendations.length === 0" class="empty-service">
               <text>更多优质服务筹备中...</text>
            </view>
          </view>
        </scroll-view>
      </view>
    </view>

    <!-- 5. 紧急求助 (SOS Floating Action Button) -->
    <view class="sos-wrapper">
      <view class="sos-btn-outer" @click="handleSOS" @longpress="speak('紧急求助确认，点击后将联系家属和管理员')">
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
import { getHealthRecords } from '@/api/health';
import { getServiceList, type ServiceModel } from '@/api/service';
import { getMyProfile } from '@/api/profile';

const settingsStore = useSettingsStore();
const userStore = useUserStore();
const userInfo = computed(() => userStore.userInfo);

// 系统高度适配
const statusBarHeight = ref(20);
const navBarHeight = ref(44);

// 业务状态
const greeting = ref('下午好');
const weather = ref({ temp: 22, desc: '多云', icon: '🌤️' });

const gridItems = [
  { label: '服务预约', icon: 'grid', iconColor: '#0891B2', color: '#E0F2FE', path: '/pages/service/list' },
  { label: '健康指标', icon: 'heart-fill', iconColor: '#22C55E', color: '#F0FDF4', path: '/pages/health/index' },
  { label: '服务订单', icon: 'order', iconColor: '#F59E0B', color: '#FFFBEB', path: '/pages/order/list' },
  { label: '个人中心', icon: 'account', iconColor: '#8B5CF6', color: '#F5F3FF', path: '/pages/profile/index' }
];

const latestHealth = ref<any>(null);
const recommendations = ref<ServiceModel[]>([]);
const unreadCount = ref(0);
const isProfileIncomplete = ref(false);
const userProfile = ref<any>(null);

const formattedHouseAddress = computed(() => {
  const house = userProfile.value?.house;
  if (!house) return '';
  const communityName = house.community?.name || '';
  return `${communityName} ${house.buildingNo}-${house.unitNo}-${house.roomNo}`;
});

// 计算属性
const isBloodPressureAbnormal = computed(() => {
  if (!latestHealth.value) return false;
  const { systolicBp, diastolicBp } = latestHealth.value;
  return systolicBp > 140 || systolicBp < 90 || diastolicBp > 90 || diastolicBp < 60;
});

const isHeartRateAbnormal = computed(() => {
  if (!latestHealth.value) return false;
  const { heartRate } = latestHealth.value;
  return heartRate > 100 || heartRate < 60;
});

const hasHealthRisk = computed(() => latestHealth.value?.isAbnormal === 1);
const recommendationTitle = computed(() => hasHealthRisk.value ? '健康帮扶' : '为您甄选');

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

  // 3. 动态问候与天气模拟
  updateGreetingAndWeather();
});

onShow(() => {
  fetchAllData();
});

const updateGreetingAndWeather = () => {
  const hour = new Date().getHours();
  if (hour < 6) greeting.value = '凌晨好';
  else if (hour < 11) greeting.value = '上午好';
  else if (hour < 13) greeting.value = '中午好';
  else if (hour < 18) greeting.value = '下午好';
  else greeting.value = '晚上好';

  // 模拟天气变化
  const weathers = [
    { temp: 22, desc: '多云', icon: '🌤️' },
    { temp: 25, desc: '晴天', icon: '☀️' },
    { temp: 18, desc: '阵雨', icon: '🌦️' },
    { temp: 20, desc: '阴天', icon: '☁️' }
  ];
  weather.value = weathers[Math.floor(Math.random() * weathers.length)];
};

const fetchAllData = async () => {
  if (!userStore.token) return;
  
  try {
    // 并行获取数据
    const [healthRes, unreadRes, profileRes] = await Promise.all([
      getHealthRecords({ limit: 1, elderlyId: userInfo.value?.id }),
      getUnreadCount(),
      getMyProfile().catch(err => {
        console.log('Profile not found, which is expected for new users');
        return { data: null };
      })
    ]);

    latestHealth.value = (healthRes as any).data?.items?.[0] || null;
    unreadCount.value = (unreadRes as any).data || 0;
    
    const profile = (profileRes as any).data;
    userProfile.value = profile;
    isProfileIncomplete.value = !profile || !profile.emergencyContact || !profile.emergencyPhone;

    // 根据健康状况获取推荐服务
    fetchRecommendations();
  } catch (err) {
    console.error('Fetch home data failed:', err);
  }
};

const fetchRecommendations = async () => {
  try {
    const params: any = { limit: 5 };
    
    // 联动逻辑：如果健康异常，尤其是血压异常，优先推荐医护服务 (type 3) 或 药品服务 (type 2)
    if (hasHealthRisk.value) {
      params.type = 3; // 医护服务
    }

    const res: any = await getServiceList(params);
    recommendations.value = res.data?.items || [];

    consol

    // 如果指定类型的服务太少，补充一些普通服务
    if (recommendations.value.length < 2 && hasHealthRisk.value) {
       const extraRes: any = await getServiceList({ limit: 5 });
       const extraItems = extraRes.data?.items || [];
       recommendations.value = [...new Set([...recommendations.value, ...extraItems])].slice(0, 5);
    }
  } catch (err) {
    console.error('Fetch recommendations failed:', err);
  }
};

const formatTime = (timeStr: string) => {
  if (!timeStr) return '';
  const date = new Date(timeStr);
  const now = new Date();
  
  const isToday = date.toDateString() === now.toDateString();
  if (isToday) {
    return `今天 ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
  }
  return `${date.getMonth() + 1}月${date.getDate()}日`;
};

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

const speak = (content: string) => {
  // 适老化：模拟语音播报
  // 生产环境可接入 uni-voice 或 微信小程序语音插件
  uni.showToast({
    title: `播报: ${content}`,
    icon: 'none',
    duration: 2000
  });
  
  // #ifdef MP-WEIXIN
  // 如果有语音插件支持，可以在这里调用
  // #endif
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
              const remark = formattedHouseAddress.value 
                ? `首页一键紧急求助 [地址:${formattedHouseAddress.value}]` 
                : '首页一键紧急求助';
              await createEmergency({ location: locationStr, remark });
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
              const remark = formattedHouseAddress.value 
                ? `首页一键紧急求助(无坐标) [地址:${formattedHouseAddress.value}]` 
                : '首页一键紧急求助(无坐标)';
              await createEmergency({ location: '定位失败/未授权', remark });
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
      .val { 
        font-size: 44rpx; 
        font-weight: 800; 
        color: $primary-color; 
        display: block; 
        &.abnormal { color: $danger-color; }
      }
      .unit { font-size: 24rpx; color: $text-color-light; }
    }
    
    .divider { width: 2rpx; height: 60rpx; background: #EEE; }
    .record-btn { margin: 0; }
  }

  .abnormal-notice {
    margin-top: 24rpx;
    padding: 16rpx;
    background: #FFF1F2;
    border-radius: 16rpx;
    display: flex;
    align-items: center;
    gap: 12rpx;
    .notice-text { color: $danger-color; font-size: 24rpx; font-weight: bold; }
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
  
  .title-with-tag {
    display: flex;
    align-items: center;
    gap: 12rpx;
  }
  
  .section-title { font-size: 36rpx; font-weight: bold; color: $text-color; }
  .risk-tag {
    background: $danger-color;
    color: #FFFFFF;
    font-size: 20rpx;
    padding: 2rpx 12rpx;
    border-radius: 8rpx;
    font-weight: bold;
  }
  .more { font-size: 28rpx; color: $primary-color; }
}

.service-scroll {
  width: 100%;
  white-space: nowrap;
  
  .scroll-content {
    display: inline-flex;
    padding: 8rpx 4rpx;
    gap: 24rpx;
  }
  
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
      .name { 
        font-weight: bold; 
        color: $text-color; 
        margin-bottom: 12rpx; 
        display: block; 
        white-space: normal;
        overflow: hidden;
        text-overflow: ellipsis;
        display: -webkit-box;
        -webkit-line-clamp: 1;
        line-clamp: 1;
        -webkit-box-orient: vertical;
      }
      .price-row {
        .price { color: $danger-color; font-size: 36rpx; font-weight: bold; }
        .unit { color: $text-color-light; font-size: 24rpx; margin-left: 4rpx; }
      }
    }
  }

  .empty-service {
    width: 300rpx;
    height: 300rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    color: $text-color-muted;
    font-size: 24rpx;
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

.profile-notice {
  margin: -40rpx 32rpx 32rpx;
  background: #FFFFFF;
  border-radius: 32rpx;
  padding: 24rpx 32rpx;
  display: flex;
  align-items: center;
  justify-content: space-between;
  box-shadow: 0 8rpx 24rpx rgba(0,0,0,0.08);
  position: relative;
  z-index: 10;
  border-left: 10rpx solid $danger-color;

  .notice-left {
    display: flex;
    align-items: center;
    gap: 20rpx;
    
    .notice-icon { font-size: 48rpx; }
    .notice-text {
      .notice-title { 
        font-size: 30rpx; 
        font-weight: bold; 
        color: #1E293B; 
        display: block;
      }
      .notice-desc { 
        font-size: 24rpx; 
        color: #64748B; 
      }
    }
  }

  .notice-btn {
    background: $danger-color;
    color: #FFFFFF;
    font-size: 24rpx;
    font-weight: bold;
    padding: 12rpx 24rpx;
    border-radius: 20rpx;
  }
}
</style>
