'use strict';

const db = uniCloud.database();

exports.main = async (event, context) => {
  console.log('一键登录云函数被调用', event);
  
  try {
    const { access_token, openid } = event;
    
    if (!access_token) {
      return {
        success: false,
        code: 400,
        message: '缺少access_token参数'
      };
    }
    
    // 使用uni-verify服务验证access_token并获取手机号
    let phoneNumber;
    
    try {
      // 调用uni-verify服务
      const verifyResult = await uniCloud.getPhoneNumber({
        access_token: access_token,
        openid: openid
      });
      
      console.log('uni-verify验证结果:', verifyResult);
      
      if (verifyResult.code !== 0) {
        return {
          success: false,
          code: 400,
          message: verifyResult.message || 'access_token验证失败'
        };
      }
      
      phoneNumber = verifyResult.phoneNumber;
      
    } catch (verifyError) {
      console.error('uni-verify验证失败:', verifyError);
      return {
        success: false,
        code: 400,
        message: 'access_token验证失败: ' + verifyError.message
      };
    }
    
    if (!phoneNumber) {
      return {
        success: false,
        code: 400,
        message: '无法获取手机号码'
      };
    }
    
    console.log('获取到手机号:', phoneNumber);
    
    // 检查用户是否已存在
    const userCollection = db.collection('uni-id-users');
    const existingUser = await userCollection.where({
      mobile: phoneNumber
    }).get();
    
    let userId;
    let isNewUser = false;
    let userInfo = {};
    
    if (existingUser.data.length > 0) {
      // 用户已存在，更新登录信息
      const user = existingUser.data[0];
      userId = user._id;
      userInfo = {
        nickname: user.nickname,
        avatar: user.avatar,
        mobile: user.mobile
      };
      
      await userCollection.doc(userId).update({
        last_login_date: Date.now(),
        last_login_ip: getClientIP(context)
      });
      
      console.log('用户已存在，更新登录信息');
    } else {
      // 创建新用户
      isNewUser = true;
      
      const newUser = {
        mobile: phoneNumber,
        mobile_confirmed: phoneNumber,
        nickname: '用户' + phoneNumber.substr(-4),
        avatar: '',
        status: 0, // 正常状态
        register_date: Date.now(),
        register_ip: getClientIP(context),
        last_login_date: Date.now(),
        last_login_ip: getClientIP(context)
      };
      
      const result = await userCollection.add(newUser);
      userId = result.id;
      
      userInfo = {
        nickname: newUser.nickname,
        avatar: newUser.avatar,
        mobile: newUser.mobile
      };
      
      console.log('创建新用户:', userId);
    }
    
    // 生成uni-id token
    const uniIdCommon = require('uni-id-common');
    const uniIdInstance = uniIdCommon.createInstance({
      context: context
    });
    
    const tokenResult = await uniIdInstance.createToken({
      uid: userId,
      role: ['user']
    });
    
    if (tokenResult.errCode !== 0) {
      throw new Error('生成token失败: ' + tokenResult.errMsg);
    }
    
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
    console.error('一键登录失败:', error);
    
    return {
      success: false,
      code: 500,
      message: '登录失败',
      error: error.message
    };
  }
};

// 获取客户端IP
function getClientIP(context) {
  return context.CLIENTIP || '0.0.0.0';
}