<template>
  <view class="notification-container" :style="{ '--base-font-size': settingsStore.fontSize + 'px' }">
    <view class="header-action" v-if="notifications.length > 0">
      <view class="read-all-btn" @click="handleReadAll">
        <u-icon name="checkmark-circle" color="#0052D9" size="32"></u-icon>
        <text class="text">全部已读</text>
      </view>
    </view>
    
    <scroll-view 
      scroll-y 
      class="scroll-box"
      @scrolltolower="loadMore"
    >
      <up-list v-if="notifications.length > 0">
        <view 
          v-for="item in notifications" 
          :key="item.id" 
          class="notify-card" 
          :class="{'is-read': item.isRead}"
          @click="handleRead(item)"
        >
          <view class="card-header">
            <view class="title-wrap">
              <view class="dot" v-if="!item.isRead"></view>
              <text class="title">{{ item.title }}</text>
            </view>
            <text class="time">{{ formatDate(item.createdAt) }}</text>
          </view>
          <view class="card-content">
            <text class="desc">{{ item.content }}</text>
          </view>
        </view>
        <!-- 加载状态 -->
        <up-loadmore :status="loadStatus" v-if="notifications.length >= limit || loadStatus !== 'loadmore'" />
      </up-list>

      <view v-else class="empty-state">
        <view class="empty-icon-wrapper">
          <view class="empty-circle">
            <u-icon name="bell-fill" color="#94A3B8" size="80"></u-icon>
          </view>
        </view>
        <text class="empty-title">暂无新消息</text>
        <text class="empty-desc">您暂时还没有收到任何通知或提醒</text>
      </view>
    </scroll-view>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { onLoad, onPullDownRefresh, onReachBottom } from '@dcloudio/uni-app';
import { getNotifications, markAsRead, markAllAsRead } from '@/api/notification';
import type { NotificationItem } from '@/api/notification';
import { useSettingsStore } from '@/stores/settings';

const settingsStore = useSettingsStore();

const notifications = ref<NotificationItem[]>([]);
const page = ref(1);
const limit = ref(10);
const loadStatus = ref('loadmore'); // loadmore, loading, nomore

const fetchList = async (isRefresh = false) => {
  if (isRefresh) {
    page.value = 1;
    loadStatus.value = 'loadmore';
  }
  if (loadStatus.value === 'nomore' && !isRefresh) return;
  
  loadStatus.value = 'loading';
  try {
    const res: any = await getNotifications({ page: page.value, limit: limit.value });
    const items = res.data?.items || [];
    
    if (isRefresh) {
      notifications.value = items;
    } else {
      notifications.value = [...notifications.value, ...items];
    }
    
    if (items.length < limit.value || page.value >= (res.data?.meta?.totalPages || 1)) {
      loadStatus.value = 'nomore';
    } else {
      loadStatus.value = 'loadmore';
      page.value++;
    }
  } catch (err: any) {
    uni.showToast({ title: '获取列表失败', icon: 'none' });
    loadStatus.value = 'loadmore';
  } finally {
    if (isRefresh) {
      uni.stopPullDownRefresh();
    }
  }
};

onLoad(() => {
  uni.showLoading({ title: '加载中' });
  fetchList(true).then(() => uni.hideLoading());
});

onPullDownRefresh(() => {
  fetchList(true);
});

onReachBottom(() => {
  fetchList();
});

const loadMore = () => {
  fetchList();
};

const handleRead = async (item: NotificationItem) => {
  if (item.isRead) return;
  try {
    await markAsRead(item.id);
    item.isRead = true;
  } catch(e) {
    // ignore
  }
};

const handleReadAll = async () => {
  try {
    uni.showLoading({ title: '处理中' });
    await markAllAsRead();
    notifications.value.forEach(item => {
      item.isRead = true;
    });
    uni.hideLoading();
    uni.showToast({ title: '已全部标为已读', icon: 'success' });
  } catch (err: any) {
    uni.hideLoading();
    uni.showToast({ title: '操作失败', icon: 'none' });
  }
};

const formatDate = (dateStr: string) => {
  const date = new Date(dateStr);
  const m = (date.getMonth() + 1).toString().padStart(2, '0');
  const d = date.getDate().toString().padStart(2, '0');
  const h = date.getHours().toString().padStart(2, '0');
  const min = date.getMinutes().toString().padStart(2, '0');
  return `${m}-${d} ${h}:${min}`;
};
</script>

<style scoped lang="scss">
@import "@/styles/variables.scss";

.notification-container {
  min-height: 100vh;
  background-color: #F5F7FA;
  display: flex;
  flex-direction: column;
}

.header-action {
  padding: 24rpx 32rpx;
  display: flex;
  justify-content: flex-end;
  background-color: #F5F7FA;
  
  .read-all-btn {
    display: flex;
    align-items: center;
    gap: 8rpx;
    padding: 12rpx 24rpx;
    background: #FFFFFF;
    border-radius: 32rpx;
    box-shadow: 0 4rpx 12rpx rgba(0,0,0,0.05);
    
    .text {
      font-size: 26rpx;
      color: #0052D9;
      font-weight: 500;
    }
    
    &:active {
      opacity: 0.8;
      transform: scale(0.98);
    }
  }
}

.scroll-box {
  flex: 1;
  padding: 0 32rpx 40rpx;
  height: 0; 
}

.notify-card {
  background: #FFFFFF;
  border-radius: 24rpx;
  padding: 32rpx;
  margin-bottom: 24rpx;
  box-shadow: 0 4rpx 16rpx rgba(0,0,0,0.04);
  transition: all 0.3s;
  
  &.is-read {
    opacity: 0.6;
    background: #FAFAFA;
  }
  
  &:active {
    transform: scale(0.98);
  }
  
  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 16rpx;
    
    .title-wrap {
      display: flex;
      align-items: center;
      gap: 12rpx;
      flex: 1;
      
      .dot {
        width: 16rpx;
        height: 16rpx;
        background: $danger-color;
        border-radius: 50%;
        flex-shrink: 0;
      }
      
      .title {
        font-size: 32rpx;
        font-weight: bold;
        color: $text-color;
        line-height: 1.4;
      }
    }
    
    .time {
      font-size: 24rpx;
      color: $text-color-light;
      flex-shrink: 0;
      margin-left: 20rpx;
    }
  }
  
  .card-content {
    .desc {
      font-size: 28rpx;
      color: $text-color-muted;
      line-height: 1.5;
    }
  }
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding-top: 200rpx;
  
  .empty-icon-wrapper {
    margin-bottom: 40rpx;
    animation: float 4s ease-in-out infinite;
    
    .empty-circle {
      width: 180rpx;
      height: 180rpx;
      background: linear-gradient(135deg, #F1F5F9 0%, #E2E8F0 100%);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 16rpx 32rpx rgba(148, 163, 184, 0.15), inset 0 4rpx 8rpx rgba(255, 255, 255, 0.8);
    }
  }
  
  .empty-title {
    font-size: 34rpx;
    font-weight: bold;
    color: #475569;
    margin-bottom: 16rpx;
    letter-spacing: 2rpx;
  }
  
  .empty-desc {
    font-size: 28rpx;
    color: #94A3B8;
  }
}

@keyframes float {
  0% { transform: translateY(0px); }
  50% { transform: translateY(-12px); }
  100% { transform: translateY(0px); }
}
</style>
