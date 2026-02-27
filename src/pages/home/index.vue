<template>
  <view class="home-container" :style="{ '--font-size': settingsStore.fontSize + 'px' }">
    <!-- 顶部：天气与问候语 -->
    <view class="header-section">
      <view class="greeting-box">
        <text class="greeting-text" :style="{ fontSize: `${settingsStore.fontSize + 4}px` }">
          {{ userDisplayName }}，{{ greeting }}！
        </text>
        <view class="weather-box">
          <u-icon name="sun-fill" color="#FAAD14" size="40"></u-icon>
          <text class="weather-text" :style="{ fontSize: `${settingsStore.fontSize}px` }">
            今天天气晴朗，25℃，记得多喝水。
          </text>
        </view>
      </view>
    </view>

    <!-- 中部：四个大图标入口 -->
    <view class="grid-section">
      <view class="grid-item" v-for="(item, index) in menuItems" :key="index" @click="handleMenuClick(item)">
        <view class="icon-wrapper" :style="{ backgroundColor: item.color }">
          <u-icon :name="item.icon" color="#FFFFFF" size="60"></u-icon>
        </view>
        <text class="item-text" :style="{ fontSize: `${settingsStore.fontSize}px` }">{{ item.text }}</text>
      </view>
    </view>

    <!-- 下部：推荐服务列表 -->
    <view class="list-section">
      <view class="section-title">
        <text :style="{ fontSize: `${settingsStore.fontSize + 2}px` }">推荐服务</text>
      </view>
      <view class="service-card" v-for="(service, index) in recommendedServices" :key="index">
        <image class="service-image" src="/static/logo.png" mode="aspectFill"></image>
        <view class="service-info">
          <text class="service-name" :style="{ fontSize: `${settingsStore.fontSize}px` }">{{ service.name }}</text>
          <view class="service-meta">
            <text class="service-price" :style="{ fontSize: `${settingsStore.fontSize}px` }">¥{{ service.price }}</text>
            <view class="service-rating">
              <u-icon name="star-fill" color="#FAAD14" size="24"></u-icon>
              <text :style="{ fontSize: `${settingsStore.fontSize - 2}px` }">{{ service.rating }}</text>
            </view>
          </view>
          <view class="card-footer">
            <ElderlyButton voiceText="预约服务" @click="handleReserve(service)" class="reserve-btn">
              预约
            </ElderlyButton>
          </view>
        </view>
      </view>
    </view>

    <!-- 底部一键紧急求助按钮 -->
    <view class="emergency-fixed-bottom">
      <button class="emergency-btn" @click="handleEmergency" @longpress="handleEmergency">
        <text class="emergency-btn-text" :style="{ fontSize: `${settingsStore.fontSize + 4}px` }">
          🔴 一键紧急求助
        </text>
      </button>
    </view>
    
    <!-- 占位，防止内容被底部按钮遮挡 -->
    <view class="bottom-placeholder"></view>
  </view>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import ElderlyButton from "@/components/ElderlyButton.vue";
import { useSettingsStore } from "@/stores/settings";
import { useUserStore } from "@/stores/user";

const userStore = useUserStore();
const settingsStore = useSettingsStore();

const userDisplayName = computed(() => {
	return userStore.userInfo?.name || "老人家";
});

const greeting = computed(() => {
	const hour = new Date().getHours();
	if (hour < 12) return "上午好";
	if (hour < 18) return "下午好";
	return "晚上好";
});

const menuItems = [
	{
		text: "服务预约",
		icon: "home",
		color: "#409EFF",
		path: "/pages/service/reserve",
	},
	{
		text: "健康记录",
		icon: "heart",
		color: "#67C23A",
		path: "/pages/health/record",
	},
	{
		text: "紧急求助",
		icon: "warning",
		color: "#F56C6C",
		path: "/pages/emergency/index",
	},
	{
		text: "订单管理",
		icon: "order",
		color: "#E6A23C",
		path: "/pages/order/list",
	},
];

const recommendedServices = ref([
	{ name: "上门助浴", price: 99, rating: 4.9 },
	{ name: "代买买药", price: 20, rating: 4.8 },
	{ name: "陪同就医", price: 150, rating: 5.0 },
]);

const handleMenuClick = (item: any) => {
	uni.showToast({ title: `点击了 ${item.text}`, icon: "none" });
};

const handleReserve = (service: any) => {
	uni.showToast({ title: `开始预约: ${service.name}`, icon: "none" });
};

const handleEmergency = () => {
	uni.vibrateLong({});
	uni.showModal({
		title: "紧急呼叫",
		content: "正在联系紧急救援中心，请保持电话畅通。",
		confirmText: "确定",
		showCancel: false,
	});
};
</script>

<style scoped lang="scss">
@import "@/styles/variables.scss";

.home-container {
  background-color: #F8F9FA;
  min-height: 100vh;
  padding: 30rpx;
}

.header-section {
  background-color: $bg-color;
  padding: 40rpx;
  border-radius: 24rpx;
  margin-bottom: 30rpx;
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.05);

  .greeting-text {
    font-weight: bold;
    color: $text-color;
    display: block;
    margin-bottom: 20rpx;
  }

  .weather-box {
    display: flex;
    align-items: center;
    color: $text-color-light;

    .weather-text {
      margin-left: 10rpx;
    }
  }
}

.grid-section {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20rpx;
  margin-bottom: 40rpx;

  .grid-item {
    background-color: $bg-color;
    padding: 40rpx 20rpx;
    border-radius: 24rpx;
    display: flex;
    flex-direction: column;
    align-items: center;
    box-shadow: 0 4rpx 8rpx rgba(0, 0, 0, 0.05);

    .icon-wrapper {
      width: 120rpx;
      height: 120rpx;
      border-radius: 60rpx;
      display: flex;
      justify-content: center;
      align-items: center;
      margin-bottom: 20rpx;
    }

    .item-text {
      font-weight: bold;
      color: $text-color;
    }
  }
}

.list-section {
  .section-title {
    margin-bottom: 20rpx;
    font-weight: bold;
    color: $text-color;
    padding-left: 10rpx;
    border-left: 8rpx solid $primary-color;
  }

  .service-card {
    background-color: $bg-color;
    padding: 20rpx;
    border-radius: 24rpx;
    display: flex;
    margin-bottom: 24rpx;
    box-shadow: 0 4rpx 8rpx rgba(0, 0, 0, 0.05);

    .service-image {
      width: 200rpx;
      height: 200rpx;
      border-radius: 16rpx;
      background-color: #F5F7FA;
    }

    .service-info {
      flex: 1;
      margin-left: 20rpx;
      display: flex;
      flex-direction: column;
      justify-content: space-between;

      .service-name {
        font-weight: bold;
        color: $text-color;
      }

      .service-meta {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin: 10rpx 0;

        .service-price {
          color: #F56C6C;
          font-weight: bold;
        }

        .service-rating {
          display: flex;
          align-items: center;
          color: $text-color-light;
        }
      }

      .card-footer {
        display: flex;
        justify-content: flex-end;
        
        .reserve-btn {
          min-width: 160rpx;
          height: 80rpx !important;
        }
      }
    }
  }
}

.emergency-fixed-bottom {
  position: fixed;
  bottom: 40rpx;
  left: 30rpx;
  right: 30rpx;
  z-index: 1000;

  .emergency-btn {
    width: 100%;
    height: 120rpx;
    background-color: #D54941;
    color: #FFFFFF;
    border-radius: 60rpx;
    display: flex;
    justify-content: center;
    align-items: center;
    box-shadow: 0 8rpx 20rpx rgba(213, 73, 65, 0.4);
    border: none;

    &:active {
      transform: scale(0.98);
      opacity: 0.9;
    }

    .emergency-btn-text {
      font-weight: bold;
    }
  }
}

.bottom-placeholder {
  height: 200rpx;
}
</style>
