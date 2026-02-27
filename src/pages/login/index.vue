<template>
  <view class="login-container" :style="{ '--font-size': settingsStore.fontSize + 'px' }">
    <view class="login-header">
      <image class="logo" src="/static/logo.png" mode="aspectFit"></image>
      <text class="title" :style="{ fontSize: `${settingsStore.fontSize + 4}px` }">小区老年人服务</text>
    </view>

    <view class="login-form">
      <view class="input-group">
        <text class="label" :style="{ fontSize: `${settingsStore.fontSize}px` }">账号</text>
        <input 
          class="input" 
          v-model="account" 
          placeholder="请输入账号" 
          :style="{ fontSize: `${settingsStore.fontSize}px` }"
        />
      </view>

      <view class="input-group">
        <text class="label" :style="{ fontSize: `${settingsStore.fontSize}px` }">密码</text>
        <input 
          class="input" 
          v-model="password" 
          type="password" 
          placeholder="请输入密码" 
          :style="{ fontSize: `${settingsStore.fontSize}px` }"
        />
      </view>

      <view class="button-area">
        <ElderlyButton 
          voiceText="点击登录" 
          @click="handleLogin"
          style="width: 100%;"
        >
          登 录
        </ElderlyButton>
      </view>
    </view>

    <view class="tips">
      <text :style="{ fontSize: `${settingsStore.fontSize - 2}px` }">提示：账号需包含 elderly_ 前缀</text>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref } from "vue";
import ElderlyButton from "@/components/ElderlyButton.vue";
import { useSettingsStore } from "@/stores/settings";
import { useUserStore } from "@/stores/user";

const account = ref("");
const password = ref("");

const userStore = useUserStore();
const settingsStore = useSettingsStore();

const handleLogin = () => {
	if (!account.value || !password.value) {
		uni.showToast({ title: "请输入账号和密码", icon: "none" });
		return;
	}

	// 校验账号前缀规则
	if (!account.value.startsWith("elderly_")) {
		uni.showToast({ title: "账号必须包含 elderly_ 前缀", icon: "none" });
		return;
	}

	// 模拟登录成功流程
	uni.showLoading({ title: "登录中..." });
	setTimeout(() => {
		uni.hideLoading();

		// 存储 Token 和用户信息
		userStore.setToken("mock_token_" + Date.now());
		userStore.setUserInfo({
			name: account.value.replace("elderly_", ""),
			role: "elderly",
		});

		uni.showToast({ title: "登录成功", icon: "success" });

		// 延迟跳转至首页，给老年人留出阅读 Toast 的时间
		setTimeout(() => {
			uni.switchTab({
				url: "/pages/home/index",
			});
		}, 1000);
	}, 1000);
};
</script>

<style scoped lang="scss">
@import "@/styles/variables.scss";

.login-container {
  padding: 40rpx;
  background-color: $bg-color;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.login-header {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-top: 100rpx;
  margin-bottom: 80rpx;

  .logo {
    width: 160rpx;
    height: 160rpx;
    margin-bottom: 20rpx;
  }

  .title {
    font-weight: bold;
    color: $primary-color;
  }
}

.login-form {
  .input-group {
    margin-bottom: 40rpx;

    .label {
      display: block;
      margin-bottom: 16rpx;
      font-weight: bold;
      color: $text-color;
    }

    .input {
      width: 100%;
      height: 112rpx; /* 适老化大尺寸输入框 */
      background: #F5F7FA;
      border-radius: 16rpx;
      padding: 0 32rpx;
      box-sizing: border-box;
      border: 2rpx solid #DCDFE6;
      
      &:focus {
        border-color: $primary-color;
      }
    }
  }

  .button-area {
    margin-top: 60rpx;
  }
}

.tips {
  margin-top: 40rpx;
  text-align: center;
  color: $text-color-light;
}
</style>