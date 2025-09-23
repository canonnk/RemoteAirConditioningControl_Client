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
        <text class="status-text">{{ device.isOn ? '已开启' : '已关闭' }}</text>
      </view>
    </view>

    <!-- 亮度控制 -->
    <view class="control-section" v-if="device.isOn">
      <view class="section-header">
        <text class="section-title">亮度</text>
        <text class="section-value">{{ brightness }}%</text>
      </view>
      <view class="brightness-control">
        <slider 
          :value="brightness" 
          @change="onBrightnessChange"
          min="1"
          max="100"
          activeColor="#007aff"
          backgroundColor="#e5e5e5"
          block-size="20"
        />
      </view>
    </view>

    <!-- 色温控制 -->
    <view class="control-section" v-if="device.isOn">
      <view class="section-header">
        <text class="section-title">色温</text>
        <text class="section-value">{{ colorTemp }}K</text>
      </view>
      <view class="color-temp-control">
        <slider 
          :value="colorTempPercent" 
          @change="onColorTempChange"
          min="0"
          max="100"
          activeColor="#ffa500"
          backgroundColor="#e5e5e5"
          block-size="20"
        />
        <view class="temp-labels">
          <text class="temp-label">暖光</text>
          <text class="temp-label">冷光</text>
        </view>
      </view>
    </view>

    <!-- 颜色控制 -->
    <view class="control-section" v-if="device.isOn && device.supportColor">
      <view class="section-header">
        <text class="section-title">颜色</text>
      </view>
      <view class="color-picker">
        <view 
          v-for="color in colors" 
          :key="color.name"
          class="color-item"
          :class="{ 'active': selectedColor === color.name }"
          :style="{ backgroundColor: color.value }"
          @click="selectColor(color)"
        >
        </view>
      </view>
    </view>

    <!-- 场景模式 -->
    <view class="control-section">
      <view class="section-header">
        <text class="section-title">场景模式</text>
      </view>
      <view class="scene-modes">
        <view 
          v-for="scene in scenes" 
          :key="scene.id"
          class="scene-item"
          :class="{ 'active': selectedScene === scene.id }"
          @click="selectScene(scene)"
        >
          <text class="scene-icon">{{ scene.icon }}</text>
          <text class="scene-name">{{ scene.name }}</text>
        </view>
      </view>
    </view>

    <!-- 定时设置 -->
    <view class="control-section">
      <view class="section-header">
        <text class="section-title">定时开关</text>
        <switch 
          :checked="timerEnabled" 
          @change="toggleTimer"
          color="#007aff"
        />
      </view>
      <view v-if="timerEnabled" class="timer-settings">
        <view class="timer-item" @click="setOnTime">
          <text class="timer-label">开启时间</text>
          <text class="timer-value">{{ onTime || '未设置' }}</text>
        </view>
        <view class="timer-item" @click="setOffTime">
          <text class="timer-label">关闭时间</text>
          <text class="timer-value">{{ offTime || '未设置' }}</text>
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
        id: 2,
        name: '床头灯',
        room: '卧室',
        isOn: false,
        supportColor: true
      },
      brightness: 80,
      colorTemp: 4000,
      selectedColor: 'white',
      selectedScene: 'normal',
      timerEnabled: false,
      onTime: '',
      offTime: '',
      colors: [
        { name: 'white', value: '#ffffff' },
        { name: 'red', value: '#ff4757' },
        { name: 'orange', value: '#ffa502' },
        { name: 'yellow', value: '#fffa65' },
        { name: 'green', value: '#7bed9f' },
        { name: 'blue', value: '#70a1ff' },
        { name: 'purple', value: '#a4b0be' },
        { name: 'pink', value: '#ff6b9d' }
      ],
      scenes: [
        { id: 'normal', name: '普通', icon: '💡' },
        { id: 'reading', name: '阅读', icon: '📖' },
        { id: 'sleep', name: '睡眠', icon: '🌙' },
        { id: 'party', name: '派对', icon: '🎉' },
        { id: 'romantic', name: '浪漫', icon: '💕' },
        { id: 'focus', name: '专注', icon: '🎯' }
      ]
    };
  },
  computed: {
    colorTempPercent() {
      // 将色温值转换为百分比 (2700K-6500K)
      return ((this.colorTemp - 2700) / (6500 - 2700)) * 100;
    }
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
      // 这里可以调用云函数获取设备详细信息
      console.log('加载设备数据:', this.deviceId);
    },
    
    // 切换设备开关
    toggleDevice() {
      this.device.isOn = !this.device.isOn;
      
      uni.showToast({
        title: this.device.isOn ? '已开启' : '已关闭',
        icon: 'success'
      });
      
      // 调用云函数更新设备状态
      this.updateDeviceStatus();
    },
    
    // 亮度变化
    onBrightnessChange(e) {
      this.brightness = e.detail.value;
      this.updateDeviceSettings();
    },
    
    // 色温变化
    onColorTempChange(e) {
      const percent = e.detail.value;
      this.colorTemp = Math.round(2700 + (6500 - 2700) * (percent / 100));
      this.updateDeviceSettings();
    },
    
    // 选择颜色
    selectColor(color) {
      this.selectedColor = color.name;
      this.updateDeviceSettings();
    },
    
    // 选择场景
    selectScene(scene) {
      this.selectedScene = scene.id;
      
      // 根据场景设置相应的亮度和色温
      switch(scene.id) {
        case 'reading':
          this.brightness = 90;
          this.colorTemp = 4000;
          break;
        case 'sleep':
          this.brightness = 20;
          this.colorTemp = 2700;
          break;
        case 'party':
          this.brightness = 100;
          this.selectedColor = 'red';
          break;
        case 'romantic':
          this.brightness = 50;
          this.colorTemp = 2700;
          this.selectedColor = 'pink';
          break;
        case 'focus':
          this.brightness = 85;
          this.colorTemp = 5000;
          break;
        default:
          this.brightness = 80;
          this.colorTemp = 4000;
          this.selectedColor = 'white';
      }
      
      this.updateDeviceSettings();
      
      uni.showToast({
        title: `已切换到${scene.name}模式`,
        icon: 'success'
      });
    },
    
    // 切换定时器
    toggleTimer(e) {
      this.timerEnabled = e.detail.value;
    },
    
    // 设置开启时间
    setOnTime() {
      uni.showModal({
        title: '设置开启时间',
        editable: true,
        placeholderText: '请输入时间，如：08:00',
        success: (res) => {
          if (res.confirm && res.content) {
            this.onTime = res.content;
            this.updateTimerSettings();
          }
        }
      });
    },
    
    // 设置关闭时间
    setOffTime() {
      uni.showModal({
        title: '设置关闭时间',
        editable: true,
        placeholderText: '请输入时间，如：22:00',
        success: (res) => {
          if (res.confirm && res.content) {
            this.offTime = res.content;
            this.updateTimerSettings();
          }
        }
      });
    },
    
    // 更新设备状态
    async updateDeviceStatus() {
      try {
        // 调用云函数更新设备状态
        console.log('更新设备状态:', this.device);
      } catch (error) {
        console.error('更新设备状态失败:', error);
      }
    },
    
    // 更新设备设置
    async updateDeviceSettings() {
      try {
        // 调用云函数更新设备设置
        console.log('更新设备设置:', {
          brightness: this.brightness,
          colorTemp: this.colorTemp,
          selectedColor: this.selectedColor,
          selectedScene: this.selectedScene
        });
      } catch (error) {
        console.error('更新设备设置失败:', error);
      }
    },
    
    // 更新定时设置
    async updateTimerSettings() {
      try {
        // 调用云函数更新定时设置
        console.log('更新定时设置:', {
          timerEnabled: this.timerEnabled,
          onTime: this.onTime,
          offTime: this.offTime
        });
      } catch (error) {
        console.error('更新定时设置失败:', error);
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

.brightness-control, .color-temp-control {
  margin-top: 10px;
}

.temp-labels {
  display: flex;
  justify-content: space-between;
  margin-top: 10px;
}

.temp-label {
  font-size: 12px;
  color: #999;
}

.color-picker {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.color-item {
  width: 40px;
  height: 40px;
  border-radius: 20px;
  border: 3px solid transparent;
  transition: all 0.3s ease;
}

.color-item.active {
  border-color: #007aff;
  transform: scale(1.1);
}

.scene-modes {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.scene-item {
  flex: 1;
  min-width: 80px;
  background-color: #f8f9fa;
  border-radius: 8px;
  padding: 15px 10px;
  text-align: center;
  border: 2px solid transparent;
  transition: all 0.3s ease;
}

.dark-theme .scene-item {
  background-color: #2d2d2d;
}

.scene-item.active {
  border-color: #007aff;
  background-color: #e3f2fd;
}

.dark-theme .scene-item.active {
  background-color: #1a365d;
}

.scene-icon {
  font-size: 20px;
  display: block;
  margin-bottom: 5px;
}

.scene-name {
  font-size: 12px;
  color: #333;
}

.dark-theme .scene-name {
  color: #fff;
}

.timer-settings {
  margin-top: 15px;
}

.timer-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 0;
  border-bottom: 1px solid #f0f0f0;
}

.dark-theme .timer-item {
  border-bottom-color: #333;
}

.timer-item:last-child {
  border-bottom: none;
}

.timer-label {
  font-size: 14px;
  color: #333;
}

.dark-theme .timer-label {
  color: #fff;
}

.timer-value {
  font-size: 14px;
  color: #007aff;
}
</style>