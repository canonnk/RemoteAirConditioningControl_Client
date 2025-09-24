// 主题管理工具类
export default {
  // 获取当前主题模式
  isDarkMode() {
    return uni.getStorageSync('isDarkMode') || false;
  },
  
  // 设置主题模式
  setDarkMode(isDark) {
    uni.setStorageSync('isDarkMode', isDark);
    
    // 触发主题变化事件
    uni.$emit('themeChanged', isDark);
  },
  
  // 切换主题模式
  toggleTheme() {
    const currentMode = this.isDarkMode();
    this.setDarkMode(!currentMode);
    return !currentMode;
  },
  
  // 根据系统主题自动设置
  setAutoTheme() {
    // 获取系统主题
    uni.getSystemInfo({
      success: (res) => {
        if (res.theme) {
          const isDark = res.theme === 'dark';
          this.setDarkMode(isDark);
        }
      }
    });
  }
};