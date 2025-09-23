<template>
  <view class="container" :class="{ 'dark-theme': isDarkMode }">
    <!-- 搜索设备 -->
    <view class="search-section">
      <view class="search-header">
        <text class="search-title">添加设备</text>
        <text class="search-desc">请选择要添加的设备类型</text>
      </view>
      
      <view class="search-box">
        <text class="search-icon">🔍</text>
        <input 
          class="search-input" 
          placeholder="搜索设备名称或型号"
          v-model="searchKeyword"
          @input="onSearchInput"
        />
      </view>
    </view>

    <!-- 快速添加 -->
    <view class="quick-add-section">
      <view class="section-header">
        <text class="section-title">快速添加</text>
      </view>
      
      <view class="quick-add-buttons">
        <view class="quick-add-btn" @click="scanQRCode">
          <text class="quick-icon">📷</text>
          <text class="quick-text">扫码添加</text>
        </view>
        <view class="quick-add-btn" @click="autoDiscover">
          <text class="quick-icon">📡</text>
          <text class="quick-text">自动发现</text>
        </view>
        <view class="quick-add-btn" @click="manualAdd">
          <text class="quick-icon">✏️</text>
          <text class="quick-text">手动添加</text>
        </view>
      </view>
    </view>

    <!-- 设备分类 -->
    <view class="category-section">
      <view class="section-header">
        <text class="section-title">设备分类</text>
      </view>
      
      <view class="category-tabs">
        <text 
          v-for="category in categories" 
          :key="category.id"
          class="category-tab"
          :class="{ 'active': selectedCategory === category.id }"
          @click="selectCategory(category.id)"
        >
          {{ category.name }}
        </text>
      </view>
    </view>

    <!-- 设备列表 -->
    <view class="device-list-section">
      <view class="device-grid">
        <view 
          v-for="device in filteredDevices" 
          :key="device.id"
          class="device-item"
          @click="addDevice(device)"
        >
          <view class="device-icon-wrapper">
            <text class="device-icon">{{ device.icon }}</text>
            <view v-if="device.isPopular" class="popular-badge">
              <text class="badge-text">热门</text>
            </view>
          </view>
          <text class="device-name">{{ device.name }}</text>
          <text class="device-brand">{{ device.brand }}</text>
          <text class="device-desc">{{ device.description }}</text>
        </view>
      </view>
      
      <!-- 空状态 -->
      <view v-if="filteredDevices.length === 0" class="empty-state">
        <text class="empty-icon">📱</text>
        <text class="empty-text">暂无相关设备</text>
        <text class="empty-desc">请尝试其他搜索关键词或选择其他分类</text>
      </view>
    </view>

    <!-- 最近添加 -->
    <view class="recent-section" v-if="recentDevices.length > 0">
      <view class="section-header">
        <text class="section-title">最近添加</text>
      </view>
      
      <view class="recent-list">
        <view 
          v-for="device in recentDevices" 
          :key="device.id"
          class="recent-item"
          @click="addDevice(device)"
        >
          <text class="recent-icon">{{ device.icon }}</text>
          <view class="recent-info">
            <text class="recent-name">{{ device.name }}</text>
            <text class="recent-time">{{ device.addTime }}</text>
          </view>
          <text class="add-again-btn">再次添加</text>
        </view>
      </view>
    </view>

    <!-- 帮助信息 -->
    <view class="help-section">
      <view class="help-item" @click="showHelp">
        <text class="help-icon">❓</text>
        <text class="help-text">添加设备遇到问题？</text>
        <text class="help-arrow">></text>
      </view>
      <view class="help-item" @click="showSupported">
        <text class="help-icon">📋</text>
        <text class="help-text">查看支持的设备列表</text>
        <text class="help-arrow">></text>
      </view>
    </view>
  </view>
</template>

<script>
import theme from '@/utils/theme.js';

export default {
  data() {
    return {
      isDarkMode: false,
      searchKeyword: '',
      selectedCategory: 'all',
      categories: [
        { id: 'all', name: '全部' },
        { id: 'lighting', name: '照明' },
        { id: 'climate', name: '空调' },
        { id: 'security', name: '安防' },
        { id: 'entertainment', name: '娱乐' },
        { id: 'kitchen', name: '厨房' },
        { id: 'cleaning', name: '清洁' },
        { id: 'health', name: '健康' }
      ],
      devices: [
        // 照明设备
        {
          id: 'light_1',
          name: '智能灯泡',
          brand: '小米',
          icon: '💡',
          category: 'lighting',
          description: '支持调光调色，语音控制',
          isPopular: true,
          type: 'light'
        },
        {
          id: 'light_2',
          name: '吸顶灯',
          brand: 'Yeelight',
          icon: '🔆',
          category: 'lighting',
          description: '客厅卧室专用，护眼光源',
          isPopular: false,
          type: 'light'
        },
        {
          id: 'light_3',
          name: '台灯',
          brand: '飞利浦',
          icon: '🕯️',
          category: 'lighting',
          description: '学习办公必备，无频闪',
          isPopular: false,
          type: 'light'
        },
        
        // 空调设备
        {
          id: 'ac_1',
          name: '智能空调',
          brand: '格力',
          icon: '❄️',
          category: 'climate',
          description: '变频节能，远程控制',
          isPopular: true,
          type: 'airconditioner'
        },
        {
          id: 'ac_2',
          name: '空气净化器',
          brand: '小米',
          icon: '🌪️',
          category: 'climate',
          description: 'HEPA滤网，除甲醛PM2.5',
          isPopular: true,
          type: 'purifier'
        },
        {
          id: 'ac_3',
          name: '加湿器',
          brand: '美的',
          icon: '💨',
          category: 'climate',
          description: '超声波雾化，静音运行',
          isPopular: false,
          type: 'humidifier'
        },
        
        // 安防设备
        {
          id: 'security_1',
          name: '智能门锁',
          brand: '德施曼',
          icon: '🔐',
          category: 'security',
          description: '指纹密码，远程开锁',
          isPopular: true,
          type: 'lock'
        },
        {
          id: 'security_2',
          name: '监控摄像头',
          brand: '海康威视',
          icon: '📹',
          category: 'security',
          description: '1080P高清，夜视功能',
          isPopular: false,
          type: 'camera'
        },
        
        // 娱乐设备
        {
          id: 'entertainment_1',
          name: '智能音箱',
          brand: '天猫精灵',
          icon: '🔊',
          category: 'entertainment',
          description: '语音助手，音乐播放',
          isPopular: true,
          type: 'speaker'
        },
        {
          id: 'entertainment_2',
          name: '智能电视',
          brand: '小米',
          icon: '📺',
          category: 'entertainment',
          description: '4K超清，语音遥控',
          isPopular: false,
          type: 'tv'
        },
        
        // 厨房设备
        {
          id: 'kitchen_1',
          name: '智能电饭煲',
          brand: '美的',
          icon: '🍚',
          category: 'kitchen',
          description: 'IH加热，预约煮饭',
          isPopular: false,
          type: 'cooker'
        },
        {
          id: 'kitchen_2',
          name: '智能冰箱',
          brand: '海尔',
          icon: '🧊',
          category: 'kitchen',
          description: '变频保鲜，智能控温',
          isPopular: false,
          type: 'refrigerator'
        },
        
        // 清洁设备
        {
          id: 'cleaning_1',
          name: '扫地机器人',
          brand: '石头科技',
          icon: '🤖',
          category: 'cleaning',
          description: '激光导航，自动回充',
          isPopular: true,
          type: 'vacuum'
        },
        
        // 健康设备
        {
          id: 'health_1',
          name: '环境监测仪',
          brand: '青萍',
          icon: '🌡️',
          category: 'health',
          description: '温湿度，PM2.5检测',
          isPopular: false,
          type: 'environment'
        },
        {
          id: 'health_2',
          name: '智能体重秤',
          brand: '小米',
          icon: '⚖️',
          category: 'health',
          description: '体脂检测，健康分析',
          isPopular: false,
          type: 'scale'
        }
      ],
      recentDevices: [
        {
          id: 'recent_1',
          name: '智能灯泡',
          icon: '💡',
          addTime: '2天前',
          type: 'light'
        },
        {
          id: 'recent_2',
          name: '智能音箱',
          icon: '🔊',
          addTime: '1周前',
          type: 'speaker'
        }
      ]
    };
  },
  computed: {
    filteredDevices() {
      let devices = this.devices;
      
      // 按分类筛选
      if (this.selectedCategory !== 'all') {
        devices = devices.filter(device => device.category === this.selectedCategory);
      }
      
      // 按搜索关键词筛选
      if (this.searchKeyword.trim()) {
        const keyword = this.searchKeyword.toLowerCase();
        devices = devices.filter(device => 
          device.name.toLowerCase().includes(keyword) ||
          device.brand.toLowerCase().includes(keyword) ||
          device.description.toLowerCase().includes(keyword)
        );
      }
      
      // 热门设备排在前面
      return devices.sort((a, b) => {
        if (a.isPopular && !b.isPopular) return -1;
        if (!a.isPopular && b.isPopular) return 1;
        return 0;
      });
    }
  },
  onLoad() {
    // 初始化主题状态
    this.isDarkMode = theme.isDarkMode();
    
    // 监听主题变化
    uni.$on('themeChanged', this.onThemeChanged);
  },
  onUnload() {
    // 移除主题变化监听
    uni.$off('themeChanged', this.onThemeChanged);
  },
  methods: {
    // 主题变化回调
    onThemeChanged(isDark) {
      this.isDarkMode = isDark;
    },
    
    // 搜索输入
    onSearchInput() {
      // 实时搜索
      console.log('搜索关键词:', this.searchKeyword);
    },
    
    // 选择分类
    selectCategory(categoryId) {
      this.selectedCategory = categoryId;
    },
    
    // 扫码添加
    scanQRCode() {
      // #ifdef APP-PLUS
      uni.scanCode({
        success: (res) => {
          console.log('扫码结果:', res);
          uni.showToast({
            title: '扫码成功',
            icon: 'success'
          });
        },
        fail: (err) => {
          console.error('扫码失败:', err);
          uni.showToast({
            title: '扫码失败',
            icon: 'none'
          });
        }
      });
      // #endif
      
      // #ifndef APP-PLUS
      uni.showToast({
        title: '请在APP中使用扫码功能',
        icon: 'none'
      });
      // #endif
    },
    
    // 自动发现
    autoDiscover() {
      uni.showLoading({
        title: '搜索设备中...'
      });
      
      // 模拟搜索过程
      setTimeout(() => {
        uni.hideLoading();
        
        const foundDevices = Math.floor(Math.random() * 3) + 1;
        
        if (foundDevices > 0) {
          uni.showModal({
            title: '发现设备',
            content: `发现 ${foundDevices} 个可添加的设备，是否查看？`,
            success: (res) => {
              if (res.confirm) {
                uni.showToast({
                  title: '功能开发中',
                  icon: 'none'
                });
              }
            }
          });
        } else {
          uni.showToast({
            title: '未发现可添加的设备',
            icon: 'none'
          });
        }
      }, 3000);
    },
    
    // 手动添加
    manualAdd() {
      uni.showActionSheet({
        itemList: ['输入设备IP地址', '输入设备ID', '输入配对码'],
        success: (res) => {
          const methods = ['IP地址', '设备ID', '配对码'];
          uni.showModal({
            title: `通过${methods[res.tapIndex]}添加`,
            content: '请输入相关信息',
            editable: true,
            success: (modalRes) => {
              if (modalRes.confirm) {
                uni.showToast({
                  title: '添加成功',
                  icon: 'success'
                });
              }
            }
          });
        }
      });
    },
    
    // 添加设备
    addDevice(device) {
      uni.showModal({
        title: '添加设备',
        content: `确定要添加 ${device.name} 吗？`,
        success: (res) => {
          if (res.confirm) {
            this.performAddDevice(device);
          }
        }
      });
    },
    
    // 执行添加设备
    performAddDevice(device) {
      uni.showLoading({
        title: '添加中...'
      });
      
      // 模拟添加过程
      setTimeout(() => {
        uni.hideLoading();
        
        // 随机成功或失败
        const success = Math.random() > 0.2;
        
        if (success) {
          uni.showToast({
            title: '添加成功',
            icon: 'success'
          });
          
          // 添加到最近添加列表
          const recentDevice = {
            id: `recent_${Date.now()}`,
            name: device.name,
            icon: device.icon,
            addTime: '刚刚',
            type: device.type
          };
          
          this.recentDevices.unshift(recentDevice);
          if (this.recentDevices.length > 5) {
            this.recentDevices.pop();
          }
          
          // 延迟跳转回设备页面
          setTimeout(() => {
            uni.switchTab({
              url: '/pages/devices/devices'
            });
          }, 1500);
        } else {
          uni.showModal({
            title: '添加失败',
            content: '设备添加失败，请检查设备是否处于配网模式，或尝试重新添加。',
            showCancel: false
          });
        }
      }, 2000);
    },
    
    // 显示帮助
    showHelp() {
      uni.showModal({
        title: '添加设备帮助',
        content: '1. 确保设备已通电并处于配网模式\n2. 手机连接到2.4G WiFi网络\n3. 按照设备说明书进行操作\n4. 如仍有问题请联系客服',
        showCancel: false
      });
    },
    
    // 显示支持的设备
    showSupported() {
      const deviceCount = this.devices.length;
      const brands = [...new Set(this.devices.map(d => d.brand))];
      
      uni.showModal({
        title: '支持的设备',
        content: `当前支持 ${deviceCount} 种设备类型\n合作品牌：${brands.join('、')}\n更多设备持续接入中...`,
        showCancel: false
      });
    }
  }
};
</script>

<style scoped>
.container {
  background-color: #f8f9fa;
  min-height: 100vh;
  padding: 20px;
  transition: all 0.3s ease;
}

.container.dark-theme {
  background-color: #000000;
}

.search-section {
  margin-bottom: 25px;
}

.search-header {
  margin-bottom: 15px;
}

.search-title {
  font-size: 24px;
  font-weight: bold;
  color: #333;
  display: block;
  margin-bottom: 5px;
}

.dark-theme .search-title {
  color: #fff;
}

.search-desc {
  font-size: 14px;
  color: #999;
}

.search-box {
  display: flex;
  align-items: center;
  background-color: #fff;
  border-radius: 12px;
  padding: 12px 15px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.dark-theme .search-box {
  background-color: #1a1a1a;
}

.search-icon {
  font-size: 16px;
  margin-right: 10px;
  color: #999;
}

.search-input {
  flex: 1;
  font-size: 16px;
  color: #333;
  border: none;
  outline: none;
}

.dark-theme .search-input {
  color: #fff;
}

.quick-add-section, .category-section, .device-list-section, .recent-section, .help-section {
  margin-bottom: 25px;
}

.section-header {
  margin-bottom: 15px;
}

.section-title {
  font-size: 18px;
  font-weight: bold;
  color: #333;
}

.dark-theme .section-title {
  color: #fff;
}

.quick-add-buttons {
  display: flex;
  gap: 15px;
}

.quick-add-btn {
  flex: 1;
  background-color: #fff;
  border-radius: 12px;
  padding: 20px 15px;
  text-align: center;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.dark-theme .quick-add-btn {
  background-color: #1a1a1a;
}

.quick-icon {
  font-size: 24px;
  display: block;
  margin-bottom: 8px;
}

.quick-text {
  font-size: 14px;
  color: #333;
}

.dark-theme .quick-text {
  color: #fff;
}

.category-tabs {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.category-tab {
  padding: 8px 16px;
  background-color: #fff;
  border-radius: 20px;
  font-size: 14px;
  color: #666;
  border: 1px solid #e5e5e5;
  transition: all 0.3s ease;
}

.dark-theme .category-tab {
  background-color: #1a1a1a;
  color: #999;
  border-color: #404040;
}

.category-tab.active {
  background-color: #007aff;
  color: #fff;
  border-color: #007aff;
}

.device-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 15px;
}

.device-item {
  width: calc(50% - 7.5px);
  background-color: #fff;
  border-radius: 12px;
  padding: 20px 15px;
  text-align: center;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  position: relative;
}

.dark-theme .device-item {
  background-color: #1a1a1a;
}

.device-icon-wrapper {
  position: relative;
  margin-bottom: 12px;
}

.device-icon {
  font-size: 32px;
  display: block;
}

.popular-badge {
  position: absolute;
  top: -5px;
  right: -5px;
  background-color: #ff4757;
  border-radius: 8px;
  padding: 2px 6px;
}

.badge-text {
  font-size: 10px;
  color: #fff;
}

.device-name {
  font-size: 16px;
  font-weight: bold;
  color: #333;
  display: block;
  margin-bottom: 5px;
}

.dark-theme .device-name {
  color: #fff;
}

.device-brand {
  font-size: 12px;
  color: #007aff;
  display: block;
  margin-bottom: 8px;
}

.device-desc {
  font-size: 12px;
  color: #999;
  line-height: 1.4;
}

.empty-state {
  text-align: center;
  padding: 60px 20px;
}

.empty-icon {
  font-size: 48px;
  display: block;
  margin-bottom: 15px;
  opacity: 0.5;
}

.empty-text {
  font-size: 18px;
  color: #333;
  display: block;
  margin-bottom: 8px;
}

.dark-theme .empty-text {
  color: #fff;
}

.empty-desc {
  font-size: 14px;
  color: #999;
}

.recent-list {
  background-color: #fff;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.dark-theme .recent-list {
  background-color: #1a1a1a;
}

.recent-item {
  display: flex;
  align-items: center;
  padding: 15px 20px;
  border-bottom: 1px solid #f0f0f0;
}

.dark-theme .recent-item {
  border-bottom-color: #333;
}

.recent-item:last-child {
  border-bottom: none;
}

.recent-icon {
  font-size: 20px;
  margin-right: 15px;
}

.recent-info {
  flex: 1;
}

.recent-name {
  font-size: 16px;
  color: #333;
  display: block;
  margin-bottom: 3px;
}

.dark-theme .recent-name {
  color: #fff;
}

.recent-time {
  font-size: 12px;
  color: #999;
}

.add-again-btn {
  font-size: 14px;
  color: #007aff;
  padding: 5px 10px;
  border: 1px solid #007aff;
  border-radius: 15px;
}

.help-section {
  background-color: #fff;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.dark-theme .help-section {
  background-color: #1a1a1a;
}

.help-item {
  display: flex;
  align-items: center;
  padding: 15px 20px;
  border-bottom: 1px solid #f0f0f0;
}

.dark-theme .help-item {
  border-bottom-color: #333;
}

.help-item:last-child {
  border-bottom: none;
}

.help-icon {
  font-size: 16px;
  margin-right: 15px;
}

.help-text {
  flex: 1;
  font-size: 16px;
  color: #333;
}

.dark-theme .help-text {
  color: #fff;
}

.help-arrow {
  font-size: 16px;
  color: #999;
}
</style>