<template>
  <view class="container" :style="{ '--base-font-size': settingsStore.fontSize + 'px' }">
    <!-- 搜索栏 -->
    <view class="search-bar">
      <view class="search-input-box">
        <up-icon name="search" size="20" color="#909399"></up-icon>
        <input 
          type="text" 
          placeholder="搜索服务..." 
          class="search-input" 
          v-model="queryParams.name"
          @confirm="onSearch"
        />
      </view>
    </view>

    <!-- 列表区 -->
    <scroll-view 
      class="list" 
      scroll-y 
      @scrolltolower="onReachBottom"
    >
      <!-- 空状态 -->
      <up-empty 
        v-if="serviceList.length === 0 && !loading" 
        mode="list" 
        icon="http://cdn.uviewui.com/uview/empty/list.png"
      ></up-empty>

      <!-- 服务列表 -->
      <view 
        class="service-card" 
        v-for="item in serviceList" 
        :key="item.id"
      >
        <view class="service-info">
          <image class="service-img" :src="getImageUrl(item.imageUrl)" mode="aspectFill"></image>
          <view class="service-content">
            <text class="service-name" :style="{ fontSize: settingsStore.fontSize + 'px' }">{{ item.name }}</text>
            <text class="service-desc" :style="{ fontSize: (settingsStore.fontSize - 4) + 'px' }">{{ item.description || '暂无描述' }}</text>
            <text class="service-price">¥ {{ Number(item.price).toFixed(2) }}</text>
          </view>
         
        </view>
        <elderly-button @click="goToReserve(item)">预约</elderly-button>
      </view>

      <up-loadmore 
        v-if="serviceList.length > 0" 
        :status="loadStatus" 
        :fontSize="settingsStore.fontSize - 4"
        marginTop="20"
        marginBottom="20"
      />
    </scroll-view>
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { onLoad, onShow } from '@dcloudio/uni-app';
import { useSettingsStore } from '@/stores/settings';
import { getServiceList } from '@/api/service';
import type { ServiceModel, QueryServiceParams } from '@/api/service';
import ElderlyButton from '@/components/ElderlyButton.vue';

const settingsStore = useSettingsStore();

// 状态定义
const serviceList = ref<ServiceModel[]>([]);
const loading = ref(false);
const queryParams = ref<QueryServiceParams>({
  name: '',
  page: 1,
  limit: 10
});
const total = ref(0);
const loadStatus = ref<'loadmore' | 'loading' | 'nomore'>('loadmore');



const fetchServices = async (isReset = false) => {
  if (isReset) {
    queryParams.value.page = 1;
    serviceList.value = [];
    loadStatus.value = 'loadmore';
  }

  if (loadStatus.value === 'nomore') return;

  loading.value = true;
  loadStatus.value = 'loading';

  try {
    const res = await getServiceList(queryParams.value);
    const { items, total: totalCount } = res.data;
    
    serviceList.value = [...serviceList.value, ...items];
    total.value = totalCount;

    console.log("serviceList", serviceList.value[0].imageUrl)
    
    if (serviceList.value.length >= total.value) {
      loadStatus.value = 'nomore';
    } else {
      loadStatus.value = 'loadmore';
    }
  } catch (err: any) {
    uni.showToast({ title: err.message || '获取服务失败', icon: 'none' });
    loadStatus.value = 'loadmore'; // allow retry
  } finally {
    loading.value = false;
  }
};

const onSearch = () => {
  fetchServices(true);
};

const onReachBottom = () => {
  if (loadStatus.value !== 'nomore') {
    queryParams.value.page! += 1;
    fetchServices(false);
  }
};

const goToReserve = (item: ServiceModel) => {
  uni.navigateTo({
    url: `/pages/service/reserve?id=${item.id}&name=${encodeURIComponent(item.name)}&price=${item.price}`
  });
};

const getImageUrl = (url: string) => {
  if (!url) return 'https://img.js.design/assets/illustration/63f46f48a97217578205691e/preview.png';
  if (url.startsWith('http')) return url;
  // 从开发环境配置中获取基础路径，此处硬编码与 request.ts 保持一致
  const BASE_URL = 'http://127.0.0.1:3000';
  return `${BASE_URL}${url.startsWith('/') ? '' : '/'}${url}`;
};

onLoad(() => {
  fetchServices(true);
});
</script>

<style scoped lang="scss">
@import "@/styles/variables.scss";
.container { 
  background-color: #F8F9FA; 
  height: 100vh;
  display: flex;
  flex-direction: column;
}

.search-bar { 
  padding: 24rpx 32rpx;
  background-color: #fff;
  
  .search-input-box {
    background: #F5F5F5;
    height: 80rpx;
    border-radius: 40rpx;
    padding: 0 32rpx;
    display: flex;
    align-items: center;
    gap: 16rpx;
    
    .search-input {
      flex: 1;
      font-size: 28rpx;
    }
  }
}

.list {
  flex: 1;
  overflow-y: auto;
  .service-card { 
    background: #FFF; 
    padding: 32rpx; 
    border-radius: 20rpx; 
    margin: 24rpx 32rpx; 
    display: flex; 
    justify-content: space-between; 
    align-items: center; 
    box-shadow: 0 4rpx 16rpx rgba(0,0,0,0.03);

    .service-info {
      display: flex;
      flex: 1;
      gap: 24rpx;
      margin-right: 20rpx;

      .service-img {
        width: 140rpx;
        height: 140rpx;
        border-radius: 12rpx;
        background-color: #f0f0f0;
      }

      .service-content {
        flex: 1;
        display: flex;
        flex-direction: column;
        justify-content: space-around;

        .service-name {
          font-weight: bold;
          color: $text-color;
        }

        .service-desc {
          color: #999;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          max-width: 300rpx;
        }

        .service-price {
          color: $danger-color;
          font-weight: bold;
          font-size: 32rpx;
        }
      }
    }
  }
}
</style>
