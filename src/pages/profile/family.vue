<template>
  <view class="container" :style="{ '--base-font-size': settingsStore.fontSize + 'px' }">
    <view v-if="loading" class="loading-state">
      <up-loading-icon text="查询中..." mode="circle"></up-loading-icon>
    </view>

    <view v-else-if="familyList.length > 0" class="family-list">
      <view class="family-card" v-for="item in familyList" :key="item.id">
        <image 
          class="avatar" 
          :src="item.family.avatar || 'https://img.js.design/assets/illustration/63f46f48a97217578205691e/preview.png'" 
          mode="aspectFill" 
        />
        <view class="info">
          <view class="name-row">
            <text class="name" :style="{ fontSize: settingsStore.fontSize + 'px' }">
              {{ item.family.realName || item.family.nickname || '神秘亲属' }}
            </text>
            <view class="relation-tag" :class="getRelationClass(item.relation)">{{ item.relation || '亲属' }}</view>
          </view>
          <view class="phone-row" v-if="item.family.phone" @click="makePhoneCall(item.family.phone)">
            <text class="phone">联系电话：{{ item.family.phone }}</text>
            <text class="call-hint">拨打</text>
          </view>
          <text class="binding-time">绑定于：{{ formatTime(item.createdAt) }}</text>
        </view>
        <view class="actions">
          <view class="action-btn unbind" @click="handleUnbind(item)">
            <text class="icon">💔</text>
            <text class="label">解绑</text>
          </view>
        </view>
      </view>
    </view>

    <view v-else class="empty-state">
      <image class="empty-img" src="https://img.js.design/assets/illustration/63f46f48a97217578205691e/preview.png" mode="aspectFit" />
      <text class="tip">暂无绑定的家属信息</text>
      <text class="sub-tip">您可以让家属在“家属端”扫描您的专属二维码完成绑定。</text>
    </view>

  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { onShow } from '@dcloudio/uni-app';
import { useSettingsStore } from '@/stores/settings';
import { getMyFamilyList, unbindFamily, type FamilyBindingModel } from '@/api/family';
import { getMyProfile, updateMyProfile } from '@/api/profile';

const settingsStore = useSettingsStore();
const familyList = ref<FamilyBindingModel[]>([]);
const loading = ref(true);

const fetchFamilyList = async () => {
  try {
    loading.value = true;
    const res = await getMyFamilyList();
    familyList.value = res.data;
  } catch (err) {
    console.error('Fetch family list failed:', err);
  } finally {
    loading.value = false;
  }
};

onShow(() => {
  fetchFamilyList();
});

const getRelationClass = (relation: string) => {
  if (!relation) return '';
  if (relation.includes('子') || relation.includes('女')) return 'child';
  if (relation.includes('伴') || relation.includes('妻') || relation.includes('夫')) return 'spouse';
  return '';
};

const handleUnbind = (item: FamilyBindingModel) => {
  uni.showModal({
    title: '解除绑定确认',
    content: `确定要解除与 [${item.family.realName || item.family.nickname}] 的家属绑定关系吗？解除后其将无法查看您的健康数据。`,
    confirmColor: '#EF4444',
    success: async (res) => {
      if (res.confirm) {
        try {
          await unbindFamily(item.familyId);
          uni.showToast({ title: '已解除绑定', icon: 'success' });
          fetchFamilyList();

          // 同步清理基础资料中可能的紧急联系人
          try {
            const profileRes: any = await getMyProfile();
            if (profileRes.data && profileRes.data.emergencyPhone === item.family.phone) {
              await updateMyProfile({
                age: profileRes.data.age || 0,
                gender: profileRes.data.gender || 1,
                houseId: profileRes.data.houseId || null,
                emergencyContact: '',
                emergencyPhone: ''
              });
            }
          } catch (e) {
            console.error('Failed to cleanup emergency contact', e);
          }
        } catch (err) {
          uni.showToast({ title: '解绑失败', icon: 'none' });
        }
      }
    }
  });
};

const formatTime = (timeStr: string) => {
  if (!timeStr) return '';
  const date = new Date(timeStr);
  return `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}`;
};
const makePhoneCall = (phoneNumber: string) => {
  uni.makePhoneCall({
    phoneNumber
  });
};
</script>

<style scoped lang="scss">
@import "@/styles/variables.scss";

.container {
  min-height: 100vh;
  background-color: #F8F9FA;
  padding: 32rpx;
  padding-bottom: 200rpx;
}

.loading-state, .empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding-top: 200rpx;
}

.empty-state {
  .empty-img {
    width: 300rpx;
    height: 300rpx;
    margin-bottom: 32rpx;
    opacity: 0.6;
  }
  .tip {
    font-size: 32rpx;
    color: $text-color;
    font-weight: bold;
    margin-bottom: 16rpx;
  }
  .sub-tip {
    font-size: 26rpx;
    color: $text-color-light;
    text-align: center;
    padding: 0 80rpx;
  }
}

.family-list {
  display: flex;
  flex-direction: column;
  gap: 24rpx;
}

.family-card {
  background-color: #FFFFFF;
  border-radius: 32rpx;
  padding: 32rpx;
  display: flex;
  align-items: center;
  gap: 24rpx;
  box-shadow: $item-shadow;
  position: relative;

  .avatar {
    width: 120rpx;
    height: 120rpx;
    border-radius: 60rpx;
    background-color: #F0F0F0;
  }

  .info {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 8rpx;

    .name-row {
      display: flex;
      align-items: center;
      gap: 12rpx;
      .name {
        font-weight: bold;
        color: $text-color;
      }
      .relation-tag {
        font-size: 20rpx;
        background-color: #F3F4F6;
        color: #6B7280;
        padding: 4rpx 12rpx;
        border-radius: 8rpx;
        font-weight: bold;
        &.child { background-color: #F0FDF4; color: #16A34A; }
        &.spouse { background-color: #FEF2F2; color: #DC2626; }
      }
    }

    .phone-row {
      display: flex;
      align-items: center;
      gap: 12rpx;
      margin-top: 4rpx;
      .phone {
        font-size: 26rpx;
        color: $text-color-muted;
      }
      .call-hint {
        font-size: 20rpx;
        color: $primary-color;
        border: 1rpx solid $primary-color;
        padding: 0 8rpx;
        border-radius: 4rpx;
      }
      &:active { opacity: 0.6; }
    }

    .binding-time {
      font-size: 22rpx;
      color: #BBB;
    }
  }

  .actions {
    display: flex;
    flex-direction: column;
    gap: 16rpx;
    
    .action-btn {
      width: 100rpx;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 4rpx;
      
      .icon { font-size: 32rpx; }
      .label { font-size: 20rpx; color: #666; }
      
      &.unbind {
        .label { color: $danger-color; }
      }
      
      &:active { opacity: 0.7; }
    }
  }
}


</style>
