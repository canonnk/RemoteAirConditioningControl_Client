<template>
  <view class="container" :class="{ 'dark-theme': isDarkMode }">
    <view class="header">
      <text class="title">设置</text>
    </view>
    
    <view class="settings-list">
      <!-- 主题设置 -->
      <view class="settings-section">
        <text class="section-title">外观</text>
        <view class="setting-item">
          <view class="setting-info">
            <text class="setting-title">深色模式</text>
            <text class="setting-desc">开启后界面将使用深色主题</text>
          </view>
          <switch 
            :checked="isDarkMode" 
            @change="toggleTheme"
            color="#007aff"
          />
        </view>
      </view>
      
      <!-- 账户设置 -->
      <view class="settings-section">
        <text class="section-title">账户</text>
        <view class="setting-item" @click="showUserInfo">
          <view class="setting-info">
            <text class="setting-title">个人信息</text>
            <text class="setting-desc">查看和编辑个人资料</text>
          </view>
          <text class="setting-arrow">></text>
        </view>
        <view class="setting-item" @click="changePhone">
          <view class="setting-info">
            <text class="setting-title">更换手机号</text>
            <text class="setting-desc">{{ userInfo?.phone || '未绑定' }}</text>
          </view>
          <text class="setting-arrow">></text>
        </view>
      </view>
      
      <!-- 通用设置 -->
      <view class="settings-section">
        <text class="section-title">通用</text>
        <view class="setting-item" @click="clearCache">
          <view class="setting-info">
            <text class="setting-title">清除缓存</text>
            <text class="setting-desc">清除应用缓存数据</text>
          </view>
          <text class="setting-arrow">></text>
        </view>
        <view class="setting-item" @click="checkUpdate">
          <view class="setting-info">
            <text class="setting-title">检查更新</text>
            <text class="setting-desc">当前版本 v1.0.0</text>
          </view>
          <text class="setting-arrow">></text>
        </view>
      </view>
      
      <!-- 关于 -->
      <view class="settings-section">
        <text class="section-title">关于</text>
        <view class="setting-item" @click="showPrivacy">
          <view class="setting-info">
            <text class="setting-title">隐私政策</text>
            <text class="setting-desc">查看隐私保护政策</text>
          </view>
          <text class="setting-arrow">></text>
        </view>
        <view class="setting-item" @click="showTerms">
          <view class="setting-info">
            <text class="setting-title">用户协议</text>
            <text class="setting-desc">查看服务条款</text>
          </view>
          <text class="setting-arrow">></text>
        </view>
        <view class="setting-item" @click="showAbout">
          <view class="setting-info">
            <text class="setting-title">关于我们</text>
            <text class="setting-desc">了解更多应用信息</text>
          </view>
          <text class="setting-arrow">></text>
        </view>
      </view>
    </view>
    
    <!-- 退出登录 -->
    <view class="logout-section">
      <button @click="logout" class="logout-btn">退出登录</button>
    </view>
  </view>
</template>

<script>
import auth from '@/utils/auth.js';
import theme from '@/utils/theme.js';

export default {
  data() {
    return {
      userInfo: null,
      isDarkMode: false
    };
  },
  async onLoad() {
    // 检查页面访问权限
    const hasAccess = await auth.checkPageAccess();
    if (hasAccess) {
      this.userInfo = auth.getUserInfo();
      this.isDarkMode = theme.isDarkMode();
    }
  },
  onShow() {
    // 每次显示页面时刷新状态
    if (auth.isLoggedIn()) {
      this.userInfo = auth.getUserInfo();
      this.isDarkMode = theme.isDarkMode();
    }
  },
  methods: {
    // 切换主题
    toggleTheme(e) {
      const isDark = e.detail.value;
      this.isDarkMode = isDark;
      theme.setTheme(isDark ? 'dark' : 'light');
      
      // 通知其他页面主题已更改
      uni.$emit('themeChanged', isDark);
      
      uni.showToast({
        title: isDark ? '已切换到深色模式' : '已切换到浅色模式',
        icon: 'success'
      });
    },
    
    // 显示个人信息
    showUserInfo() {
      if (!this.userInfo) return;
      
      uni.showModal({
        title: '个人信息',
        content: `手机号：${this.userInfo.phone}\n注册时间：${this.formatTime(this.userInfo.createTime)}\n最后登录：${this.formatTime(this.userInfo.lastLoginTime)}`,
        showCancel: false
      });
    },
    
    // 更换手机号
    changePhone() {
      uni.showModal({
        title: '提示',
        content: '更换手机号功能开发中，敬请期待',
        showCancel: false
      });
    },
    
    // 清除缓存
    clearCache() {
      uni.showModal({
        title: '确认清除',
        content: '确定要清除应用缓存吗？这不会影响您的登录状态。',
        success: (res) => {
          if (res.confirm) {
            // 这里可以添加清除缓存的逻辑
            uni.showToast({
              title: '缓存已清除',
              icon: 'success'
            });
          }
        }
      });
    },
    
    // 检查更新
    checkUpdate() {
      uni.showLoading({
        title: '检查中...'
      });
      
      setTimeout(() => {
        uni.hideLoading();
        uni.showToast({
          title: '已是最新版本',
          icon: 'success'
        });
      }, 1500);
    },
    
    // 显示隐私政策
    showPrivacy() {
      uni.showModal({
        title: '隐私政策',
        content: '我们重视您的隐私保护，详细的隐私政策请访问官网查看。',
        showCancel: false
      });
    },
    
    // 显示用户协议
    showTerms() {
      uni.showModal({
        title: '用户协议',
        content: '使用本应用即表示您同意我们的服务条款，详细条款请访问官网查看。',
        showCancel: false
      });
    },
    
    // 显示关于我们
    showAbout() {
      uni.showModal({
        title: '关于我们',
        content: '这是一个基于uni-app和uniCloud的手机登录示例应用\n\n版本：v1.0.0\n开发者：CodeBuddy',
        showCancel: false
      });
    },
    
    // 格式化时间
    formatTime(timestamp) {
      const date = new Date(timestamp);
      return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
    },
    
    // 退出登录
    logout() {
      uni.showModal({
        title: '提示',
        content: '确定要退出登录吗？',
        success: (res) => {
          if (res.confirm) {
            auth.clearToken();
            uni.showToast({
              title: '已退出登录',
              icon: 'success'
            });
            setTimeout(() => {
              auth.redirectToLogin();
            }, 1500);
          }
        }
      });
    }
  }
};
</script>

<style scoped>
.container {
  background-color: #f8f9fa;
  min-height: 100vh;
  transition: all 0.3s ease;
}

.container.dark-theme {
  background-color: #1a1a1a;
}

.header {
  background-color: #fff;
  padding: 20px;
  text-align: center;
  border-bottom: 1px solid #f0f0f0;
}

.dark-theme .header {
  background-color: #2d2d2d;
  border-bottom-color: #404040;
}

.title {
  font-size: 18px;
  font-weight: bold;
  color: #333;
}

.dark-theme .title {
  color: #fff;
}

.settings-list {
  padding: 0 20px;
}

.settings-section {
  margin-top: 20px;
}

.section-title {
  display: block;
  font-size: 14px;
  color: #999;
  margin-bottom: 10px;
  padding-left: 5px;
}

.dark-theme .section-title {
  color: #888;
}

.setting-item {
  background-color: #fff;
  padding: 15px 20px;
  margin-bottom: 1px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-radius: 8px;
}

.dark-theme .setting-item {
  background-color: #2d2d2d;
}

.setting-item:first-child {
  border-top-left-radius: 8px;
  border-top-right-radius: 8px;
}

.setting-item:last-child {
  border-bottom-left-radius: 8px;
  border-bottom-right-radius: 8px;
  margin-bottom: 0;
}

.setting-info {
  flex: 1;
}

.setting-title {
  display: block;
  font-size: 16px;
  color: #333;
  margin-bottom: 2px;
}

.dark-theme .setting-title {
  color: #fff;
}

.setting-desc {
  display: block;
  font-size: 12px;
  color: #999;
}

.dark-theme .setting-desc {
  color: #888;
}

.setting-arrow {
  font-size: 16px;
  color: #ccc;
}

.dark-theme .setting-arrow {
  color: #666;
}

.logout-section {
  margin: 30px 20px;
}

.logout-btn {
  width: 100%;
  height: 50px;
  background-color: #ff4757;
  color: #fff;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: bold;
}

.dark-theme .logout-btn {
  background-color: #e74c3c;
}
</style>