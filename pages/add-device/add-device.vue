<template>
  <view class="container" :class="{ 'dark-theme': isDarkMode }">
    <!-- 网络检测阶段 -->
    <view v-if="currentStep === 'network'" class="step-container">
      <view class="step-header">
        <text class="step-title">网络检测</text>
        <text class="step-desc">正在检测网络连接状态...</text>
      </view>
      
      <view class="network-status">
        <view class="status-icon" :class="{ 'checking': isChecking }">
          <text class="icon">📡</text>
        </view>
        <text class="status-text">{{ networkStatus }}</text>
        
        <view v-if="!isDeviceNetwork" class="wifi-guide">
          <text class="guide-title">请连接设备WiFi热点</text>
          <text class="guide-desc">1. 打开手机WiFi设置</text>
          <text class="guide-desc">2. 连接以设备型号命名的WiFi</text>
          <text class="guide-desc">3. 返回APP继续操作</text>
          <button class="retry-btn" @click="checkNetwork">重新检测</button>
        </view>
      </view>
    </view>

    <!-- 设备搜索阶段 -->
    <view v-if="currentStep === 'search'" class="step-container">
      <view class="step-header">
        <text class="step-title">搜索设备</text>
        <text class="step-desc">正在搜索附近的智能设备...</text>
      </view>
      
      <!-- 雷达搜索动画 -->
      <view class="radar-container">
        <view class="radar-bg">
          <view class="radar-circle circle-1" :class="{ 'scanning': isScanning }"></view>
          <view class="radar-circle circle-2" :class="{ 'scanning': isScanning }"></view>
          <view class="radar-circle circle-3" :class="{ 'scanning': isScanning }"></view>
          <view class="radar-center">
            <text class="radar-icon">📡</text>
          </view>
        </view>
        
        <view class="search-progress">
          <text class="progress-text">{{ searchStatus }}</text>
          <view class="progress-bar">
            <view class="progress-fill" :style="{ width: searchProgress + '%' }"></view>
          </view>
        </view>
      </view>
      
      <button v-if="!isScanning" class="search-btn" @click="startSearch">开始搜索设备</button>
    </view>

    <!-- 设备信息显示 -->
    <view v-if="currentStep === 'found'" class="step-container">
      <view class="step-header">
        <text class="step-title">发现设备</text>
        <text class="step-desc">找到以下设备，请确认信息</text>
      </view>
      
      <view class="device-info-card">
        <view class="device-icon-wrapper">
          <text class="device-icon">{{ getDeviceIcon(deviceInfo.deviceType) }}</text>
        </view>
        <view class="device-details">
          <text class="device-name">{{ deviceInfo.deviceName }}</text>
          <text class="device-type">{{ deviceInfo.deviceType }}</text>
          <text class="device-code">设备码: {{ deviceInfo.deviceCode }}</text>
          <view class="wifi-status">
            <text class="wifi-label">WiFi状态:</text>
            <text class="wifi-value" :class="{ 'connected': deviceInfo.isWifiConnected }">
              {{ deviceInfo.isWifiConnected ? '已连接' : '未连接' }}
            </text>
          </view>
          <text v-if="deviceInfo.wifiName" class="current-wifi">
            当前WiFi: {{ deviceInfo.wifiName }}
          </text>
        </view>
      </view>
      
      <button class="next-btn" @click="goToConfig">下一步</button>
    </view>

    <!-- WiFi配置阶段 -->
    <view v-if="currentStep === 'config'" class="step-container">
      <view class="step-header">
        <text class="step-title">配置设备</text>
        <text class="step-desc">请设置设备的WiFi和名称</text>
      </view>
      
      <view class="config-form">
        <view class="form-item">
          <text class="form-label">设备名称</text>
          <input 
            class="form-input" 
            v-model="configData.deviceName"
            placeholder="请输入设备名称"
            maxlength="20"
          />
        </view>
        
        <view class="form-item">
          <text class="form-label">WiFi名称</text>
          <input 
            class="form-input" 
            v-model="configData.wifiName"
            placeholder="请输入WiFi名称"
          />
        </view>
        
        <view class="form-item">
          <text class="form-label">WiFi密码</text>
          <view class="password-input-wrapper">
            <input 
              class="form-input password-input" 
              v-model="configData.wifiPassword"
              :password="!showPassword"
              placeholder="请输入WiFi密码"
            />
            <text class="password-toggle" @click="togglePassword">
              {{ showPassword ? '👁️' : '🙈' }}
            </text>
          </view>
        </view>
        
        <button class="config-btn" @click="configDevice" :disabled="!isConfigValid">
          配置设备
        </button>
      </view>
    </view>

    <!-- 连接中阶段 -->
    <view v-if="currentStep === 'connecting'" class="step-container">
      <view class="step-header">
        <text class="step-title">连接中</text>
        <text class="step-desc">设备正在连接WiFi，请稍候...</text>
      </view>
      
      <view class="connecting-animation">
        <view class="connecting-icon">
          <text class="icon rotating">⚙️</text>
        </view>
        <text class="connecting-status">{{ connectingStatus }}</text>
        
        <view class="connecting-progress">
          <view class="progress-dots">
            <view class="dot" :class="{ 'active': connectingStep >= 1 }"></view>
            <view class="dot" :class="{ 'active': connectingStep >= 2 }"></view>
            <view class="dot" :class="{ 'active': connectingStep >= 3 }"></view>
          </view>
          <text class="progress-text">{{ getConnectingText() }}</text>
        </view>
      </view>
    </view>

    <!-- 完成阶段 -->
    <view v-if="currentStep === 'success'" class="step-container">
      <view class="step-header">
        <text class="step-title">添加成功</text>
        <text class="step-desc">设备已成功添加到您的设备列表</text>
      </view>
      
      <view class="success-animation">
        <view class="success-icon">
          <text class="icon">✅</text>
        </view>
        <text class="success-text">{{ deviceInfo.deviceName }} 添加成功！</text>
        
        <view class="success-actions">
          <button class="action-btn primary" @click="goToDevices">查看设备</button>
          <button class="action-btn secondary" @click="addAnother">再添加一个</button>
        </view>
      </view>
    </view>

    <!-- 错误提示 -->
    <view v-if="errorMessage" class="error-overlay" @click="clearError">
      <view class="error-modal">
        <text class="error-title">操作失败</text>
        <text class="error-text">{{ errorMessage }}</text>
        <button class="error-btn" @click="clearError">确定</button>
      </view>
    </view>
  </view>
</template>

<script>
import NetworkHelper from '@/utils/network-helper.js';
import DeviceAPIMock from '@/utils/device-api-mock.js';

export default {
  data() {
    return {
      isDarkMode: false,
      currentStep: 'network', // network, search, found, config, connecting, success
      
      // 网络检测
      isChecking: true,
      isDeviceNetwork: false,
      networkStatus: '正在检测网络连接...',
      
      // 设备搜索
      isScanning: false,
      searchStatus: '点击开始搜索设备',
      searchProgress: 0,
      
      // 设备信息
      deviceInfo: {
        deviceType: '',
        deviceCode: '',
        deviceName: '',
        isWifiConnected: false,
        wifiName: ''
      },
      
      // 配置数据
      configData: {
        deviceName: '',
        wifiName: '',
        wifiPassword: ''
      },
      showPassword: false,
      
      // 连接状态
      connectingStatus: '正在发送配置...',
      connectingStep: 1,
      connectingTimer: null,
      
      // 错误信息
      errorMessage: ''
    };
  },
  
  computed: {
    isConfigValid() {
      return this.configData.deviceName.trim() && 
             this.configData.wifiName.trim() && 
             this.configData.wifiPassword.trim();
    }
  },
  
  onLoad() {
    this.checkNetwork();
  },
  
  onUnload() {
    if (this.connectingTimer) {
      clearInterval(this.connectingTimer);
    }
  },
  
  methods: {
    // 检查网络连接
    async checkNetwork() {
      this.isChecking = true;
      this.networkStatus = '正在检测网络连接...';
      
      try {
        // 模拟网络检测
        await this.delay(2000);
        
        // 检查是否连接到设备WiFi (192.168.4.*)
        const isDeviceWifi = await this.checkDeviceWifi();
        
        if (isDeviceWifi) {
          this.isDeviceNetwork = true;
          this.networkStatus = '已连接到设备WiFi';
          await this.delay(1000);
          this.currentStep = 'search';
        } else {
          this.isDeviceNetwork = false;
          this.networkStatus = '请连接设备WiFi热点';
        }
      } catch (error) {
        this.networkStatus = '网络检测失败';
        this.showError('网络检测失败，请检查网络连接');
      } finally {
        this.isChecking = false;
      }
    },
    
    // 检查是否连接到设备WiFi
    async checkDeviceWifi() {
      try {
        return await NetworkHelper.checkDeviceWifi();
      } catch (error) {
        console.error('网络检测失败:', error);
        // 开发环境返回true便于测试
        return process.env.NODE_ENV === 'development';
      }
    },
    
    // 开始搜索设备
    async startSearch() {
      this.isScanning = true;
      this.searchProgress = 0;
      this.searchStatus = '正在搜索设备...';
      
      try {
        // 模拟搜索进度
        for (let i = 0; i <= 100; i += 10) {
          this.searchProgress = i;
          if (i < 50) {
            this.searchStatus = '正在扫描网络...';
          } else if (i < 80) {
            this.searchStatus = '正在获取设备信息...';
          } else {
            this.searchStatus = '正在验证设备...';
          }
          await this.delay(300);
        }
        
        // 获取设备信息
        const deviceInfo = await this.getDeviceMessage();
        this.deviceInfo = deviceInfo;
        this.configData.deviceName = deviceInfo.deviceName;
        
        this.searchStatus = '设备搜索完成';
        await this.delay(500);
        this.currentStep = 'found';
        
      } catch (error) {
        this.showError('设备搜索失败: ' + error.message);
      } finally {
        this.isScanning = false;
      }
    },
    
    // 获取设备信息
    async getDeviceMessage() {
      // 开发环境使用模拟API，生产环境使用真实API
      const isDevelopment = process.env.NODE_ENV === 'development';
      
      if (isDevelopment) {
        // 使用模拟API
        return await DeviceAPIMock.getDeviceMessage();
      } else {
        // 使用真实设备API
        return new Promise((resolve, reject) => {
          uni.request({
            url: 'http://192.168.4.1/getDeviceMessage',
            method: 'GET',
            timeout: 10000,
            success: (res) => {
              if (res.statusCode === 200) {
                resolve(res.data);
              } else {
                reject(new Error('设备响应异常'));
              }
            },
            fail: (error) => {
              reject(new Error('无法连接到设备'));
            }
          });
        });
      }
    },
    
    // 前往配置页面
    goToConfig() {
      this.currentStep = 'config';
    },
    
    // 配置设备
    async configDevice() {
      if (!this.isConfigValid) {
        this.showError('请填写完整的配置信息');
        return;
      }
      
      this.currentStep = 'connecting';
      this.connectingStep = 1;
      this.connectingStatus = '正在发送配置...';
      
      try {
        // 发送配置到设备
        await this.setDeviceConfig();
        
        this.connectingStep = 2;
        this.connectingStatus = '正在连接WiFi...';
        
        // 检查连接状态
        await this.checkConnectionStatus();
        
        this.connectingStep = 3;
        this.connectingStatus = '正在添加到云端...';
        
        // 添加设备到云端
        await this.addDeviceToCloud();
        
        this.currentStep = 'success';
        
      } catch (error) {
        this.showError('设备配置失败: ' + error.message);
        this.currentStep = 'config';
      }
    },
    
    // 设置设备配置
    async setDeviceConfig() {
      const configData = {
        wifiName: this.configData.wifiName,
        wifiPassword: this.configData.wifiPassword,
        deviceName: this.configData.deviceName
      };
      
      // 开发环境使用模拟API，生产环境使用真实API
      const isDevelopment = process.env.NODE_ENV === 'development';
      
      if (isDevelopment) {
        // 使用模拟API
        return await DeviceAPIMock.setConfig(configData);
      } else {
        // 使用真实设备API
        return new Promise((resolve, reject) => {
          uni.request({
            url: 'http://192.168.4.1/setConfig',
            method: 'POST',
            data: configData,
            timeout: 15000,
            success: (res) => {
              if (res.statusCode === 200) {
                resolve(res.data);
              } else {
                reject(new Error('设备配置失败'));
              }
            },
            fail: (error) => {
              reject(new Error('无法连接到设备'));
            }
          });
        });
      }
    },
    
    // 检查连接状态
    async checkConnectionStatus() {
      let retryCount = 0;
      const maxRetries = 12; // 最多重试12次，约1分钟
      const isDevelopment = process.env.NODE_ENV === 'development';
      
      return new Promise((resolve, reject) => {
        const checkStatus = async () => {
          try {
            retryCount++;
            let deviceInfo;
            
            if (isDevelopment) {
              // 开发环境：模拟连接过程
              deviceInfo = await DeviceAPIMock.checkWifiConnection();
              // 模拟设备信息更新
              deviceInfo.deviceType = this.deviceInfo.deviceType;
              deviceInfo.deviceCode = this.deviceInfo.deviceCode;
            } else {
              // 生产环境：获取真实设备状态
              deviceInfo = await this.getDeviceMessage();
            }
            
            if (deviceInfo.isWifiConnected) {
              // WiFi连接成功
              resolve();
            } else if (retryCount >= maxRetries) {
              reject(new Error('设备连接WiFi超时'));
            } else {
              // 继续检查
              setTimeout(checkStatus, 5000);
            }
            
          } catch (error) {
            if (retryCount >= maxRetries) {
              reject(error);
            } else {
              setTimeout(checkStatus, 5000);
            }
          }
        };
        
        // 等待3秒后开始检查
        setTimeout(checkStatus, 3000);
      });
    },
    
    // 添加设备到云端
    async addDeviceToCloud() {
      return new Promise((resolve, reject) => {
        // 调用云函数
        uniCloud.callFunction({
          name: 'add-device',
          data: {
            deviceCode: this.deviceInfo.deviceCode,
            deviceType: this.deviceInfo.deviceType,
            deviceName: this.configData.deviceName
          },
          success: (res) => {
            if (res.result.success) {
              resolve(res.result);
            } else {
              reject(new Error(res.result.message || '添加设备失败'));
            }
          },
          fail: (error) => {
            reject(new Error('云端服务异常'));
          }
        });
      });
    },
    
    // 切换密码显示
    togglePassword() {
      this.showPassword = !this.showPassword;
    },
    
    // 获取设备图标
    getDeviceIcon(deviceType) {
      const iconMap = {
        '智能灯': '💡',
        '智能插座': '🔌',
        '智能开关': '🎛️',
        '环境监测仪': '🌡️',
        '智能空调': '❄️',
        '智能音箱': '🔊'
      };
      return iconMap[deviceType] || '📱';
    },
    
    // 获取连接进度文本
    getConnectingText() {
      const texts = ['发送配置', '连接WiFi', '添加到云端'];
      return texts[this.connectingStep - 1] || '';
    },
    
    // 前往设备列表
    goToDevices() {
      uni.switchTab({
        url: '/pages/devices/devices'
      });
    },
    
    // 再添加一个设备
    addAnother() {
      // 重置状态
      this.currentStep = 'network';
      this.deviceInfo = {
        deviceType: '',
        deviceCode: '',
        deviceName: '',
        isWifiConnected: false,
        wifiName: ''
      };
      this.configData = {
        deviceName: '',
        wifiName: '',
        wifiPassword: ''
      };
      this.checkNetwork();
    },
    
    // 显示错误
    showError(message) {
      this.errorMessage = message;
    },
    
    // 清除错误
    clearError() {
      this.errorMessage = '';
    },
    
    // 延迟函数
    delay(ms) {
      return new Promise(resolve => setTimeout(resolve, ms));
    }
  }
};
</script>

<style scoped>
.container {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  min-height: 100vh;
  padding: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.container.dark-theme {
  background: linear-gradient(135deg, #2c3e50 0%, #34495e 100%);
}

.step-container {
  width: 100%;
  max-width: 400px;
  background-color: rgba(255, 255, 255, 0.95);
  border-radius: 20px;
  padding: 30px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
  backdrop-filter: blur(10px);
}

.dark-theme .step-container {
  background-color: rgba(26, 26, 26, 0.95);
}

.step-header {
  text-align: center;
  margin-bottom: 30px;
}

.step-title {
  font-size: 24px;
  font-weight: bold;
  color: #333;
  display: block;
  margin-bottom: 10px;
}

.dark-theme .step-title {
  color: #fff;
}

.step-desc {
  font-size: 14px;
  color: #666;
  line-height: 1.5;
}

.dark-theme .step-desc {
  color: #999;
}

/* 网络检测样式 */
.network-status {
  text-align: center;
}

.status-icon {
  margin-bottom: 20px;
}

.status-icon .icon {
  font-size: 48px;
  display: block;
}

.status-icon.checking .icon {
  animation: pulse 2s infinite;
}

.status-text {
  font-size: 16px;
  color: #333;
  display: block;
  margin-bottom: 20px;
}

.dark-theme .status-text {
  color: #fff;
}

.wifi-guide {
  background-color: #f8f9fa;
  border-radius: 12px;
  padding: 20px;
  margin-top: 20px;
}

.dark-theme .wifi-guide {
  background-color: #2a2a2a;
}

.guide-title {
  font-size: 16px;
  font-weight: bold;
  color: #333;
  display: block;
  margin-bottom: 15px;
}

.dark-theme .guide-title {
  color: #fff;
}

.guide-desc {
  font-size: 14px;
  color: #666;
  display: block;
  margin-bottom: 8px;
}

.dark-theme .guide-desc {
  color: #999;
}

.retry-btn {
  width: 100%;
  background-color: #007aff;
  color: white;
  border: none;
  border-radius: 12px;
  padding: 12px;
  font-size: 16px;
  margin-top: 15px;
}

/* 雷达搜索样式 */
.radar-container {
  text-align: center;
}

.radar-bg {
  position: relative;
  width: 200px;
  height: 200px;
  margin: 0 auto 30px;
}

.radar-circle {
  position: absolute;
  border: 2px solid rgba(0, 122, 255, 0.3);
  border-radius: 50%;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}

.circle-1 {
  width: 60px;
  height: 60px;
}

.circle-2 {
  width: 120px;
  height: 120px;
}

.circle-3 {
  width: 180px;
  height: 180px;
}

.radar-circle.scanning {
  animation: radar-pulse 2s infinite;
}

.radar-center {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 40px;
  height: 40px;
  background-color: #007aff;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.radar-icon {
  font-size: 20px;
  color: white;
}

.search-progress {
  margin-bottom: 20px;
}

.progress-text {
  font-size: 14px;
  color: #666;
  display: block;
  margin-bottom: 10px;
}

.dark-theme .progress-text {
  color: #999;
}

.progress-bar {
  width: 100%;
  height: 4px;
  background-color: #e5e5e5;
  border-radius: 2px;
  overflow: hidden;
}

.dark-theme .progress-bar {
  background-color: #404040;
}

.progress-fill {
  height: 100%;
  background-color: #007aff;
  transition: width 0.3s ease;
}

.search-btn {
  width: 100%;
  background-color: #007aff;
  color: white;
  border: none;
  border-radius: 12px;
  padding: 15px;
  font-size: 16px;
}

/* 设备信息样式 */
.device-info-card {
  background-color: #f8f9fa;
  border-radius: 16px;
  padding: 20px;
  margin-bottom: 20px;
  text-align: center;
}

.dark-theme .device-info-card {
  background-color: #2a2a2a;
}

.device-icon-wrapper {
  margin-bottom: 15px;
}

.device-icon {
  font-size: 48px;
  display: block;
}

.device-details {
  text-align: left;
}

.device-name {
  font-size: 20px;
  font-weight: bold;
  color: #333;
  display: block;
  margin-bottom: 8px;
}

.dark-theme .device-name {
  color: #fff;
}

.device-type {
  font-size: 16px;
  color: #007aff;
  display: block;
  margin-bottom: 8px;
}

.device-code {
  font-size: 14px;
  color: #666;
  display: block;
  margin-bottom: 10px;
}

.dark-theme .device-code {
  color: #999;
}

.wifi-status {
  display: flex;
  align-items: center;
  margin-bottom: 8px;
}

.wifi-label {
  font-size: 14px;
  color: #666;
  margin-right: 8px;
}

.dark-theme .wifi-label {
  color: #999;
}

.wifi-value {
  font-size: 14px;
  color: #ff4757;
}

.wifi-value.connected {
  color: #2ed573;
}

.current-wifi {
  font-size: 14px;
  color: #666;
  display: block;
}

.dark-theme .current-wifi {
  color: #999;
}

.next-btn {
  width: 100%;
  background-color: #007aff;
  color: white;
  border: none;
  border-radius: 12px;
  padding: 15px;
  font-size: 16px;
}

/* 配置表单样式 */
.config-form {
  margin-bottom: 20px;
}

.form-item {
  margin-bottom: 20px;
}

.form-label {
  font-size: 14px;
  color: #333;
  display: block;
  margin-bottom: 8px;
}

.dark-theme .form-label {
  color: #fff;
}

.form-input {
  width: 100%;
  background-color: #f8f9fa;
  border: 1px solid #e5e5e5;
  border-radius: 12px;
  padding: 12px 15px;
  font-size: 16px;
  color: #333;
  box-sizing: border-box;
}

.dark-theme .form-input {
  background-color: #2a2a2a;
  border-color: #404040;
  color: #fff;
}

.password-input-wrapper {
  position: relative;
}

.password-input {
  padding-right: 50px;
}

.password-toggle {
  position: absolute;
  right: 15px;
  top: 50%;
  transform: translateY(-50%);
  font-size: 16px;
  cursor: pointer;
}

.config-btn {
  width: 100%;
  background-color: #007aff;
  color: white;
  border: none;
  border-radius: 12px;
  padding: 15px;
  font-size: 16px;
}

.config-btn:disabled {
  background-color: #ccc;
  cursor: not-allowed;
}

/* 连接动画样式 */
.connecting-animation {
  text-align: center;
}

.connecting-icon {
  margin-bottom: 20px;
}

.connecting-icon .icon {
  font-size: 48px;
  display: block;
}

.rotating {
  animation: rotate 2s linear infinite;
}

.connecting-status {
  font-size: 16px;
  color: #333;
  display: block;
  margin-bottom: 30px;
}

.dark-theme .connecting-status {
  color: #fff;
}

.connecting-progress {
  margin-bottom: 20px;
}

.progress-dots {
  display: flex;
  justify-content: center;
  gap: 15px;
  margin-bottom: 15px;
}

.dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background-color: #e5e5e5;
  transition: background-color 0.3s ease;
}

.dark-theme .dot {
  background-color: #404040;
}

.dot.active {
  background-color: #007aff;
}

.progress-text {
  font-size: 14px;
  color: #666;
}

.dark-theme .progress-text {
  color: #999;
}

/* 成功页面样式 */
.success-animation {
  text-align: center;
}

.success-icon {
  margin-bottom: 20px;
}

.success-icon .icon {
  font-size: 64px;
  display: block;
  animation: bounce 1s ease-in-out;
}

.success-text {
  font-size: 18px;
  color: #333;
  display: block;
  margin-bottom: 30px;
}

.dark-theme .success-text {
  color: #fff;
}

.success-actions {
  display: flex;
  gap: 15px;
}

.action-btn {
  flex: 1;
  border: none;
  border-radius: 12px;
  padding: 15px;
  font-size: 16px;
}

.action-btn.primary {
  background-color: #007aff;
  color: white;
}

.action-btn.secondary {
  background-color: #f8f9fa;
  color: #333;
  border: 1px solid #e5e5e5;
}

.dark-theme .action-btn.secondary {
  background-color: #2a2a2a;
  color: #fff;
  border-color: #404040;
}

/* 错误提示样式 */
.error-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.error-modal {
  background-color: white;
  border-radius: 16px;
  padding: 30px;
  margin: 20px;
  max-width: 300px;
  text-align: center;
}

.dark-theme .error-modal {
  background-color: #1a1a1a;
}

.error-title {
  font-size: 18px;
  font-weight: bold;
  color: #ff4757;
  display: block;
  margin-bottom: 15px;
}

.error-text {
  font-size: 14px;
  color: #666;
  display: block;
  margin-bottom: 20px;
  line-height: 1.5;
}

.dark-theme .error-text {
  color: #999;
}

.error-btn {
  background-color: #ff4757;
  color: white;
  border: none;
  border-radius: 12px;
  padding: 12px 30px;
  font-size: 16px;
}

/* 动画效果 */
@keyframes pulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.1); }
}

@keyframes radar-pulse {
  0% { transform: translate(-50%, -50%) scale(0.8); opacity: 1; }
  100% { transform: translate(-50%, -50%) scale(1.2); opacity: 0; }
}

@keyframes rotate {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

@keyframes bounce {
  0%, 20%, 50%, 80%, 100% { transform: translateY(0); }
  40% { transform: translateY(-10px); }
  60% { transform: translateY(-5px); }
}
</style>