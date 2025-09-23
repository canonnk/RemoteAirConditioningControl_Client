// 认证工具类
export default {
  // 检查是否已登录
  isLoggedIn() {
    const token = uni.getStorageSync('token');
    return !!token;
  },
  
  // 获取token
  getToken() {
    return uni.getStorageSync('token');
  },
  
  // 设置token
  setToken(token) {
    uni.setStorageSync('token', token);
  },
  
  // 清除token
  clearToken() {
    uni.removeStorageSync('token');
    uni.removeStorageSync('userInfo');
  },
  
  // 获取用户信息
  getUserInfo() {
    return uni.getStorageSync('userInfo');
  },
  
  // 设置用户信息
  setUserInfo(userInfo) {
    uni.setStorageSync('userInfo', userInfo);
  },
  
  // 验证token有效性
  async validateToken() {
    const token = this.getToken();
    if (!token) {
      return false;
    }
    
    try {
      const result = await uniCloud.callFunction({
        name: 'check-token',
        data: { token }
      });
      
      if (result.result.code === 200) {
        // 更新用户信息
        this.setUserInfo(result.result.data);
        return true;
      } else {
        // token无效，清除本地存储
        this.clearToken();
        return false;
      }
    } catch (error) {
      console.error('验证token失败:', error);
      this.clearToken();
      return false;
    }
  },
  
  // 跳转到登录页面
  redirectToLogin() {
    uni.reLaunch({
      url: '/pages/login/login'
    });
  },
  
  // 检查页面访问权限
  async checkPageAccess() {
    // 获取当前页面路径
    const pages = getCurrentPages();
    const currentPage = pages[pages.length - 1];
    const currentRoute = currentPage.route;
    
    // 登录页面不需要检查权限
    if (currentRoute === 'pages/login/login') {
      return true;
    }
    
    // 检查是否已登录
    if (!this.isLoggedIn()) {
      this.redirectToLogin();
      return false;
    }
    
    // 验证token有效性
    const isValid = await this.validateToken();
    if (!isValid) {
      this.redirectToLogin();
      return false;
    }
    
    return true;
  }
};