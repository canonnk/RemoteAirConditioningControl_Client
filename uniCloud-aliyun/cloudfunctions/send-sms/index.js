'use strict';

const db = uniCloud.database();

exports.main = async (event, context) => {
  const { phone } = event;
  
  // 验证手机号格式
  const phoneRegex = /^1[3-9]\d{9}$/;
  if (!phoneRegex.test(phone)) {
    return {
      code: 400,
      message: '手机号格式不正确'
    };
  }
  
  // 生成6位验证码
  const code = Math.floor(100000 + Math.random() * 900000).toString();
  
  // 设置验证码过期时间（5分钟）
  const expireTime = Date.now() + 5 * 60 * 1000;
  
  try {
    // 将验证码存储到数据库
    const collection = db.collection('sms_codes');
    
    // 先删除该手机号之前的验证码
    await collection.where({
      phone: phone
    }).remove();
    
    // 插入新的验证码
    await collection.add({
      phone: phone,
      code: code,
      expireTime: expireTime,
      createTime: Date.now(),
      used: false
    });
    
    // 这里应该调用短信服务商API发送验证码
    // 为了演示，我们直接返回验证码（生产环境中不应该这样做）
    console.log(`发送验证码到 ${phone}: ${code}`);
    
    return {
      code: 200,
      message: '验证码发送成功',
      data: {
        // 生产环境中不应该返回验证码
        debugCode: code
      }
    };
  } catch (error) {
    console.error('发送验证码失败:', error);
    return {
      code: 500,
      message: '发送验证码失败'
    };
  }
};