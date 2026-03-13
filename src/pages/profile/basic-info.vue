<template>
  <view class="container" :style="{ '--base-font-size': settingsStore.fontSize + 'px' }">
    <view class="security-tip">
      <view class="tip-icon">🛡️</view>
      <view class="tip-content">
        <text class="tip-title">预警保障提醒</text>
        <text class="tip-desc">为了您的生命安全，请务必真实填写紧急联系人信息。当系统检测到健康风险或您发起SOS求助时，我们将第一时间联系他们。</text>
      </view>
    </view>

    <view class="form-container">
      <!-- 个人信息组 -->
      <view class="form-group">
        <view class="group-title">👤 个人身份信息</view>
        
        <view class="form-item">
          <text class="label">姓名</text>
          <text class="value-text">{{ userStore.userInfo?.nickname || '未设置' }}</text>
          <text class="hint">(不可修改)</text>
        </view>

        <view class="form-item">
          <text class="label">年龄</text>
          <input 
            class="input" 
            type="number" 
            v-model="form.age" 
            placeholder="请输入您的年龄" 
            placeholder-class="placeholder"
          />
        </view>

        <view class="form-item">
          <text class="label">性别</text>
          <view class="radio-group">
            <view 
              class="radio-item" 
              :class="{ active: form.gender === 1 }" 
              @click="form.gender = 1"
            >
              <text class="radio-icon">{{ form.gender === 1 ? '🔘' : '⚪' }}</text>
              <text>男</text>
            </view>
            <view 
              class="radio-item" 
              :class="{ active: form.gender === 2 }" 
              @click="form.gender = 2"
            >
              <text class="radio-icon">{{ form.gender === 2 ? '🔘' : '⚪' }}</text>
              <text>女</text>
            </view>
          </view>
        </view>
      </view>

      <!-- 联系地址组 -->
      <view class="form-group">
        <view class="group-title">🏠 居住地址</view>
        <view class="form-item vertical">
          <view v-if="formattedAddress" class="address-display">
            <text class="address-text">{{ formattedAddress }}</text>
          </view>
          <text v-else class="placeholder">暂未绑定房产信息，请联系管理员</text>
        </view>
      </view>

      <!-- 紧急联系人组 -->
      <view class="form-group emergency-focus">
        <view class="group-header">
          <view class="group-title">🆘 紧急联系人 (核心保障)</view>
          <view class="quick-pick" @click="showFamilyPicker = true">从家属中选择</view>
        </view>
        <view class="form-item">
          <text class="label">联系人姓名</text>
          <input 
            class="input" 
            v-model="form.emergencyContact" 
            placeholder="如：儿子/老伴姓名" 
            placeholder-class="placeholder"
          />
        </view>
        <view class="form-item">
          <text class="label">联系电话</text>
          <input 
            class="input" 
            type="number" 
            v-model="form.emergencyPhone" 
            placeholder="请输入联系人电话" 
            placeholder-class="placeholder"
          />
        </view>
      </view>
    </view>

    <!-- 保存按钮 -->
    <view class="footer-action">
      <elderly-button @click="handleSave" :loading="submitting">保存基础资料</elderly-button>
    </view>

    <!-- 家属选择器 -->
    <up-action-sheet
      :show="showFamilyPicker"
      :actions="familyActions"
      title="请选择家属作为紧急联系人"
      @close="showFamilyPicker = false"
      @select="handleSelectFamily"
    ></up-action-sheet>
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { onShow } from '@dcloudio/uni-app';
import { useSettingsStore } from '@/stores/settings';
import { useUserStore } from '@/stores/user';
import ElderlyButton from '@/components/ElderlyButton.vue';
import { getMyProfile, updateMyProfile } from '@/api/profile';
import { getMyFamilyList, type FamilyBindingModel } from '@/api/family';

const settingsStore = useSettingsStore();
const userStore = useUserStore();

const submitting = ref(false);
const showFamilyPicker = ref(false);
const familyList = ref<FamilyBindingModel[]>([]);

const familyActions = computed(() => {
  return familyList.value.map(item => ({
    name: `${item.family.realName || item.family.nickname} (${item.relation || '亲属'})`,
    subname: item.family.phone,
    value: item
  }));
});

const form = ref({
  age: 0,
  gender: 1,
  houseId: null as number | null,
  emergencyContact: '',
  emergencyPhone: ''
});

const profileInfo = ref<any>(null);

const handleSelectFamily = (action: any) => {
  const item = action.value as FamilyBindingModel;
  form.value.emergencyContact = item.family.realName || item.family.nickname;
  form.value.emergencyPhone = item.family.phone;
  showFamilyPicker.value = false;
  uni.showToast({ title: '已填入联系人信息', icon: 'none' });
};

const loadFamily = async () => {
  try {
    const res = await getMyFamilyList();
    familyList.value = res.data;
  } catch (err) {
    console.error('Failed to load family list', err);
  }
};

const formattedAddress = computed(() => {
  const house = profileInfo.value?.house;
  if (!house) return '';
  const communityName = house.community?.name || '';
  return `${communityName} ${house.buildingNo}-${house.unitNo}-${house.roomNo}`;
});

const loadProfile = async () => {
  try {
    const res: any = await getMyProfile();
    if (res.data) {
      profileInfo.value = res.data;
      form.value = {
        age: res.data.age || 0,
        gender: res.data.gender || 1,
        houseId: res.data.houseId || null,
        emergencyContact: res.data.emergencyContact || '',
        emergencyPhone: res.data.emergencyPhone || ''
      };
    }
  } catch (err) {
    console.error('Failed to load profile', err);
  }
};

onShow(() => {
  loadProfile();
  loadFamily();
});

const handleSave = async () => {
  if (!form.value.emergencyContact || !form.value.emergencyPhone) {
    uni.showToast({ title: '请填写紧急联系方式', icon: 'none' });
    return;
  }

  submitting.value = true;
  try {
    await updateMyProfile(form.value);
    uni.showToast({ title: '保存成功', icon: 'success' });
    setTimeout(() => {
      uni.navigateBack();
    }, 1500);
  } catch (err) {
    uni.showToast({ title: '保存失败，请重试', icon: 'none' });
  } finally {
    submitting.value = false;
  }
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

.form-group {
  background-color: #FFFFFF;
  border-radius: 32rpx;
  padding: 32rpx;
  margin-bottom: 32rpx;
  box-shadow: 0 4rpx 16rpx rgba(0,0,0,0.03);

  .group-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 32rpx;
    padding-bottom: 16rpx;
    border-bottom: 2rpx solid #F0F0F0;
    .group-title {
      margin-bottom: 0;
      border-bottom: none;
    }
    .quick-pick {
      font-size: 26rpx;
      color: $primary-color;
      background-color: $primary-light;
      padding: 8rpx 20rpx;
      border-radius: 40rpx;
      font-weight: bold;
    }
  }

  .group-title {
    font-size: 32rpx;
    font-weight: bold;
    color: $primary-color;
    margin-bottom: 32rpx;
    padding-bottom: 16rpx;
    border-bottom: 2rpx solid #F0F0F0;
  }

  &.emergency-focus {
    border: 4rpx solid rgba($danger-color, 0.4);
    background: linear-gradient(to bottom, #FFF1F2, #FFFFFF);
    
    .group-title {
      color: $danger-color;
      border-bottom-color: rgba($danger-color, 0.1);
    }
  }
}

.security-tip {
  margin-bottom: 32rpx;
  background: #1E293B;
  color: #FFFFFF;
  padding: 32rpx;
  border-radius: 32rpx;
  display: flex;
  gap: 20rpx;
  box-shadow: 0 12rpx 24rpx rgba(0,0,0,0.1);

  .tip-icon { font-size: 48rpx; line-height: 1; }
  .tip-content {
    flex: 1;
    .tip-title { font-size: 30rpx; font-weight: bold; display: block; margin-bottom: 4rpx; color: #FCA5A5; }
    .tip-desc { font-size: 24rpx; opacity: 0.9; line-height: 1.4; }
  }
}

.form-item {
  display: flex;
  align-items: center;
  min-height: 100rpx;
  border-bottom: 1rpx solid #FAFAFA;
  
  &:last-child { border-bottom: none; }

  &.vertical {
    flex-direction: column;
    align-items: flex-start;
    padding: 20rpx 0;
  }

  .label {
    width: 200rpx;
    font-size: 30rpx;
    color: #666;
  }

  .value-text {
    flex: 1;
    font-size: 30rpx;
    font-weight: bold;
    color: #333;
  }

  .hint {
    font-size: 24rpx;
    color: #999;
    margin-left: 12rpx;
  }

  .input {
    flex: 1;
    height: 80rpx;
    font-size: 34rpx;
    color: #333;
    font-weight: 500;
  }

  .textarea {
    width: 100%;
    min-height: 160rpx;
    font-size: 32rpx;
    color: #333;
    padding: 12rpx 0;
  }

  .address-display {
    background: #F8FAFC;
    padding: 24rpx;
    border-radius: 16rpx;
    width: 100%;
    box-sizing: border-box;
    border: 1rpx solid #E2E8F0;

    .address-text {
      font-size: 32rpx;
      color: #334155;
      font-weight: bold;
      line-height: 1.5;
    }
  }

  .placeholder {
    color: #CCC;
    font-weight: normal;
  }
}

.radio-group {
  flex: 1;
  display: flex;
  gap: 40rpx;

  .radio-item {
    display: flex;
    align-items: center;
    gap: 12rpx;
    font-size: 32rpx;
    background: #F8F9FA;
    padding: 12rpx 32rpx;
    border-radius: 40rpx;
    transition: all 0.2s;

    .radio-icon {
      font-size: 36rpx;
    }

    &.active {
      background: $primary-light;
      color: $primary-color;
      font-weight: bold;
    }
  }
}

.footer-action {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 32rpx 40rpx 60rpx;
  background: rgba(255,255,255,1); // 使用完全不透明背景以防止透视
  backdrop-filter: blur(10px);
  box-shadow: 0 -4rpx 16rpx rgba(0,0,0,0.05);
  z-index: 999; // 确保在最顶层
}
</style>
