<template>
  <button
    class="elderly-button"
    @click="handleClick"
    @longpress="handleLongPress"
  >
    <text class="elderly-button-text" :style="{ fontSize: `${settingsStore.fontSize}px` }">
      <slot></slot>
    </text>
  </button>
</template>

<script setup lang="ts">
import { useSettingsStore } from "@/stores/settings";

const props = defineProps({
  voiceText: {
    type: String,
    default: "",
  },
});

const emit = defineEmits(["click", "longpress"]);

const settingsStore = useSettingsStore();

// 处理原生长按事件 (长按 350ms 自动触发，无需手动写 setTimeout)
const handleLongPress = () => {
  emit("longpress");
  
  if (settingsStore.enableVoice && props.voiceText) {
    // 触发语音播报，简单示例使用 Toast 提示
    uni.showToast({
      title: `播放语音: ${props.voiceText}`,
      icon: "none",
    });
    // TODO: 实际接入可替换为 uni.createInnerAudioContext() 或 TTS 插件
  }
};

// 处理点击事件
const handleClick = (event: Event) => {
  emit("click", event);
};
</script>

<style scoped lang="scss">
@import "@/styles/variables.scss";

.elderly-button {
  /* 默认最小点击热区为 56x56px (对应约 112rpx) */
  min-width: 112rpx;
  min-height: 112rpx;
  background-color: $primary-color; /* 需在 variables.scss 中定义 */
  color: $bg-color; /* 需在 variables.scss 中定义 */
  border-radius: 16rpx;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 0 32rpx;
  margin: 16rpx 0;
  border: none;
  
  /* 修复了原代码中错误的 SCSS 嵌套语法 */
  .elderly-button-text {
    font-weight: bold;
    line-height: 1.5;
  }
}
</style>