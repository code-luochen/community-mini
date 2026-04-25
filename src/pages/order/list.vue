<template>
  <view class="container" :style="{ '--base-font-size': settingsStore.fontSize + 'px' }">
    <!-- 1. 顶部自定义导航与分类大 Tab -->
    <view class="fixed-top">
      <view class="nav-bar">
        <text class="nav-title" :style="{ fontSize: (settingsStore.fontSize + 4) + 'px' }">我的订单</text>
      </view>
      <view class="tabs-container">
        <!-- 适老化定制大 Tab -->
        <view 
          v-for="(item, index) in tabList" 
          :key="item.value"
          class="tab-item"
          :class="{ active: currentTab === index }"
          @click="handleTabChange(index)"
        >
          <text class="tab-label" :style="{ fontSize: settingsStore.fontSize + 'px' }">
            {{ item.name }}
          </text>
          <view v-if="currentTab === index" class="tab-line"></view>
        </view>
      </view>
    </view>

    <!-- 占位高度防止遮挡 -->
    <view class="placeholder-top"></view>

    <!-- 2. 核心列表区 -->
    <view class="list-area">
      <view v-if="orderList.length > 0">
        <view class="order-card" v-for="order in orderList" :key="order.id">
          <!-- 订单头部 -->
          <view class="card-header">
            <view class="order-no">
               <text class="icon">📦</text>
               <text class="sn">单号：{{ order.orderNo.substring(0, 15) }}...</text>
            </view>
            <view class="status-pill" :class="getStatusClass(order.status)">
              {{ formatStatus(order.status) }}
            </view>
          </view>
          
          <!-- 订单主体 -->
          <view class="card-body">
            <image class="service-img" :src="getServiceImage(order)" mode="aspectFit" />
            <view class="service-info">
              <view class="service-name-row">
                <text class="service-name" :style="{ fontSize: (settingsStore.fontSize + 2) + 'px' }">
                  {{ order.serviceSnapshot?.name || '社区服务' }}
                </text>
                <view v-if="order.isServiceDeleted" class="deleted-badge">已下架</view>
              </view>
              <text class="service-time">创建时间：{{ formatDate(order.createdAt) }}</text>
              <view class="price-row">
                <text class="price-label">金额</text>
                <text class="price-val">¥{{ order.serviceSnapshot.price }}</text>
              </view>
            </view>
          </view>

          <!-- 订单操作尾部 -->
          <view class="card-footer" v-if="order.status === 2 || order.status === 3">
            <view class="divider"></view>
            <view class="action-btn-group">
               <u-button 
                 v-if="order.status === 2" 
                 type="primary" 
                 shape="circle" 
                 :customStyle="btnStyle"
                 @click="onConfirm(order)"
               >
                 确认服务完成
               </u-button>
               
               <u-button 
                 v-if="order.status === 3 && !order.evaluation" 
                 type="warning" 
                 shape="circle" 
                 :customStyle="btnStyle"
                 @click="openEvaluatePopup(order)"
               >
                 给服务评分
               </u-button>
            </view>
          </view>
        </view>

        <!-- 加载更多提示 -->
        <view class="loadmore-box">
          <u-loadmore :status="loadStatus" :loadText="loadTextOptions" />
        </view>
      </view>

      <!-- 3. 空白预警提示 -->
      <view v-else-if="!loading" class="empty-state">
        <u-empty mode="order" icon="http://cdn.uviewui.com/uview/empty/order.png" text="暂无相关订单"></u-empty>
      </view>
    </view>

    <!-- 4. 评价底部弹窗 -->
    <u-popup v-model="showPopup" mode="bottom" round="40rpx" @close="closePopup">
      <view class="evaluate-popup">
        <view class="popup-header">
          <text class="popup-title" :style="{ fontSize: (settingsStore.fontSize + 4) + 'px' }">服务评价</text>
          <text class="close-icon" @click="closePopup">✕</text>
        </view>
        <text class="popup-desc">请为此次服务进行打分，您的评价能帮助我们改进服务质量。</text>

        <view class="rate-box">
          <u-rate v-model="evalForm.star" :count="5" size="40" activeColor="#F59E0B" :allowHalf="false"></u-rate>
          <text class="rate-tip" :style="{ fontSize: (settingsStore.fontSize - 2) + 'px' }">
             {{ evalForm.star ? `${evalForm.star}星` : '点击星星打分' }}
          </text>
        </view>

        <view class="input-box">
          <u-textarea 
            v-model="evalForm.content" 
            placeholder="这服务怎么样？写点评语吧..." 
            count 
            maxlength="100"
            height="180rpx"
            style="background: #F8FAFC"
          ></u-textarea>
        </view>
        
        <u-button 
          class="submit-eval-btn" 
          type="primary" 
          shape="circle" 
          :customStyle="submitBtnStyle"
          @click="submitEvaluate"
        >
          提交评价
        </u-button>
      </view>
    </u-popup>
  </view>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue';
import { onLoad, onShow, onReachBottom, onPullDownRefresh } from '@dcloudio/uni-app';
import { useSettingsStore } from '@/stores/settings';
import { useUserStore } from '@/stores/user';
import { getOrderList, confirmOrder, evaluateOrder,type OrderModel } from '@/api/order';

const settingsStore = useSettingsStore();
const userStore = useUserStore();

// UI 样式与词典
const btnStyle = { height: '80rpx', padding: '0 40rpx', fontSize: '32rpx', fontWeight: 'bold' };
const submitBtnStyle = { height: '110rpx', fontSize: '36rpx', fontWeight: 'bold', marginTop: '40rpx' };
const loadTextOptions = { loadmore: '上滑加载更多', loading: '正在加载中', nomore: '我也是有底线的' };

const tabList = [
  { name: '全部', value: '' },
  { name: '待接单', value: 0 },
  { name: '配送中', value: 2 },
  { name: '待评价', value: 3 },
];

// 核心状态数据
const currentTab = ref(0);
const orderList = ref<OrderModel[]>([]);
const page = ref(1);
const limit = ref(10);
const loadStatus = ref('loadmore'); // loadmore, loading, nomore
const loading = ref(true);

// 评价弹窗状态
const showPopup = ref(false);
const activeOrderId = ref('');
const evalForm = reactive({ star: 0, content: '' });

// 页面生命周期
onLoad(() => {
  // 仅初始化配置信息
});

onShow(() => {
  // 对于列表页，onShow保证每次返回都能看见最新状态
  if (userStore.token) {
    refreshList();
  }
});

onPullDownRefresh(() => {
  refreshList(true);
});

onReachBottom(() => {
  if (loadStatus.value === 'nomore') return;
  loadMore();
});

// 列表查询核心逻辑
const fetchOrders = async (isRefresh = false) => {
  if (loadStatus.value === 'loading' && !isRefresh) return;
  
  if (isRefresh) {
    page.value = 1;
    loadStatus.value = 'loadmore';
  }
  
  loading.value = true;
  loadStatus.value = 'loading';
  
  try {
    const statusParam = tabList[currentTab.value].value;
    const params: Record<string, any> = {
      page: page.value,
      limit: limit.value,
    };
    
    // 强制当前登录人的角色过滤 (避免全部订单一起查出)
    if (userStore.userInfo && userStore.userInfo.id) {
      params.elderlyId = userStore.userInfo.id;
    }
    
    if (statusParam !== '') {
      params.status = Number(statusParam);
    }

    const {data} = await getOrderList(params);
    const newList = data.items || [];
    if (isRefresh) {
      orderList.value = newList;
      if (isRefresh) uni.stopPullDownRefresh();
    } else {
      orderList.value = [...orderList.value, ...newList];
    }

    if (newList.length < limit.value || data.total <= orderList.value.length) {
      loadStatus.value = 'nomore';
    } else {
      loadStatus.value = 'loadmore';
    }
  } catch (err) {
    console.error('Fetch Order List Error:', err);
    loadStatus.value = 'loadmore';
  } finally {
    loading.value = false;
  }
};

const refreshList = (fromPull = false) => fetchOrders(true);
const loadMore = () => { page.value++; fetchOrders(false); };

const handleTabChange = (index: number) => {
  if (currentTab.value === index) return;
  currentTab.value = index;
  refreshList();
};

// 订单操作流转
const onConfirm = (order: OrderModel) => {
  uni.showModal({
    title: '确认服务完成',
    content: '服务人员已完成您的服务了吗？',
    confirmColor: '#0891B2',
    success: async (res) => {
      if (res.confirm) {
        uni.showLoading({ title: '处理中' });
        try {
          await confirmOrder(order.id);
          uni.showToast({ title: '确认成功', icon: 'success' });
          refreshList();
        } catch (e) {
          // err logged in request util
        }
      }
    }
  });
};

// 评价逻辑
const openEvaluatePopup = (order: OrderModel) => {
  activeOrderId.value = order.id;
  evalForm.star = 0;
  evalForm.content = '';
  showPopup.value = true;
};

const closePopup = () => showPopup.value = false;

const submitEvaluate = async () => {
  if (!evalForm.star) {
    uni.showToast({ title: '请点亮星星打分', icon: 'none' });
    return;
  }
  try {
    await evaluateOrder(activeOrderId.value, evalForm.star, evalForm.content);
    uni.showToast({ title: '评价成功，感谢反馈', icon: 'success' });
    closePopup();
    refreshList();
  } catch (err) {
    //
  }
};

// 工具函数
const getServiceImage = (order: OrderModel) => {
  if (order.serviceSnapshot?.imageUrl) {
    if (order.serviceSnapshot.imageUrl.startsWith('http')) {
      return order.serviceSnapshot.imageUrl;
    }
    return 'http://127.0.0.1:3000' + order.serviceSnapshot.imageUrl;
  }
  return '/static/logo.png';
};

const formatStatus = (s: number) => {
  const map: Record<number, string> = {
    0: '待接单', 1: '已接单', 2: '配送中', 3: '待评价', 4: '已完成', 5: '已取消'
  };
  return map[s] || '未知';
};

const getStatusClass = (s: number) => {
  if (s === 0) return 'primary';
  if (s === 1 || s === 2 || s === 3) return 'warning';
  if (s === 4) return 'success';
  return 'muted';
};

const formatDate = (dateStr: string) => {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return `${d.getMonth()+1}月${d.getDate()}日 ${d.getHours()}:${d.getMinutes().toString().padStart(2,'0')}`;
};
</script>

<style scoped lang="scss">
@import "@/styles/variables.scss";

.container {
  min-height: 100vh;
  background-color: $bg-color; // 采用设计系统的极浅青色背景
}

// 顶部固定区
.fixed-top {
  position: fixed;
  top: 0; left: 0; right: 0;
  background: #FFFFFF;
  z-index: 99;
  box-shadow: 0 4rpx 16rpx rgba(8, 145, 178, 0.05);

  .nav-bar {
    padding: calc(env(safe-area-inset-top) + 20rpx) 32rpx 20rpx;
    text-align: center;
    .nav-title { font-weight: 900; color: $text-color; }
  }

  .tabs-container {
    display: flex;
    padding: 0 20rpx;
    height: 110rpx;
    align-items: center;
    
    .tab-item {
      flex: 1;
      height: 100%;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      position: relative;
      
      .tab-label {
        font-weight: bold;
        color: $text-color-light;
        transition: all 0.2s;
      }
      &.active .tab-label {
        color: $primary-color;
        transform: scale(1.1);
      }
      .tab-line {
        position: absolute;
        bottom: 8rpx;
        width: 48rpx;
        height: 8rpx;
        background: $primary-color;
        border-radius: 4rpx;
      }
    }
  }
}
.placeholder-top { height: calc(env(safe-area-inset-top) + 200rpx); }

// 列表区
.list-area { padding: 32rpx; padding-bottom: 80rpx; }

.order-card {
  background: #FFFFFF;
  border-radius: 32rpx;
  padding: 32rpx;
  margin-bottom: 32rpx;
  box-shadow: $card-shadow;

  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 24rpx;
    
    .order-no {
      display: flex; align-items: center;
      .icon { margin-right: 12rpx; font-size: 32rpx; }
      .sn { font-size: 26rpx; color: $text-color-muted; }
    }
    
    .status-pill {
      padding: 6rpx 20rpx;
      border-radius: 20rpx;
      font-size: 24rpx;
      font-weight: bold;
      &.primary { background: $primary-light; color: $primary-color; }
      &.warning { background: #FEF3C7; color: #D97706; }
      &.success { background: #DCFCE7; color: #16A34A; }
      &.muted { background: #F1F5F9; color: $text-color-muted; }
    }
  }

  .card-body {
    display: flex;
    gap: 24rpx;
    padding: 24rpx 0;
    
    .service-img {
      width: 160rpx; height: 160rpx;
      border-radius: 24rpx;
      background: $primary-light;
    }
    
    .service-info {
      flex: 1;
      display: flex;
      flex-direction: column;
      justify-content: space-between;

      .service-name-row {
        display: flex;
        align-items: center;
        gap: 12rpx;
      }
      .service-name { font-weight: 900; color: $text-color; }
      .service-time { font-size: 24rpx; color: $text-color-muted; }
      .deleted-badge {
        font-size: 20rpx;
        color: #fff;
        background: #ef4444;
        padding: 4rpx 12rpx;
        border-radius: 8rpx;
      }

      .price-row {
        margin-top: 10rpx;
        display: flex; align-items: baseline;
        .price-label { font-size: 24rpx; color: $text-color-light; }
        .price-val { font-size: 40rpx; font-weight: 900; color: $danger-color; margin-left: 8rpx;}
      }
    }
  }

  .card-footer {
    .divider { height: 2rpx; background: #F1F5F9; margin: 20rpx 0; }
    .action-btn-group {
      display: flex; justify-content: flex-end;
    }
  }
}

.loadmore-box { padding: 40rpx 0; }
.empty-state { padding-top: 120rpx; }

// 弹窗
.evaluate-popup {
  padding: 40rpx;
  background: #FFFFFF;
  
  .popup-header {
    display: flex; justify-content: space-between; align-items: center;
    margin-bottom: 20rpx;
    .popup-title { font-weight: 900; color: $text-color; }
    .close-icon { font-size: 40rpx; color: $text-color-muted; padding: 10rpx; }
  }
  
  .popup-desc {
    display: block; font-size: 28rpx; color: $text-color-light;
    margin-bottom: 40rpx; line-height: 1.5;
  }
  
  .rate-box {
    display: flex; flex-direction: column; align-items: center; gap: 20rpx;
    margin-bottom: 50rpx;
    background: #F8FAFC; padding: 40rpx; border-radius: 32rpx;
    .rate-tip { color: #D97706; font-weight: bold; }
  }
  
  .input-box {
    margin-bottom: 40rpx;
  }
}
</style>
