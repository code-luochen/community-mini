import { defineStore } from 'pinia';
import { ref } from 'vue';

export const useSettingsStore = defineStore('settings', () => {
  // fontSize 支持 18px、20px、24px 三档，默认为 20px
  const fontSize = ref<number>(uni.getStorageSync('fontSize') || 20);
  
  // 语音播报开关，默认为开启
  const enableVoice = ref<boolean>(uni.getStorageSync('enableVoice') !== false);

  const setFontSize = (size: number) => {
    if ([18, 20, 24].includes(size)) {
      fontSize.value = size;
      uni.setStorageSync('fontSize', size);
    }
  };

  const toggleVoice = () => {
    enableVoice.value = !enableVoice.value;
    uni.setStorageSync('enableVoice', enableVoice.value);
  };

  return {
    fontSize,
    enableVoice,
    setFontSize,
    toggleVoice,
  };
});
