'use strict';

const db = uniCloud.database();

exports.main = async (event, context) => {
  console.log('验证短信云函数被调用', event);
  
  try {
    const { phone, code, scene = 'login' } = event;
    
    if (!phone || !code) {
      return {
        success: false,
        code: 400,
        message: '手机号和验证码不能为空'
      };
    }
    
    // 验证手机号格式
    const phoneRegex = /^1[3-9]\d{9}$/;
    if (!phoneRegex.test(phone)) {
      return {
        success: false,
        code: 400,
        message: '手机号格式不正确'
      };
    }
    
    // 验证码格式检查
    if (!/^\d{6}$/.test(code)) {
      return {
        success: false,
        code: 400,
        message: '验证码格式不正确'
      };
    }
    
    const smsCollection = db.collection('sms_codes');
    
    // 查找验证码记录
    const smsResult = await smsCollection.where({
      phone: phone,
      code: code,
      scene: scene,
      used: false
    }).orderBy('createTime', 'desc').limit(1).get();
    
    if (smsResult.data.length === 0) {
      return {
        success: false,
        code: 400,
        message: '验证码错误或已使用'
      };
    }
    
    const smsRecord = smsResult.data[0];
    
    // 检查验证码是否过期
    if (Date.now() > smsRecord.expireTime) {
      // 删除过期的验证码
      await smsCollection.doc(smsRecord._id).remove();
      
      return {
        success: false,
        code: 400,
        message: '验证码已过期'
      };
    }
    
    // 标记验证码为已使用
    await smsCollection.doc(smsRecord._id).update({
      used: true,
      usedTime: Date.now(),
      usedIp: getClientIP(context)
    });
    
    // 使用uni-id进行用户管理
    const uniIdCommon = require('uni-id-common');
    const uniIdInstance = uniIdCommon.createInstance({
      context: context
    });
    
    // 检查用户是否存在
    const userCollection = db.collection('uni-id-users');
    const existingUser = await userCollection.where({
      mobile: phone
    }).get();
    
    let userId;
    let isNewUser = false;
    let userInfo = {};
    
    if (existingUser.data.length > 0) {
      // 用户已存在
      const user = existingUser.data[0];
      userId = user._id;
      userInfo = {
        nickname: user.nickname,
        avatar: user.avatar,
        mobile: user.mobile,
        mobile_confirmed: user.mobile_confirmed
      };
      
      // 更新登录信息
      await userCollection.doc(userId).update({
        last_login_date: Date.now(),
        last_login_ip: getClientIP(context),
        mobile_confirmed: phone // 确认手机号
      });
      
      console.log('用户已存在，更新登录信息');
    } else {
      // 创建新用户
      isNewUser = true;
      
      const createUserResult = await uniIdInstance.createUser({
        mobile: phone,
        mobile_confirmed: phone,
        nickname: '用户' + phone.substr(-4),
        avatar: '',
        status: 0
      });
      
      if (createUserResult.errCode !== 0) {
        throw new Error('创建用户失败: ' + createUserResult.errMsg);
      }
      
      userId = createUserResult.uid;
      userInfo = {
        nickname: '用户' + phone.substr(-4),
        avatar: '',
        mobile: phone,
        mobile_confirmed: phone
      };
      
      console.log('创建新用户:', userId);
    }
    
    // 生成token
    const tokenResult = await uniIdInstance.createToken({
      uid: userId,
      role: ['user']
    });
    
    if (tokenResult.errCode !== 0) {
      throw new Error('生成token失败: ' + tokenResult.errMsg);
    }
    
    // 记录登录日志
    await recordLoginLog(userId, phone, 'sms', getClientIP(context));
    
    return {
      success: true,
      code: 200,
      message: isNewUser ? '注册成功' : '登录成功',
      data: {
        token: tokenResult.token,
        tokenExpired: tokenResult.tokenExpired,
        userId: userId,
        userInfo: userInfo,
        isNewUser: isNewUser
      }
    };
    
  } catch (error) {
    console.error('验证短信失败:', error);
    
    return {
      success: false,
      code: 500,
      message: '验证失败',
      error: error.message
    };
  }
};

// 记录登录日志
async function recordLoginLog(userId, phone, loginType, ip) {
  try {
    const logCollection = db.collection('login_logs');
    await logCollection.add({
      userId: userId,
      phone: phone,
      loginType: loginType, // sms, oneclick, password
      ip: ip,
      userAgent: '', // 可以从context中获取
      loginTime: Date.now(),
      success: true
    });
  } catch (error) {
    console.error('记录登录日志失败:', error);
  }
}

// 获取客户端IP
function getClientIP(context) {
  return context.CLIENTIP || '0.0.0.0';
}