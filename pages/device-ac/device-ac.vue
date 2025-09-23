<template>
  <view class="container" :class="{ 'dark-theme': isDarkMode }">
    <!-- 设备状态卡片 -->
    <view class="device-card">
      <view class="device-header">
        <view class="device-info">
          <text class="device-name">{{ device.name }}</text>
          <text class="device-room">{{ device.room }}</text>
        </view>
        <view class="device-switch" :class="{ 'on': device.isOn }" @click="toggleDevice">
          <view class="switch-circle"></view>
        </view>
      </view>
      
      <view class="device-status">
        <text class="status-text">{{ getStatusText() }}</text>
      </view>
    </view>

    <!-- 温度控制 -->
    <view class="temp-control" v-if="device.isOn">
      <view class="temp-display">
        <text class="temp-value">{{ targetTemp }}°</text>
        <text class="temp-label">目标温度</text>
      </view>
      <view class="temp-buttons">
        <view class="temp-btn" @click="decreaseTemp">
          <text class="btn-text">-</text>
        </view>
        <view class="temp-btn" @click="increaseTemp">
          <text class="btn-text">+</text>
        </view>
      </view>
    </view>

    <!-- 模式选择 -->
    <view class="control-section" v-if="device.isOn">
      <view class="section-header">
        <text class="section-title">运行模式</text>
      </view>
      <view class="mode-selector">
        <view 
          v-for="mode in modes" 
          :key="mode.id"
          class="mode-item"
          :class="{ 'active': selectedMode === mode.id }"
          @click="selectMode(mode)"
        >
          <text class="mode-icon">{{ mode.icon }}</text>
          <text class="mode-name">{{ mode.name }}</text>
        </view>
      </view>
    </view>

    <!-- 风速控制 -->
    <view class="control-section" v-if="device.isOn">
      <view class="section-header">
        <text class="section-title">风速</text>
        <text class="section-value">{{ getFanSpeedText() }}</text>
      </view>
      <view class="fan-speed-control">
        <view 
          v-for="(speed, index) in fanSpeeds" 
          :key="index"
          class="speed-item"
          :class="{ 'active': fanSpeed === index }"
          @click="setFanSpeed(index)"
        >
          <text class="speed-text">{{ speed }}</text>
        </view>
      </view>
    </view>

    <!-- 功能开关 -->
    <view class="control-section" v-if="device.isOn">
      <view class="section-header">
        <text class="section-title">功能设置</text>
      </view>
      <view class="function-switches">
        <view class="switch-item">
          <text class="switch-label">摆风</text>
          <switch 
            :checked="swingEnabled" 
            @change="toggleSwing"
            color="#007aff"
          />
        </view>
        <view class="switch-item">
          <text class="switch-label">睡眠模式</text>
          <switch 
            :checked="sleepMode" 
            @change="toggleSleepMode"
            color="#007aff"
          />
        </view>
        <view class="switch-item">
          <text class="switch-label">节能模式</text>
          <switch 
            :checked="ecoMode" 
            @change="toggleEcoMode"
            color="#007aff"
          />
        </view>
      </view>
    </view>

    <!-- 定时设置 -->
    <view class="control-section">
      <view class="section-header">
        <text class="section-title">定时关机</text>
        <switch 
          :checked="timerEnabled" 
          @change="toggleTimer"
          color="#007aff"
        />
      </view>
      <view v-if="timerEnabled" class="timer-settings">
        <view class="timer-options">
          <view 
            v-for="time in timerOptions" 
            :key="time"
            class="timer-option"
            :class="{ 'active': selectedTimer === time }"
            @click="setTimer(time)"
          >
            <text class="timer-text">{{ time }}分钟</text>
          </view>
        </view>
      </view>
    </view>

    <!-- 环境信息 -->
    <view class="control-section">
      <view class="section-header">
        <text class="section-title">环境信息</text>
      </view>
      <view class="environment-info">
        <view class="env-item">
          <text class="env-label">室内温度</text>
          <text class="env-value">{{ currentTemp }}°C</text>
        </view>
        <view class="env-item">
          <text class="env-label">湿度</text>
          <text class="env-value">{{ humidity }}%</text>
        </view>
        <view class="env-item">
          <text class="env-label">空气质量</text>
          <text class="env-value">{{ airQuality }}</text>
        </view>
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
      device: {
        id: 9,
        name: '空调',
        room: '卧室',
        isOn: true
      },
      targetTemp: 26,
      selectedMode: 'cool',
      fanSpeed: 1,
      swingEnabled: false,
      sleepMode: false,
      ecoMode: true,
      timerEnabled: false,
      selectedTimer: 30,
      currentTemp: 28,
      humidity: 65,
      airQuality: '良好',
      modes: [
        { id: 'cool', name: '制冷', icon: '❄️' },
        { id: 'heat', name: '制热', icon: '🔥' },
        { id: 'dry', name: '除湿', icon: '💧' },
        { id: 'fan', name: '送风', icon: '🌀' },
        { id: 'auto', name: '自动', icon: '🤖' }
      ],
      fanSpeeds: ['自动', '低速', '中速', '高速'],
      timerOptions: [30, 60, 90, 120, 180, 240]
    };
  },
  onLoad(options) {
    if (options.id) {
      this.deviceId = options.id;
      this.loadDeviceData();
    }
    
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
      console.log('加载空调数据:', this.deviceId);
    },
    
    // 获取状态文本
    getStatusText() {
      if (!this.device.isOn) return '已关闭';
      
      const modeText = this.modes.find(m => m.id === this.selectedMode)?.name || '制冷';
      return `${modeText}模式 · ${this.targetTemp}°C`;
    },
    
    // 获取风速文本
    getFanSpeedText() {
      return this.fanSpeeds[this.fanSpeed];
    },
    
    // 切换设备开关
    toggleDevice() {
      this.device.isOn = !this.device.isOn;
      
      uni.showToast({
        title: this.device.isOn ? '空调已开启' : '空调已关闭',
        icon: 'success'
      });
      
      this.updateDeviceStatus();
    },
    
    // 增加温度
    increaseTemp() {
      if (this.targetTemp < 30) {
        this.targetTemp++;
        this.updateDeviceSettings();
      }
    },
    
    // 降低温度
    decreaseTemp() {
      if (this.targetTemp > 16) {
        this.targetTemp--;
        this.updateDeviceSettings();
      }
    },
    
    // 选择模式
    selectMode(mode) {
      this.selectedMode = mode.id;
      
      // 根据模式调整默认温度
      switch(mode.id) {
        case 'cool':
          if (this.targetTemp > 26) this.targetTemp = 26;
          break;
        case 'heat':
          if (this.targetTemp < 20) this.targetTemp = 20;
          break;
      }
      
      this.updateDeviceSettings();
      
      uni.showToast({
        title: `已切换到${mode.name}模式`,
        icon: 'success'
      });
    },
    
    // 设置风速
    setFanSpeed(speed) {
      this.fanSpeed = speed;
      this.updateDeviceSettings();
    },
    
    // 切换摆风
    toggleSwing(e) {
      this.swingEnabled = e.detail.value;
      this.updateDeviceSettings();
    },
    
    // 切换睡眠模式
    toggleSleepMode(e) {
      this.sleepMode = e.detail.value;
      
      if (this.sleepMode) {
        // 睡眠模式下自动调整设置
        this.fanSpeed = 0; // 自动风速
        this.swingEnabled = false;
      }
      
      this.updateDeviceSettings();
    },
    
    // 切换节能模式
    toggleEcoMode(e) {
      this.ecoMode = e.detail.value;
      this.updateDeviceSettings();
    },
    
    // 切换定时器
    toggleTimer(e) {
      this.timerEnabled = e.detail.value;
      
      if (!this.timerEnabled) {
        this.selectedTimer = 30;
      }
      
      this.updateDeviceSettings();
    },
    
    // 设置定时器
    setTimer(minutes) {
      this.selectedTimer = minutes;
      this.updateDeviceSettings();
      
      uni.showToast({
        title: `定时${minutes}分钟后关机`,
        icon: 'success'
      });
    },
    
    // 更新设备状态
    async updateDeviceStatus() {
      try {
        console.log('更新空调状态:', this.device);
      } catch (error) {
        console.error('更新空调状态失败:', error);
      }
    },
    
    // 更新设备设置
    async updateDeviceSettings() {
      try {
        console.log('更新空调设置:', {
          targetTemp: this.targetTemp,
          selectedMode: this.selectedMode,
          fanSpeed: this.fanSpeed,
          swingEnabled: this.swingEnabled,
          sleepMode: this.sleepMode,
          ecoMode: this.ecoMode,
          timerEnabled: this.timerEnabled,
          selectedTimer: this.selectedTimer
        });
      } catch (error) {
        console.error('更新空调设置失败:', error);
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
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
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

.temp-control {
  background-color: #fff;
  border-radius: 12px;
  padding: 30px;
  margin-bottom: 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.dark-theme .temp-control {
  background-color: #1a1a1a;
}

.temp-display {
  text-align: center;
}

.temp-value {
  font-size: 48px;
  font-weight: bold;
  color: #007aff;
  display: block;
}

.temp-label {
  font-size: 14px;
  color: #999;
  margin-top: 5px;
}

.temp-buttons {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.temp-btn {
  width: 50px;
  height: 50px;
  background-color: #f8f9fa;
  border-radius: 25px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px solid #e5e5e5;
}

.dark-theme .temp-btn {
  background-color: #2d2d2d;
  border-color: #404040;
}

.btn-text {
  font-size: 24px;
  font-weight: bold;
  color: #333;
}

.dark-theme .btn-text {
  color: #fff;
}

.control-section {
  background-color: #fff;
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 15px;
}

.dark-theme .control-section {
  background-color: #1a1a1a;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
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

.section-value {
  font-size: 14px;
  color: #007aff;
}

.mode-selector {
  display: flex;
  gap: 10px;
}

.mode-item {
  flex: 1;
  background-color: #f8f9fa;
  border-radius: 8px;
  padding: 15px 10px;
  text-align: center;
  border: 2px solid transparent;
  transition: all 0.3s ease;
}

.dark-theme .mode-item {
  background-color: #2d2d2d;
}

.mode-item.active {
  border-color: #007aff;
  background-color: #e3f2fd;
}

.dark-theme .mode-item.active {
  background-color: #1a365d;
}

.mode-icon {
  font-size: 20px;
  display: block;
  margin-bottom: 5px;
}

.mode-name {
  font-size: 12px;
  color: #333;
}

.dark-theme .mode-name {
  color: #fff;
}

.fan-speed-control {
  display: flex;
  gap: 10px;
}

.speed-item {
  flex: 1;
  background-color: #f8f9fa;
  border-radius: 8px;
  padding: 12px;
  text-align: center;
  border: 2px solid transparent;
  transition: all 0.3s ease;
}

.dark-theme .speed-item {
  background-color: #2d2d2d;
}

.speed-item.active {
  border-color: #007aff;
  background-color: #e3f2fd;
}

.dark-theme .speed-item.active {
  background-color: #1a365d;
}

.speed-text {
  font-size: 14px;
  color: #333;
}

.dark-theme .speed-text {
  color: #fff;
}

.function-switches {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.switch-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.switch-label {
  font-size: 14px;
  color: #333;
}

.dark-theme .switch-label {
  color: #fff;
}

.timer-options {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 15px;
}

.timer-option {
  background-color: #f8f9fa;
  border-radius: 8px;
  padding: 10px 15px;
  border: 2px solid transparent;
  transition: all 0.3s ease;
}

.dark-theme .timer-option {
  background-color: #2d2d2d;
}

.timer-option.active {
  border-color: #007aff;
  background-color: #e3f2fd;
}

.dark-theme .timer-option.active {
  background-color: #1a365d;
}

.timer-text {
  font-size: 14px;
  color: #333;
}

.dark-theme .timer-text {
  color: #fff;
}

.environment-info {
  display: flex;
  justify-content: space-between;
}

.env-item {
  text-align: center;
  flex: 1;
}

.env-label {
  font-size: 12px;
  color: #999;
  display: block;
  margin-bottom: 5px;
}

.env-value {
  font-size: 16px;
  font-weight: bold;
  color: #333;
}

.dark-theme .env-value {
  color: #fff;
}
</style>