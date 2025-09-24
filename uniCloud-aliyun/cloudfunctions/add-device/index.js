'use strict';

const db = uniCloud.database();
const dbCmd = db.command;

exports.main = async (event, context) => {
  console.log('add-device 云函数被调用', event);
  
  try {
    // 获取用户信息
    const { userInfo } = await uniCloud.getClientInfo(context);
    
    if (!userInfo || !userInfo.uid) {
      return {
        success: false,
        code: 401,
        message: '用户未登录'
      };
    }
    
    // 验证必要参数
    const { deviceCode, deviceType, deviceName } = event;
    
    if (!deviceCode || !deviceType || !deviceName) {
      return {
        success: false,
        code: 400,
        message: '缺少必要参数'
      };
    }
    
    // 验证设备码格式
    if (!isValidDeviceCode(deviceCode)) {
      return {
        success: false,
        code: 400,
        message: '设备码格式不正确'
      };
    }
    
    // 检查设备是否已存在
    const existingDevice = await db.collection('devices')
      .where({
        deviceCode: deviceCode
      })
      .get();
    
    if (existingDevice.data.length > 0) {
      const device = existingDevice.data[0];
      
      // 如果设备已被当前用户添加
      if (device.userId === userInfo.uid) {
        return {
          success: false,
          code: 409,
          message: '设备已在您的设备列表中'
        };
      }
      
      // 如果设备已被其他用户添加
      return {
        success: false,
        code: 409,
        message: '设备已被其他用户添加'
      };
    }
    
    // 获取用户手机号
    const userCollection = db.collection('uni-id-users');
    const userResult = await userCollection.doc(userInfo.uid).get();
    
    if (!userResult.data.length) {
      return {
        success: false,
        code: 404,
        message: '用户信息不存在'
      };
    }
    
    const userData = userResult.data[0];
    const userMobile = userData.mobile || userData.mobile_confirmed || '';
    
    // 创建设备记录
    const deviceData = {
      deviceCode: deviceCode,
      deviceType: deviceType,
      deviceName: deviceName.trim(),
      userId: userInfo.uid,
      userMobile: userMobile,
      status: 'online',
      isEnabled: true,
      settings: {
        autoMode: false,
        brightness: 100,
        temperature: 25,
        notifications: true
      },
      statistics: {
        totalUsageTime: 0,
        energyConsumption: 0,
        lastActiveTime: Date.now()
      },
      createTime: Date.now(),
      updateTime: Date.now()
    };
    
    // 添加设备到数据库
    const addResult = await db.collection('devices').add(deviceData);
    
    if (!addResult.id) {
      return {
        success: false,
        code: 500,
        message: '设备添加失败'
      };
    }
    
    // 更新用户设备统计
    await updateUserDeviceStats(userInfo.uid, deviceType);
    
    // 记录操作日志
    await logDeviceOperation(userInfo.uid, 'add_device', {
      deviceId: addResult.id,
      deviceCode: deviceCode,
      deviceType: deviceType,
      deviceName: deviceName
    });
    
    return {
      success: true,
      code: 200,
      message: '设备添加成功',
      data: {
        deviceId: addResult.id,
        deviceCode: deviceCode,
        deviceName: deviceName,
        deviceType: deviceType,
        createTime: deviceData.createTime
      }
    };
    
  } catch (error) {
    console.error('add-device 云函数执行错误:', error);
    
    return {
      success: false,
      code: 500,
      message: '服务器内部错误',
      error: error.message
    };
  }
};

/**
 * 验证设备码格式
 * @param {string} deviceCode 设备码
 * @returns {boolean} 是否有效
 */
function isValidDeviceCode(deviceCode) {
  // 设备码格式：2位字母前缀 + 8位数字
  const deviceCodePattern = /^[A-Z]{2}\d{8}$/;
  return deviceCodePattern.test(deviceCode);
}

/**
 * 更新用户设备统计
 * @param {string} userId 用户ID
 * @param {string} deviceType 设备类型
 */
async function updateUserDeviceStats(userId, deviceType) {
  try {
    const statsCollection = db.collection('user_device_stats');
    
    // 查找用户统计记录
    const statsResult = await statsCollection.where({
      userId: userId
    }).get();
    
    if (statsResult.data.length > 0) {
      // 更新现有统计
      const stats = statsResult.data[0];
      const deviceTypeCount = stats.deviceTypes || {};
      deviceTypeCount[deviceType] = (deviceTypeCount[deviceType] || 0) + 1;
      
      await statsCollection.doc(stats._id).update({
        totalDevices: dbCmd.inc(1),
        deviceTypes: deviceTypeCount,
        updateTime: Date.now()
      });
    } else {
      // 创建新统计记录
      await statsCollection.add({
        userId: userId,
        totalDevices: 1,
        deviceTypes: {
          [deviceType]: 1
        },
        createTime: Date.now(),
        updateTime: Date.now()
      });
    }
  } catch (error) {
    console.error('更新用户设备统计失败:', error);
  }
}

/**
 * 记录设备操作日志
 * @param {string} userId 用户ID
 * @param {string} operation 操作类型
 * @param {Object} details 操作详情
 */
async function logDeviceOperation(userId, operation, details) {
  try {
    await db.collection('device_operation_logs').add({
      userId: userId,
      operation: operation,
      details: details,
      timestamp: Date.now(),
      ip: '', // 可以从context中获取
      userAgent: '' // 可以从context中获取
    });
  } catch (error) {
    console.error('记录操作日志失败:', error);
  }
}