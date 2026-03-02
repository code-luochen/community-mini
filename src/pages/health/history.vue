<template>
  <view class="container" :style="{ '--base-font-size': settingsStore.fontSize + 'px' }">
    <view class="header">
      <text class="title" :style="{ fontSize: (settingsStore.fontSize + 4) + 'px' }">历史健康记录</text>
    </view>
    
    <scroll-view scroll-y class="list-area" @scrolltolower="loadMore">
      <view class="record-card" v-for="item in records" :key="item.id">
        <view class="card-header">
          <text class="time">{{ formatTime(item.recordTime || item.createdAt) }}</text>
          <text class="status" :class="item.isAbnormal ? 'abnormal' : 'normal'">
            {{ item.isAbnormal ? '存在异常' : '状态正常' }}
          </text>
        </view>
        <view class="metrics-row">
          <view class="metric-item">
            <text class="label">血压</text>
            <text class="value">{{ item.systolicBp || '-' }}/{{ item.diastolicBp || '-' }}</text>
          </view>
          <view class="metric-item">
            <text class="label">心率</text>
            <text class="value">{{ item.heartRate || '-' }}</text>
          </view>
          <view class="metric-item">
            <text class="label">血糖</text>
            <text class="value">{{ item.bloodSugar || '-' }}</text>
          </view>
          <view class="metric-item">
            <text class="label">体温</text>
            <text class="value">{{ item.temperature || '-' }}</text>
          </view>
        </view>
      </view>
      
      <view class="loading-more" v-if="loading">加载中...</view>
      <view class="no-more" v-if="!loading && !hasMore && records.length > 0">没有更多记录了</view>
      
      <view class="empty-state" v-if="!loading && records.length === 0">
        <text class="empty-icon">📂</text>
        <text class="empty-text">暂无健康记录</text>
      </view>
    </scroll-view>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { onShow } from '@dcloudio/uni-app';
import { useSettingsStore } from '@/stores/settings';
import { useUserStore } from '@/stores/user';
import { getHealthRecords } from '@/api/health';

const settingsStore = useSettingsStore();
const userStore = useUserStore();

const records = ref<any[]>([]);
const page = ref(1);
const limit = 10;
const loading = ref(false);
const hasMore = ref(true);

const formatTime = (timeStr: string) => {
  if (!timeStr) return '';
  const d = new Date(timeStr);
  return `${d.getFullYear()}-${(d.getMonth() + 1).toString().padStart(2, '0')}-${d.getDate().toString().padStart(2, '0')} ${d.getHours()}:${d.getMinutes().toString().padStart(2, '0')}`;
};

const fetchRecords = async (isLoadMore = false) => {
  if (loading.value || (!hasMore.value && isLoadMore)) return;
  
  loading.value = true;
  try {
    const res: any = await getHealthRecords({
      elderlyId: userStore.userInfo?.id,
      page: page.value,
      limit
    });
    
    // 假设后端返回格式为 { data: [], total: 100 } 或 { items: [], total: 100 }，或直接返回数据数组
    const data = res.data || res.items || (Array.isArray(res) ? res : []);
    
    if (isLoadMore) {
      records.value = [...records.value, ...data];
    } else {
      records.value = data;
    }
    
    // 如果获取到的数据量少于 limit，说明没有更多数据了
    if (data.length < limit) {
      hasMore.value = false;
    } else {
      page.value++;
    }
  } catch (error) {
    uni.showToast({ title: '加载失败', icon: 'none' });
  } finally {
    loading.value = false;
  }
};

const loadMore = () => {
  fetchRecords(true);
};

onShow(() => {
  page.value = 1;
  hasMore.value = true;
  fetchRecords();
});
</script>

<style scoped lang="scss">
@import "@/styles/variables.scss";

.container {
  padding: 32rpx;
  background-color: #F8F9FB;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.header {
  margin-bottom: 32rpx;
  .title {
    font-weight: bold;
    color: $text-color;
  }
}

.list-area {
  flex: 1;
  height: 0; // for scroll-view
}

.record-card {
  background: #FFF;
  border-radius: 24rpx;
  padding: 32rpx;
  margin-bottom: 24rpx;
  box-shadow: 0 4rpx 12rpx rgba(0,0,0,0.03);
  
  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 24rpx;
    border-bottom: 2rpx solid #F1F5F9;
    padding-bottom: 20rpx;
    
    .time {
      font-size: 28rpx;
      color: $text-color;
      font-weight: bold;
    }
    .status {
      font-size: 24rpx;
      padding: 6rpx 16rpx;
      border-radius: 30rpx;
      font-weight: bold;
      &.normal {
        background: $primary-light;
        color: $primary-color;
      }
      &.abnormal {
        background: #FFF2F2;
        color: $danger-color;
      }
    }
  }
  
  .metrics-row {
    display: flex;
    justify-content: space-between;
    text-align: center;
    
    .metric-item {
      flex: 1;
      .label {
        font-size: 24rpx;
        color: $text-color-light;
        margin-bottom: 8rpx;
        display: block;
      }
      .value {
        font-size: 32rpx;
        color: $text-color;
        font-weight: bold;
      }
    }
  }
}

.loading-more, .no-more {
  text-align: center;
  font-size: 26rpx;
  color: $text-color-light;
  padding: 30rpx 0;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 100rpx 0;
  
  .empty-icon {
    font-size: 80rpx;
    margin-bottom: 20rpx;
  }
  .empty-text {
    font-size: 30rpx;
    color: $text-color-light;
  }
}
</style>
