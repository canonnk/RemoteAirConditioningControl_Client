/**
 * 网络检测工具类
 * 用于检测设备网络连接状态
 */
class NetworkHelper {
  
  /**
   * 检查是否连接到设备WiFi热点
   * @returns {Promise<boolean>} 是否连接到设备WiFi
   */
  static async checkDeviceWifi() {
    return new Promise((resolve, reject) => {
      // #ifdef APP-PLUS
      // 在APP环境中获取网络信息
      plus.networkinfo.getCurrentType((type) => {
        if (type === plus.networkinfo.CONNECTION_WIFI) {
          // 获取WiFi信息
          this.getWifiInfo().then(wifiInfo => {
            // 检查IP地址是否为192.168.4.*
            const isDeviceNetwork = this.isDeviceNetworkIP(wifiInfo.ip);
            resolve(isDeviceNetwork);
          }).catch(error => {
            reject(error);
          });
        } else {
          resolve(false);
        }
      }, (error) => {
        reject(new Error('无法获取网络信息'));
      });
      // #endif
      
      // #ifdef H5
      // H5环境下无法直接获取IP，使用模拟检测
      setTimeout(() => {
        // 开发环境返回true便于测试
        const isDevelopment = process.env.NODE_ENV === 'development';
        resolve(isDevelopment ? true : Math.random() > 0.5);
      }, 1000);
      // #endif
      
      // #ifdef MP
      // 小程序环境
      uni.getNetworkType({
        success: (res) => {
          if (res.networkType === 'wifi') {
            // 小程序无法获取具体WiFi信息，使用模拟检测
            setTimeout(() => {
              resolve(Math.random() > 0.3);
            }, 1000);
          } else {
            resolve(false);
          }
        },
        fail: (error) => {
          reject(new Error('网络检测失败'));
        }
      });
      // #endif
    });
  }
  
  /**
   * 获取WiFi信息
   * @returns {Promise<Object>} WiFi信息
   */
  static async getWifiInfo() {
    return new Promise((resolve, reject) => {
      // #ifdef APP-PLUS
      // 使用原生插件获取WiFi信息
      if (plus.os.name === 'Android') {
        // Android平台
        plus.android.importClass('java.net.NetworkInterface');
        plus.android.importClass('java.net.InetAddress');
        
        try {
          const interfaces = plus.android.invoke(NetworkInterface, 'getNetworkInterfaces');
          let wifiInfo = null;
          
          while (interfaces.hasMoreElements()) {
            const networkInterface = interfaces.nextElement();
            const name = plus.android.invoke(networkInterface, 'getName');
            
            if (name === 'wlan0') {
              const addresses = plus.android.invoke(networkInterface, 'getInetAddresses');
              while (addresses.hasMoreElements()) {
                const address = addresses.nextElement();
                const ip = plus.android.invoke(address, 'getHostAddress');
                
                if (ip && !ip.includes(':')) {
                  wifiInfo = { ip: ip, interface: name };
                  break;
                }
              }
            }
          }
          
          if (wifiInfo) {
            resolve(wifiInfo);
          } else {
            reject(new Error('无法获取WiFi信息'));
          }
        } catch (error) {
          reject(new Error('获取WiFi信息失败'));
        }
      } else {
        // iOS平台 - 由于权限限制，使用模拟数据
        resolve({
          ip: '192.168.4.100',
          interface: 'en0'
        });
      }
      // #endif
      
      // #ifndef APP-PLUS
      // 非APP环境使用模拟数据
      resolve({
        ip: '192.168.4.100',
        interface: 'wlan0'
      });
      // #endif
    });
  }
  
  /**
   * 检查IP是否为设备网络IP
   * @param {string} ip IP地址
   * @returns {boolean} 是否为设备网络IP
   */
  static isDeviceNetworkIP(ip) {
    if (!ip) return false;
    
    // 检查是否为192.168.4.*网段
    const deviceNetworkPattern = /^192\.168\.4\.\d+$/;
    return deviceNetworkPattern.test(ip);
  }
  
  /**
   * 获取当前网络类型
   * @returns {Promise<string>} 网络类型
   */
  static async getNetworkType() {
    return new Promise((resolve, reject) => {
      uni.getNetworkType({
        success: (res) => {
          resolve(res.networkType);
        },
        fail: (error) => {
          reject(new Error('获取网络类型失败'));
        }
      });
    });
  }
  
  /**
   * 检查网络连接状态
   * @returns {Promise<boolean>} 是否有网络连接
   */
  static async checkNetworkConnection() {
    return new Promise((resolve, reject) => {
      uni.getNetworkType({
        success: (res) => {
          const isConnected = res.networkType !== 'none';
          resolve(isConnected);
        },
        fail: (error) => {
          reject(new Error('网络检测失败'));
        }
      });
    });
  }
  
  /**
   * 等待网络连接
   * @param {number} timeout 超时时间(毫秒)
   * @returns {Promise<boolean>} 是否连接成功
   */
  static async waitForConnection(timeout = 30000) {
    const startTime = Date.now();
    
    return new Promise((resolve, reject) => {
      const checkConnection = async () => {
        try {
          const isConnected = await this.checkNetworkConnection();
          
          if (isConnected) {
            resolve(true);
          } else if (Date.now() - startTime > timeout) {
            reject(new Error('网络连接超时'));
          } else {
            setTimeout(checkConnection, 1000);
          }
        } catch (error) {
          reject(error);
        }
      };
      
      checkConnection();
    });
  }
  
  /**
   * 测试设备API连接
   * @param {string} url API地址
   * @returns {Promise<boolean>} 是否可以连接
   */
  static async testDeviceAPI(url = 'http://192.168.4.1/getDeviceMessage') {
    return new Promise((resolve) => {
      uni.request({
        url: url,
        method: 'GET',
        timeout: 5000,
        success: (res) => {
          resolve(res.statusCode === 200);
        },
        fail: () => {
          resolve(false);
        }
      });
    });
  }
}

export default NetworkHelper;