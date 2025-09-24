'use strict';

const db = uniCloud.database();

exports.main = async (event, context) => {
  console.log('发送短信云函数被调用', event);
  
  try {
    const { phone, scene = 'login' } = event;
    
    // 验证手机号格式
    const phoneRegex = /^1[3-9]\d{9}$/;
    if (!phoneRegex.test(phone)) {
      return {
        success: false,
        code: 400,
        message: '手机号格式不正确'
      };
    }
    
    // 检查发送频率限制（1分钟内只能发送一次）
    const smsCollection = db.collection('sms_codes');
    const recentSms = await smsCollection.where({
      phone: phone,
      createTime: db.command.gte(Date.now() - 60 * 1000) // 1分钟内
    }).get();
    
    if (recentSms.data.length > 0) {
      return {
        success: false,
        code: 429,
        message: '发送过于频繁，请稍后再试'
      };
    }
    
    // 生成6位验证码
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    
    // 设置验证码过期时间（5分钟）
    const expireTime = Date.now() + 5 * 60 * 1000;
    
    try {
      // 使用uni-sms发送短信
      const smsResult = await uniCloud.sendSms({
        phone: phone,
        templateId: getSmsTemplateId(scene), // 根据场景获取模板ID
        data: {
          code: code,
          expiry: '5' // 5分钟有效期
        }
      });
      
      console.log('短信发送结果:', smsResult);
      
      if (smsResult.errCode !== 0) {
        throw new Error(smsResult.errMsg || '短信发送失败');
      }
      
      // 将验证码存储到数据库
      // 先删除该手机号之前未使用的验证码
      await smsCollection.where({
        phone: phone,
        used: false
      }).remove();
      
      // 插入新的验证码记录
      await smsCollection.add({
        phone: phone,
        code: code,
        scene: scene,
        expireTime: expireTime,
        createTime: Date.now(),
        used: false,
        smsId: smsResult.smsId || '', // 短信服务商返回的ID
        ip: getClientIP(context)
      });
      
      console.log(`验证码发送成功: ${phone}`);
      
      return {
        success: true,
        code: 200,
        message: '验证码发送成功',
        data: {
          smsId: smsResult.smsId,
          expireTime: expireTime
        }
      };
      
    } catch (smsError) {
      console.error('短信发送失败:', smsError);
      
      // 如果是开发环境，可以返回验证码用于测试
      if (process.env.NODE_ENV === 'development') {
        // 开发环境：保存验证码到数据库但不实际发送短信
        await smsCollection.where({
          phone: phone,
          used: false
        }).remove();
        
        await smsCollection.add({
          phone: phone,
          code: code,
          scene: scene,
          expireTime: expireTime,
          createTime: Date.now(),
          used: false,
          smsId: 'dev_' + Date.now(),
          ip: getClientIP(context),
          isDev: true
        });
        
        return {
          success: true,
          code: 200,
          message: '验证码发送成功（开发模式）',
          data: {
            smsId: 'dev_' + Date.now(),
            expireTime: expireTime,
            // 开发环境返回验证码
            debugCode: code
          }
        };
      }
      
      return {
        success: false,
        code: 500,
        message: '短信发送失败: ' + smsError.message
      };
    }
    
  } catch (error) {
    console.error('发送短信云函数执行失败:', error);
    
    return {
      success: false,
      code: 500,
      message: '服务器内部错误',
      error: error.message
    };
  }
};

// 根据场景获取短信模板ID
function getSmsTemplateId(scene) {
  const templateMap = {
    'login': 'SMS_LOGIN_TEMPLATE', // 登录验证码模板
    'register': 'SMS_REGISTER_TEMPLATE', // 注册验证码模板
    'reset_password': 'SMS_RESET_PASSWORD_TEMPLATE', // 重置密码模板
    'bind_phone': 'SMS_BIND_PHONE_TEMPLATE' // 绑定手机号模板
  };
  
  return templateMap[scene] || templateMap['login'];
}

// 获取客户端IP
function getClientIP(context) {
  return context.CLIENTIP || '0.0.0.0';
}