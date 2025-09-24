// 主题管理工具类
export default {
  // 主题常量
  THEME_KEY: 'app_theme',
  THEMES: {
    LIGHT: 'light',
    DARK: 'dark'
  },
  
  // 获取当前主题
  getCurrentTheme() {
    return uni.getStorageSync(this.THEME_KEY) || this.THEMES.LIGHT;
  },
  
  // 设置主题
  setTheme(theme) {
    uni.setStorageSync(this.THEME_KEY, theme);
    this.applyTheme(theme);
  },
  
  // 是否为深色模式
  isDarkMode() {
    return this.getCurrentTheme() === this.THEMES.DARK;
  },
  
  // 切换主题
  toggleTheme() {
    const currentTheme = this.getCurrentTheme();
    const newTheme = currentTheme === this.THEMES.LIGHT ? this.THEMES.DARK : this.THEMES.LIGHT;
    this.setTheme(newTheme);
    return newTheme;
  },
  
  // 应用主题
  applyTheme(theme) {
    // 设置状态栏样式
    this.setStatusBarStyle(theme);
    
    // 设置导航栏样式
    this.setNavigationBarStyle(theme);
    
    // 设置tabbar样式
    this.setTabBarStyle(theme);
    
    // 触发全局主题变更事件
    uni.$emit('themeChanged', theme === this.THEMES.DARK);
  },
  
  // 设置状态栏样式
  setStatusBarStyle(theme) {
    // #ifdef APP-PLUS
    const statusBarStyle = theme === this.THEMES.DARK ? 'light' : 'dark';
    plus.navigator.setStatusBarStyle(statusBarStyle);
    // #endif
    
    // #ifdef MP-WEIXIN
    wx.setNavigationBarColor({
      frontColor: theme === this.THEMES.DARK ? '#ffffff' : '#000000',
      backgroundColor: theme === this.THEMES.DARK ? '#2d2d2d' : '#ffffff'
    });
    // #endif
  },
  
  // 设置导航栏样式
  setNavigationBarStyle(theme) {
    const style = {
      frontColor: theme === this.THEMES.DARK ? '#ffffff' : '#000000',
      backgroundColor: theme === this.THEMES.DARK ? '#2d2d2d' : '#ffffff',
	  animation: {
	  	duration: 300,
	  	timingFunc: 'easeIn'
	  }
    };
    
    // 动态设置导航栏样式
    uni.setNavigationBarColor(style);
  },
  
  // 设置tabbar样式
  setTabBarStyle(theme) {
    const tabBarStyle = {
      color: theme === this.THEMES.DARK ? '#8e8e93' : '#7A7E83',
      selectedColor: '#007aff',
      backgroundColor: theme === this.THEMES.DARK ? '#1c1c1e' : '#ffffff',
      borderStyle: theme === this.THEMES.DARK ? 'white' : 'black'
    };
    
    // 动态设置tabbar样式
    uni.setTabBarStyle(tabBarStyle);
  },
  
  // 初始化主题
  initTheme() {
    const theme = this.getCurrentTheme();
    this.applyTheme(theme);
    
    // 监听系统主题变化（如果支持）
    this.watchSystemTheme();
  },
  
  // 监听系统主题变化
  watchSystemTheme() {
    // #ifdef APP-PLUS
    // 监听系统深色模式变化
    if (plus.navigator.isImmersedStatusbar) {
      // 这里可以添加系统主题监听逻辑
    }
    // #endif
  },
  
  // 获取主题样式
  getThemeStyles(theme = null) {
    const currentTheme = theme || this.getCurrentTheme();
    
    if (currentTheme === this.THEMES.DARK) {
      return {
        // 深色主题样式
        backgroundColor: '#1a1a1a',
        cardBackgroundColor: '#2d2d2d',
        textColor: '#ffffff',
        secondaryTextColor: '#cccccc',
        borderColor: '#404040',
        primaryColor: '#007aff',
        successColor: '#28a745',
        warningColor: '#ffc107',
        errorColor: '#dc3545'
      };
    } else {
      return {
        // 浅色主题样式
        backgroundColor: '#f8f9fa',
        cardBackgroundColor: '#ffffff',
        textColor: '#333333',
        secondaryTextColor: '#666666',
        borderColor: '#e1e5e9',
        primaryColor: '#007aff',
        successColor: '#28a745',
        warningColor: '#ffc107',
        errorColor: '#dc3545'
      };
    }
  },
  
  // 获取主题CSS变量
  getThemeCSSVars(theme = null) {
    const styles = this.getThemeStyles(theme);
    const cssVars = {};
    
    Object.keys(styles).forEach(key => {
      const cssKey = '--' + key.replace(/([A-Z])/g, '-$1').toLowerCase();
      cssVars[cssKey] = styles[key];
    });
    
    return cssVars;
  }
};