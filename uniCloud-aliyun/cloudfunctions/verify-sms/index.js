'use strict';

const db = uniCloud.database();

exports.main = async (event, context) => {
  const { phone, code } = event;
  
  if (!phone || !code) {
    return {
      code: 400,
      message: '手机号和验证码不能为空'
    };
  }
  
  try {
    const collection = db.collection('sms_codes');
    
    // 查找验证码记录
    const result = await collection.where({
      phone: phone,
      code: code,
      used: false
    }).get();
    
    if (result.data.length === 0) {
      return {
        code: 400,
        message: '验证码错误或已使用'
      };
    }
    
    const smsRecord = result.data[0];
    
    // 检查验证码是否过期
    if (Date.now() > smsRecord.expireTime) {
      return {
        code: 400,
        message: '验证码已过期'
      };
    }
    
    // 标记验证码为已使用
    await collection.doc(smsRecord._id).update({
      used: true,
      usedTime: Date.now()
    });
    
    // 检查用户是否存在，不存在则创建
    const userCollection = db.collection('users');
    const userResult = await userCollection.where({
      phone: phone
    }).get();
    
    let userId;
    if (userResult.data.length === 0) {
      // 创建新用户
      const newUser = await userCollection.add({
        phone: phone,
        createTime: Date.now(),
        lastLoginTime: Date.now()
      });
      userId = newUser.id;
    } else {
      // 更新最后登录时间
      userId = userResult.data[0]._id;
      await userCollection.doc(userId).update({
        lastLoginTime: Date.now()
      });
    }
    
    // 生成token（简单示例，生产环境应使用更安全的方式）
    const token = Buffer.from(`${userId}_${Date.now()}_${Math.random()}`).toString('base64');
    
    return {
      code: 200,
      message: '登录成功',
      data: {
        token: token,
        userId: userId,
        phone: phone
      }
    };
  } catch (error) {
    console.error('验证失败:', error);
    return {
      code: 500,
      message: '验证失败'
    };
  }
};