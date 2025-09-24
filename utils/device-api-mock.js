/**
 * 设备API模拟工具
 * 用于开发环境模拟设备API响应
 */
class DeviceAPIMock {
  
  /**
   * 模拟获取设备信息
   * @returns {Promise<Object>} 设备信息
   */
  static async getDeviceMessage() {
    return new Promise((resolve, reject) => {
      // 模拟网络延迟
      setTimeout(() => {
        // 模拟90%成功率
        if (Math.random() > 0.1) {
          const deviceTypes = [
            '智能灯',
            '智能插座', 
            '智能开关',
            '环境监测仪',
            '智能空调',
            '智能音箱'
          ];
          
          const randomType = deviceTypes[Math.floor(Math.random() * deviceTypes.length)];
          const deviceCode = this.generateDeviceCode(randomType);
          
          resolve({
            deviceType: randomType,
            deviceCode: deviceCode,
            deviceName: `${randomType}_${Math.random().toString(36).substr(2, 3)}`,
            isWifiConnected: false,
            wifiName: '',
            firmwareVersion: '1.0.0',
            batteryLevel: Math.floor(Math.random() * 100),
            signalStrength: Math.floor(Math.random() * 100)
          });
        } else {
          reject(new Error('设备无响应'));
        }
      }, 1000 + Math.random() * 2000);
    });
  }
  
  /**
   * 模拟设置设备配置
   * @param {Object} config 配置数据
   * @returns {Promise<Object>} 设置结果
   */
  static async setConfig(config) {
    return new Promise((resolve, reject) => {
      // 验证配置数据
      if (!config.wifiName || !config.wifiPassword || !config.deviceName) {
        reject(new Error('配置参数不完整'));
        return;
      }
      
      // 模拟网络延迟
      setTimeout(() => {
        // 模拟85%成功率
        if (Math.random() > 0.15) {
          resolve({
            success: true,
            message: '配置设置成功',
            data: {
              wifiName: config.wifiName,
              deviceName: config.deviceName,
              timestamp: Date.now()
            }
          });
        } else {
          const errors = [
            'WiFi密码错误',
            '设备配置失败',
            '网络连接超时',
            '设备忙碌，请稍后重试'
          ];
          const randomError = errors[Math.floor(Math.random() * errors.length)];
          reject(new Error(randomError));
        }
      }, 2000 + Math.random() * 3000);
    });
  }
  
  /**
   * 模拟检查WiFi连接状态
   * @returns {Promise<Object>} 连接状态
   */
  static async checkWifiConnection() {
    return new Promise((resolve) => {
      // 模拟连接过程，逐步提高连接成功率
      const attempts = this.connectionAttempts || 0;
      this.connectionAttempts = attempts + 1;
      
      setTimeout(() => {
        // 前3次尝试返回未连接，之后逐步提高成功率
        let isConnected = false;
        if (attempts < 3) {
          isConnected = false;
        } else if (attempts < 6) {
          isConnected = Math.random() > 0.7;
        } else {
          isConnected = Math.random() > 0.2;
        }
        
        resolve({
          isWifiConnected: isConnected,
          wifiName: isConnected ? 'MyHomeWiFi' : '',
          signalStrength: isConnected ? Math.floor(Math.random() * 50) + 50 : 0,
          ipAddress: isConnected ? '192.168.1.' + (100 + Math.floor(Math.random() * 50)) : ''
        });
      }, 1000);
    });
  }
  
  /**
   * 模拟重启设备
   * @returns {Promise<Object>} 重启结果
   */
  static async rebootDevice() {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (Math.random() > 0.1) {
          resolve({
            success: true,
            message: '设备重启成功'
          });
        } else {
          reject(new Error('设备重启失败'));
        }
      }, 3000);
    });
  }
  
  /**
   * 模拟获取设备状态
   * @returns {Promise<Object>} 设备状态
   */
  static async getDeviceStatus() {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          online: Math.random() > 0.2,
          temperature: Math.floor(Math.random() * 30) + 15,
          humidity: Math.floor(Math.random() * 60) + 30,
          batteryLevel: Math.floor(Math.random() * 100),
          lastUpdate: Date.now()
        });
      }, 500);
    });
  }
  
  /**
   * 生成设备码
   * @param {string} deviceType 设备类型
   * @returns {string} 设备码
   */
  static generateDeviceCode(deviceType) {
    const prefixMap = {
      '智能灯': 'SL',
      '智能插座': 'SP',
      '智能开关': 'SS',
      '环境监测仪': 'SE',
      '智能空调': 'SA',
      '智能音箱': 'SM'
    };
    
    const prefix = prefixMap[deviceType] || 'SD';
    const randomNum = Math.random().toString().substr(2, 8);
    return prefix + randomNum;
  }
  
  /**
   * 模拟扫描附近设备
   * @returns {Promise<Array>} 设备列表
   */
  static async scanNearbyDevices() {
    return new Promise((resolve) => {
      setTimeout(() => {
        const deviceCount = Math.floor(Math.random() * 3) + 1;
        const devices = [];
        
        for (let i = 0; i < deviceCount; i++) {
          const deviceTypes = ['智能灯', '智能插座', '智能开关'];
          const randomType = deviceTypes[Math.floor(Math.random() * deviceTypes.length)];
          
          devices.push({
            deviceType: randomType,
            deviceCode: this.generateDeviceCode(randomType),
            deviceName: `${randomType}_${i + 1}`,
            signalStrength: Math.floor(Math.random() * 100),
            distance: Math.floor(Math.random() * 10) + 1
          });
        }
        
        resolve(devices);
      }, 3000);
    });
  }
  
  /**
   * 重置连接尝试次数
   */
  static resetConnectionAttempts() {
    this.connectionAttempts = 0;
  }
  
  /**
   * 模拟网络错误
   * @param {string} errorType 错误类型
   * @returns {Error} 错误对象
   */
  static createNetworkError(errorType = 'timeout') {
    const errorMap = {
      'timeout': '网络连接超时',
      'refused': '连接被拒绝',
      'unreachable': '网络不可达',
      'dns': 'DNS解析失败',
      'ssl': 'SSL证书错误'
    };
    
    return new Error(errorMap[errorType] || '网络错误');
  }
}

export default DeviceAPIMock;