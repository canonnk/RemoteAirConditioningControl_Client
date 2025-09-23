<template>
  <view class="container" :class="{ 'dark-theme': isDarkMode }">
    <!-- 设备信息卡片 -->
    <view class="device-card">
      <view class="device-header">
        <view class="device-icon">
          <text class="icon">{{ device.icon }}</text>
        </view>
        <view class="device-info">
          <text class="device-name">{{ device.name }}</text>
          <text class="device-room">{{ device.room }}</text>
          <text class="device-type">{{ getDeviceTypeName() }}</text>
        </view>
        <view 
          v-if="device.hasSwitch" 
          class="device-switch"
          :class="{ 'on': device.isOn }"
          @click="toggleDevice"
        >
          <view class="switch-circle"></view>
        </view>
      </view>
      
      <view class="device-status">
        <text class="status-text">{{ device.status || (device.isOn ? '设备运行中' : '设备已关闭') }}</text>
      </view>
    </view>

    <!-- 设备控制区域 -->
    <view class="control-section" v-if="device.hasSwitch && device.isOn">
      <view class="section-header">
        <text class="section-title">设备控制</text>
      </view>
      
      <view class="control-buttons">
        <view class="control-btn" @click="showControlOptions">
          <text class="btn-icon">⚙️</text>
          <text class="btn-text">高级设置</text>
        </view>
        <view class="control-btn" @click="showTimer">
          <text class="btn-icon">⏰</text>
          <text class="btn-text">定时设置</text>
        </view>
        <view class="control-btn" @click="showScenes">
          <text class="btn-icon">🎭</text>
          <text class="btn-text">场景模式</text>
        </view>
      </view>
    </view>

    <!-- 设备信息 -->
    <view class="info-section">
      <view class="section-header">
        <text class="section-title">设备信息</text>
      </view>
      
      <view class="info-list">
        <view class="info-item">
          <text class="info-label">设备ID</text>
          <text class="info-value">{{ device.id }}</text>
        </view>
        <view class="info-item">
          <text class="info-label">设备类型</text>
          <text class="info-value">{{ getDeviceTypeName() }}</text>
        </view>
        <view class="info-item">
          <text class="info-label">所在房间</text>
          <text class="info-value">{{ device.room }}</text>
        </view>
        <view class="info-item">
          <text class="info-label">连接状态</text>
          <text class="info-value" :class="getConnectionStatus()">{{ getConnectionText() }}</text>
        </view>
        <view class="info-item">
          <text class="info-label">信号强度</text>
          <text class="info-value">{{ getSignalStrength() }}</text>
        </view>
        <view class="info-item">
          <text class="info-label">固件版本</text>
          <text class="info-value">{{ device.firmware || 'v1.2.3' }}</text>
        </view>
      </view>
    </view>

    <!-- 使用统计 -->
    <view class="stats-section">
      <view class="section-header">
        <text class="section-title">使用统计</text>
      </view>
      
      <view class="stats-grid">
        <view class="stat-item">
          <text class="stat-value">{{ todayUsage }}</text>
          <text class="stat-label">今日使用</text>
        </view>
        <view class="stat-item">
          <text class="stat-value">{{ weekUsage }}</text>
          <text class="stat-label">本周使用</text>
        </view>
        <view class="stat-item">
          <text class="stat-value">{{ monthUsage }}</text>
          <text class="stat-label">本月使用</text>
        </view>
        <view class="stat-item">
          <text class="stat-value">{{ totalUsage }}</text>
          <text class="stat-label">总计使用</text>
        </view>
      </view>
    </view>

    <!-- 操作按钮 -->
    <view class="action-section">
      <view class="action-buttons">
        <button class="action-btn secondary" @click="editDevice">
          <text class="btn-text">编辑设备</text>
        </button>
        <button class="action-btn secondary" @click="shareDevice">
          <text class="btn-text">分享设备</text>
        </button>
        <button class="action-btn danger" @click="removeDevice">
          <text class="btn-text">移除设备</text>
        </button>
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
      deviceId: null,
      deviceType: null,
      device: {
        id: 1,
        name: '智能设备',
        room: '客厅',
        icon: '📱',
        hasSwitch: false,
        isOn: false,
        status: '设备正常',
        type: 'unknown'
      },
      todayUsage: '2.5小时',
      weekUsage: '18.3小时',
      monthUsage: '76.8小时',
      totalUsage: '365.2小时',
      deviceTypes: {
        light: '智能灯具',
        airconditioner: '空调设备',
        environment: '环境监测',
        speaker: '智能音箱',
        router: '网络设备',
        cooker: '厨房电器',
        purifier: '净化设备',
        health: '健康设备',
        fan: '风扇设备',
        vacuum: '清洁设备',
        unknown: '未知设备'
      }
    };
  },
  onLoad(options) {
    if (options.id) {
      this.deviceId = options.id;
    }
    if (options.type) {
      this.deviceType = options.type;
    }
    
    this.loadDeviceData();
    
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
    
    // 加载设备数据
    loadDeviceData() {
      // 这里可以根据deviceId和deviceType加载具体设备数据
      console.log('加载设备数据:', this.deviceId, this.deviceType);
      
      // 模拟设备数据
      if (this.deviceType) {
        this.device.type = this.deviceType;
        
        switch(this.deviceType) {
          case 'light':
            this.device.icon = '💡';
            this.device.hasSwitch = true;
            this.device.isOn = false;
            break;
          case 'airconditioner':
            this.device.icon = '❄️';
            this.device.hasSwitch = true;
            this.device.isOn = true;
            break;
          case 'speaker':
            this.device.icon = '🔊';
            this.device.hasSwitch = false;
            break;
          case 'router':
            this.device.icon = '📶';
            this.device.hasSwitch = false;
            break;
          default:
            this.device.icon = '📱';
            this.device.hasSwitch = false;
        }
      }
    },
    
    // 获取设备类型名称
    getDeviceTypeName() {
      return this.deviceTypes[this.device.type] || this.deviceTypes.unknown;
    },
    
    // 获取连接状态
    getConnectionStatus() {
      // 模拟连接状态
      const isOnline = Math.random() > 0.2;
      return isOnline ? 'online' : 'offline';
    },
    
    // 获取连接状态文本
    getConnectionText() {
      return this.getConnectionStatus() === 'online' ? '在线' : '离线';
    },
    
    // 获取信号强度
    getSignalStrength() {
      const strength = Math.floor(Math.random() * 4) + 1;
      const bars = '📶'.repeat(strength) + '📵'.repeat(4 - strength);
      return `${strength}/4 ${bars}`;
    },
    
    // 切换设备开关
    toggleDevice() {
      if (!this.device.hasSwitch) return;
      
      this.device.isOn = !this.device.isOn;
      
      uni.showToast({
        title: this.device.isOn ? '设备已开启' : '设备已关闭',
        icon: 'success'
      });
      
      this.updateDeviceStatus();
    },
    
    // 显示控制选项
    showControlOptions() {
      uni.showActionSheet({
        itemList: ['亮度调节', '色温调节', '颜色选择', '自定义模式'],
        success: (res) => {
          const options = ['亮度调节', '色温调节', '颜色选择', '自定义模式'];
          uni.showToast({
            title: `选择了${options[res.tapIndex]}`,
            icon: 'none'
          });
        }
      });
    },
    
    // 显示定时设置
    showTimer() {
      uni.showActionSheet({
        itemList: ['30分钟后关闭', '1小时后关闭', '2小时后关闭', '自定义时间'],
        success: (res) => {
          const times = ['30分钟', '1小时', '2小时', '自定义时间'];
          uni.showToast({
            title: `设置${times[res.tapIndex]}后关闭`,
            icon: 'success'
          });
        }
      });
    },
    
    // 显示场景模式
    showScenes() {
      uni.showActionSheet({
        itemList: ['阅读模式', '睡眠模式', '派对模式', '浪漫模式'],
        success: (res) => {
          const scenes = ['阅读模式', '睡眠模式', '派对模式', '浪漫模式'];
          uni.showToast({
            title: `切换到${scenes[res.tapIndex]}`,
            icon: 'success'
          });
        }
      });
    },
    
    // 编辑设备
    editDevice() {
      uni.showModal({
        title: '编辑设备',
        content: '是否要编辑设备信息？',
        success: (res) => {
          if (res.confirm) {
            uni.showToast({
              title: '编辑功能开发中',
              icon: 'none'
            });
          }
        }
      });
    },
    
    // 分享设备
    shareDevice() {
      uni.showActionSheet({
        itemList: ['生成分享码', '扫码分享', '发送给好友'],
        success: (res) => {
          const actions = ['生成分享码', '扫码分享', '发送给好友'];
          uni.showToast({
            title: `${actions[res.tapIndex]}功能开发中`,
            icon: 'none'
          });
        }
      });
    },
    
    // 移除设备
    removeDevice() {
      uni.showModal({
        title: '移除设备',
        content: '确定要移除这个设备吗？移除后需要重新添加才能控制。',
        confirmColor: '#ff4757',
        success: (res) => {
          if (res.confirm) {
            uni.showLoading({
              title: '移除中...'
            });
            
            setTimeout(() => {
              uni.hideLoading();
              uni.showToast({
                title: '设备已移除',
                icon: 'success'
              });
              
              setTimeout(() => {
                uni.navigateBack();
              }, 1500);
            }, 2000);
          }
        }
      });
    },
    
    // 更新设备状态
    async updateDeviceStatus() {
      try {
        console.log('更新设备状态:', this.device);
      } catch (error) {
        console.error('更新设备状态失败:', error);
      }
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

.device-card {
  background-color: #fff;
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 20px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.dark-theme .device-card {
  background-color: #1a1a1a;
}

.device-header {
  display: flex;
  align-items: center;
  margin-bottom: 15px;
}

.device-icon {
  width: 60px;
  height: 60px;
  background-color: #f8f9fa;
  border-radius: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 15px;
}

.dark-theme .device-icon {
  background-color: #2d2d2d;
}

.icon {
  font-size: 24px;
}

.device-info {
  flex: 1;
}

.device-name {
  font-size: 20px;
  font-weight: bold;
  color: #333;
  display: block;
  margin-bottom: 5px;
}

.dark-theme .device-name {
  color: #fff;
}

.device-room {
  font-size: 14px;
  color: #999;
  display: block;
  margin-bottom: 3px;
}

.device-type {
  font-size: 12px;
  color: #666;
}

.dark-theme .device-type {
  color: #888;
}

.device-switch {
  width: 50px;
  height: 30px;
  background-color: #e5e5e5;
  border-radius: 15px;
  display: flex;
  align-items: center;
  padding: 2px;
  transition: all 0.3s ease;
}

.device-switch.on {
  background-color: #007aff;
}

.switch-circle {
  width: 26px;
  height: 26px;
  background-color: #fff;
  border-radius: 13px;
  transition: all 0.3s ease;
}

.device-switch.on .switch-circle {
  transform: translateX(20px);
}

.status-text {
  font-size: 16px;
  color: #666;
}

.dark-theme .status-text {
  color: #ccc;
}

.control-section, .info-section, .stats-section {
  background-color: #fff;
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 15px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.dark-theme .control-section,
.dark-theme .info-section,
.dark-theme .stats-section {
  background-color: #1a1a1a;
}

.section-header {
  margin-bottom: 15px;
}

.section-title {
  font-size: 16px;
  font-weight: bold;
  color: #333;
}

.dark-theme .section-title {
  color: #fff;
}

.control-buttons {
  display: flex;
  gap: 15px;
}

.control-btn {
  flex: 1;
  background-color: #f8f9fa;
  border-radius: 8px;
  padding: 15px 10px;
  text-align: center;
  border: 1px solid #e5e5e5;
}

.dark-theme .control-btn {
  background-color: #2d2d2d;
  border-color: #404040;
}

.btn-icon {
  font-size: 20px;
  display: block;
  margin-bottom: 5px;
}

.btn-text {
  font-size: 12px;
  color: #333;
}

.dark-theme .btn-text {
  color: #fff;
}

.info-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.info-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
  border-bottom: 1px solid #f0f0f0;
}

.dark-theme .info-item {
  border-bottom-color: #333;
}

.info-item:last-child {
  border-bottom: none;
}

.info-label {
  font-size: 14px;
  color: #666;
}

.dark-theme .info-label {
  color: #999;
}

.info-value {
  font-size: 14px;
  color: #333;
}

.dark-theme .info-value {
  color: #fff;
}

.info-value.online {
  color: #4caf50;
}

.info-value.offline {
  color: #f44336;
}

.stats-grid {
  display: flex;
  gap: 15px;
}

.stat-item {
  flex: 1;
  text-align: center;
  background-color: #f8f9fa;
  border-radius: 8px;
  padding: 15px 10px;
}

.dark-theme .stat-item {
  background-color: #2d2d2d;
}

.stat-value {
  font-size: 16px;
  font-weight: bold;
  color: #007aff;
  display: block;
  margin-bottom: 5px;
}

.stat-label {
  font-size: 12px;
  color: #999;
}

.action-section {
  margin-bottom: 20px;
}

.action-buttons {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.action-btn {
  width: 100%;
  height: 50px;
  border-radius: 8px;
  font-size: 16px;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
}

.action-btn.secondary {
  background-color: #f8f9fa;
  color: #333;
  border: 1px solid #e5e5e5;
}

.dark-theme .action-btn.secondary {
  background-color: #2d2d2d;
  color: #fff;
  border-color: #404040;
}

.action-btn.danger {
  background-color: #ff4757;
  color: #fff;
}

.action-btn .btn-text {
  font-size: 16px;
}
</style>