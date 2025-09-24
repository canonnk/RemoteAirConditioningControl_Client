<template>
  <view class="container" :class="{ 'dark-theme': isDarkMode }">
    <!-- 设备信息卡片 -->
    <view class="device-card">
      <view class="device-header">
        <view class="device-info">
          <text class="device-name">{{ device.name }}</text>
          <text class="device-room">{{ device.room }}</text>
        </view>
        <view class="refresh-btn" @click="refreshData">
          <text class="refresh-icon">🔄</text>
        </view>
      </view>
      
      <view class="device-status">
        <text class="status-text">实时环境监测</text>
        <text class="update-time">更新时间：{{ updateTime }}</text>
      </view>
    </view>

    <!-- 主要环境数据 -->
    <view class="main-data">
      <view class="data-item temperature">
        <text class="data-icon">🌡️</text>
        <text class="data-value">{{ temperature }}°C</text>
        <text class="data-label">温度</text>
        <text class="data-status" :class="getTemperatureStatus()">{{ getTemperatureText() }}</text>
      </view>
      
      <view class="data-item humidity">
        <text class="data-icon">💧</text>
        <text class="data-value">{{ humidity }}%</text>
        <text class="data-label">湿度</text>
        <text class="data-status" :class="getHumidityStatus()">{{ getHumidityText() }}</text>
      </view>
    </view>

    <!-- 空气质量 -->
    <view class="air-quality-card">
      <view class="section-header">
        <text class="section-title">空气质量</text>
        <text class="aqi-value" :class="getAQIStatus()">{{ aqi }}</text>
      </view>
      
      <view class="aqi-info">
        <text class="aqi-level" :class="getAQIStatus()">{{ getAQILevel() }}</text>
        <text class="aqi-desc">{{ getAQIDescription() }}</text>
      </view>
      
      <view class="pollutants">
        <view class="pollutant-item">
          <text class="pollutant-name">PM2.5</text>
          <text class="pollutant-value">{{ pm25 }} μg/m³</text>
        </view>
        <view class="pollutant-item">
          <text class="pollutant-name">PM10</text>
          <text class="pollutant-value">{{ pm10 }} μg/m³</text>
        </view>
        <view class="pollutant-item">
          <text class="pollutant-name">甲醛</text>
          <text class="pollutant-value">{{ formaldehyde }} mg/m³</text>
        </view>
        <view class="pollutant-item">
          <text class="pollutant-name">TVOC</text>
          <text class="pollutant-value">{{ tvoc }} mg/m³</text>
        </view>
      </view>
    </view>

    <!-- 其他环境数据 -->
    <view class="other-data">
      <view class="data-row">
        <view class="mini-data-item">
          <text class="mini-icon">🔊</text>
          <text class="mini-value">{{ noise }} dB</text>
          <text class="mini-label">噪音</text>
        </view>
        <view class="mini-data-item">
          <text class="mini-icon">💨</text>
          <text class="mini-value">{{ co2 }} ppm</text>
          <text class="mini-label">CO₂</text>
        </view>
      </view>
      
      <view class="data-row">
        <view class="mini-data-item">
          <text class="mini-icon">☀️</text>
          <text class="mini-value">{{ light }} lux</text>
          <text class="mini-label">光照</text>
        </view>
        <view class="mini-data-item">
          <text class="mini-icon">🌪️</text>
          <text class="mini-value">{{ pressure }} hPa</text>
          <text class="mini-label">气压</text>
        </view>
      </view>
    </view>

    <!-- 历史数据图表 -->
    <view class="chart-section">
      <view class="section-header">
        <text class="section-title">24小时趋势</text>
        <view class="chart-tabs">
          <text 
            v-for="tab in chartTabs" 
            :key="tab.id"
            class="chart-tab"
            :class="{ 'active': selectedChart === tab.id }"
            @click="switchChart(tab.id)"
          >
            {{ tab.name }}
          </text>
        </view>
      </view>
      
      <view class="chart-placeholder">
        <text class="chart-text">{{ getChartTitle() }}趋势图</text>
        <text class="chart-desc">显示过去24小时的数据变化</text>
      </view>
    </view>

    <!-- 建议和提醒 -->
    <view class="suggestions">
      <view class="section-header">
        <text class="section-title">环境建议</text>
      </view>
      
      <view class="suggestion-list">
        <view 
          v-for="suggestion in suggestions" 
          :key="suggestion.id"
          class="suggestion-item"
          :class="suggestion.type"
        >
          <text class="suggestion-icon">{{ suggestion.icon }}</text>
          <text class="suggestion-text">{{ suggestion.text }}</text>
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
        id: 1,
        name: '环境监测',
        room: '客厅'
      },
      temperature: 24.5,
      humidity: 58,
      aqi: 45,
      pm25: 12,
      pm10: 18,
      formaldehyde: 0.03,
      tvoc: 0.15,
      noise: 35,
      co2: 420,
      light: 280,
      pressure: 1013,
      updateTime: '',
      selectedChart: 'temperature',
      chartTabs: [
        { id: 'temperature', name: '温度' },
        { id: 'humidity', name: '湿度' },
        { id: 'aqi', name: 'AQI' }
      ],
      suggestions: []
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
    
    // 初始化数据
    this.updateTime = this.getCurrentTime();
    this.generateSuggestions();
  },
  onShow() {
    // 每次页面显示时，都从全局状态同步并应用主题
    const currentTheme = theme.getCurrentTheme();
    this.isDarkMode = currentTheme === theme.THEMES.DARK;
    theme.setNavigationBarStyle(currentTheme);
    theme.setTabBarStyle(currentTheme);
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
      console.log('加载环境监测数据:', this.deviceId);
    },
    
    // 获取当前时间
    getCurrentTime() {
      const now = new Date();
      return `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    },
    
    // 刷新数据
    refreshData() {
      uni.showLoading({
        title: '刷新中...'
      });
      
      // 模拟数据更新
      setTimeout(() => {
        this.temperature = (Math.random() * 10 + 20).toFixed(1);
        this.humidity = Math.floor(Math.random() * 40 + 40);
        this.aqi = Math.floor(Math.random() * 100 + 20);
        this.updateTime = this.getCurrentTime();
        this.generateSuggestions();
        
        uni.hideLoading();
        uni.showToast({
          title: '数据已更新',
          icon: 'success'
        });
      }, 1500);
    },
    
    // 获取温度状态
    getTemperatureStatus() {
      if (this.temperature < 18) return 'cold';
      if (this.temperature > 26) return 'hot';
      return 'normal';
    },
    
    // 获取温度文本
    getTemperatureText() {
      if (this.temperature < 18) return '偏冷';
      if (this.temperature > 26) return '偏热';
      return '舒适';
    },
    
    // 获取湿度状态
    getHumidityStatus() {
      if (this.humidity < 40) return 'dry';
      if (this.humidity > 70) return 'wet';
      return 'normal';
    },
    
    // 获取湿度文本
    getHumidityText() {
      if (this.humidity < 40) return '偏干';
      if (this.humidity > 70) return '偏湿';
      return '适宜';
    },
    
    // 获取AQI状态
    getAQIStatus() {
      if (this.aqi <= 50) return 'excellent';
      if (this.aqi <= 100) return 'good';
      if (this.aqi <= 150) return 'moderate';
      if (this.aqi <= 200) return 'poor';
      return 'very-poor';
    },
    
    // 获取AQI等级
    getAQILevel() {
      if (this.aqi <= 50) return '优';
      if (this.aqi <= 100) return '良';
      if (this.aqi <= 150) return '轻度污染';
      if (this.aqi <= 200) return '中度污染';
      return '重度污染';
    },
    
    // 获取AQI描述
    getAQIDescription() {
      if (this.aqi <= 50) return '空气质量令人满意，基本无空气污染';
      if (this.aqi <= 100) return '空气质量可接受，但某些污染物可能对极少数异常敏感人群健康有较弱影响';
      if (this.aqi <= 150) return '易感人群症状有轻度加剧，健康人群出现刺激症状';
      if (this.aqi <= 200) return '进一步加剧易感人群症状，可能对健康人群心脏、呼吸系统有影响';
      return '健康人群运动耐受力降低，有明显强烈症状，提前出现某些疾病';
    },
    
    // 切换图表
    switchChart(chartId) {
      this.selectedChart = chartId;
    },
    
    // 获取图表标题
    getChartTitle() {
      const tab = this.chartTabs.find(t => t.id === this.selectedChart);
      return tab ? tab.name : '温度';
    },
    
    // 生成建议
    generateSuggestions() {
      this.suggestions = [];
      
      // 温度建议
      if (this.temperature < 18) {
        this.suggestions.push({
          id: 'temp_low',
          type: 'warning',
          icon: '🔥',
          text: '室内温度偏低，建议开启暖气或空调制热'
        });
      } else if (this.temperature > 26) {
        this.suggestions.push({
          id: 'temp_high',
          type: 'warning',
          icon: '❄️',
          text: '室内温度偏高，建议开启空调制冷或通风'
        });
      }
      
      // 湿度建议
      if (this.humidity < 40) {
        this.suggestions.push({
          id: 'humidity_low',
          type: 'info',
          icon: '💧',
          text: '空气湿度偏低，建议使用加湿器'
        });
      } else if (this.humidity > 70) {
        this.suggestions.push({
          id: 'humidity_high',
          type: 'info',
          icon: '🌀',
          text: '空气湿度偏高，建议开启除湿功能'
        });
      }
      
      // 空气质量建议
      if (this.aqi > 100) {
        this.suggestions.push({
          id: 'aqi_poor',
          type: 'danger',
          icon: '😷',
          text: '空气质量较差，建议关闭门窗，开启空气净化器'
        });
      } else if (this.aqi <= 50) {
        this.suggestions.push({
          id: 'aqi_good',
          type: 'success',
          icon: '🌿',
          text: '空气质量优良，适合开窗通风'
        });
      }
      
      // CO2建议
      if (this.co2 > 1000) {
        this.suggestions.push({
          id: 'co2_high',
          type: 'warning',
          icon: '🪟',
          text: 'CO₂浓度偏高，建议开窗通风'
        });
      }
      
      // 如果没有建议，添加默认建议
      if (this.suggestions.length === 0) {
        this.suggestions.push({
          id: 'all_good',
          type: 'success',
          icon: '✅',
          text: '当前环境状况良好，请保持'
        });
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

.refresh-btn {
  width: 40px;
  height: 40px;
  background-color: #f8f9fa;
  border-radius: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid #e5e5e5;
}

.dark-theme .refresh-btn {
  background-color: #2d2d2d;
  border-color: #404040;
}

.refresh-icon {
  font-size: 16px;
}

.status-text {
  font-size: 16px;
  color: #666;
  display: block;
  margin-bottom: 5px;
}

.dark-theme .status-text {
  color: #ccc;
}

.update-time {
  font-size: 12px;
  color: #999;
}

.main-data {
  display: flex;
  gap: 15px;
  margin-bottom: 20px;
}

.data-item {
  flex: 1;
  background-color: #fff;
  border-radius: 12px;
  padding: 25px 20px;
  text-align: center;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.dark-theme .data-item {
  background-color: #1a1a1a;
}

.data-icon {
  font-size: 24px;
  display: block;
  margin-bottom: 10px;
}

.data-value {
  font-size: 28px;
  font-weight: bold;
  color: #333;
  display: block;
  margin-bottom: 5px;
}

.dark-theme .data-value {
  color: #fff;
}

.data-label {
  font-size: 14px;
  color: #999;
  display: block;
  margin-bottom: 8px;
}

.data-status {
  font-size: 12px;
  padding: 4px 8px;
  border-radius: 4px;
  display: inline-block;
}

.data-status.normal {
  background-color: #e8f5e8;
  color: #2e7d32;
}

.data-status.cold, .data-status.dry {
  background-color: #e3f2fd;
  color: #1976d2;
}

.data-status.hot, .data-status.wet {
  background-color: #fff3e0;
  color: #f57c00;
}

.air-quality-card {
  background-color: #fff;
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 20px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.dark-theme .air-quality-card {
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

.aqi-value {
  font-size: 24px;
  font-weight: bold;
}

.aqi-value.excellent {
  color: #4caf50;
}

.aqi-value.good {
  color: #8bc34a;
}

.aqi-value.moderate {
  color: #ff9800;
}

.aqi-value.poor {
  color: #f44336;
}

.aqi-value.very-poor {
  color: #9c27b0;
}

.aqi-info {
  margin-bottom: 20px;
}

.aqi-level {
  font-size: 18px;
  font-weight: bold;
  display: block;
  margin-bottom: 5px;
}

.aqi-level.excellent {
  color: #4caf50;
}

.aqi-level.good {
  color: #8bc34a;
}

.aqi-level.moderate {
  color: #ff9800;
}

.aqi-level.poor {
  color: #f44336;
}

.aqi-level.very-poor {
  color: #9c27b0;
}

.aqi-desc {
  font-size: 12px;
  color: #999;
  line-height: 1.4;
}

.pollutants {
  display: flex;
  flex-wrap: wrap;
  gap: 15px;
}

.pollutant-item {
  flex: 1;
  min-width: 80px;
  text-align: center;
  background-color: #f8f9fa;
  border-radius: 8px;
  padding: 12px 8px;
}

.dark-theme .pollutant-item {
  background-color: #2d2d2d;
}

.pollutant-name {
  font-size: 12px;
  color: #999;
  display: block;
  margin-bottom: 5px;
}

.pollutant-value {
  font-size: 14px;
  font-weight: bold;
  color: #333;
}

.dark-theme .pollutant-value {
  color: #fff;
}

.other-data {
  background-color: #fff;
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 20px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.dark-theme .other-data {
  background-color: #1a1a1a;
}

.data-row {
  display: flex;
  gap: 15px;
  margin-bottom: 15px;
}

.data-row:last-child {
  margin-bottom: 0;
}

.mini-data-item {
  flex: 1;
  background-color: #f8f9fa;
  border-radius: 8px;
  padding: 15px;
  text-align: center;
}

.dark-theme .mini-data-item {
  background-color: #2d2d2d;
}

.mini-icon {
  font-size: 16px;
  display: block;
  margin-bottom: 8px;
}

.mini-value {
  font-size: 16px;
  font-weight: bold;
  color: #333;
  display: block;
  margin-bottom: 5px;
}

.dark-theme .mini-value {
  color: #fff;
}

.mini-label {
  font-size: 12px;
  color: #999;
}

.chart-section {
  background-color: #fff;
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 20px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.dark-theme .chart-section {
  background-color: #1a1a1a;
}

.chart-tabs {
  display: flex;
  gap: 15px;
}

.chart-tab {
  font-size: 14px;
  color: #999;
  padding: 5px 0;
  border-bottom: 2px solid transparent;
  transition: all 0.3s ease;
}

.chart-tab.active {
  color: #007aff;
  border-bottom-color: #007aff;
}

.chart-placeholder {
  height: 200px;
  background-color: #f8f9fa;
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  margin-top: 15px;
}

.dark-theme .chart-placeholder {
  background-color: #2d2d2d;
}

.chart-text {
  font-size: 16px;
  color: #333;
  margin-bottom: 5px;
}

.dark-theme .chart-text {
  color: #fff;
}

.chart-desc {
  font-size: 12px;
  color: #999;
}

.suggestions {
  background-color: #fff;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.dark-theme .suggestions {
  background-color: #1a1a1a;
}

.suggestion-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.suggestion-item {
  display: flex;
  align-items: center;
  padding: 12px;
  border-radius: 8px;
  border-left: 4px solid;
}

.suggestion-item.success {
  background-color: #e8f5e8;
  border-left-color: #4caf50;
}

.suggestion-item.info {
  background-color: #e3f2fd;
  border-left-color: #2196f3;
}

.suggestion-item.warning {
  background-color: #fff3e0;
  border-left-color: #ff9800;
}

.suggestion-item.danger {
  background-color: #ffebee;
  border-left-color: #f44336;
}

.dark-theme .suggestion-item.success {
  background-color: #1b5e20;
}

.dark-theme .suggestion-item.info {
  background-color: #0d47a1;
}

.dark-theme .suggestion-item.warning {
  background-color: #e65100;
}

.dark-theme .suggestion-item.danger {
  background-color: #b71c1c;
}

.suggestion-icon {
  font-size: 16px;
  margin-right: 10px;
}

.suggestion-text {
  font-size: 14px;
  color: #333;
  flex: 1;
  line-height: 1.4;
}

.dark-theme .suggestion-text {
  color: #fff;
}
</style>