'use strict';

const db = uniCloud.database();

exports.main = async (event, context) => {
  const { access_token, openid } = event;
  
  if (!access_token || !openid) {
    return {
      code: 400,
      message: '一键登录参数不完整'
    };
  }
  
  try {
    // 这里应该调用运营商API验证access_token和获取手机号
    // 为了演示，我们模拟获取手机号的过程
    
    // 模拟从运营商获取的手机号
    const phone = '13800138000'; // 实际应该通过API获取
    
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
        openid: openid,
        createTime: Date.now(),
        lastLoginTime: Date.now(),
        loginType: 'oneclick'
      });
      userId = newUser.id;
    } else {
      // 更新最后登录时间和openid
      userId = userResult.data[0]._id;
      await userCollection.doc(userId).update({
        openid: openid,
        lastLoginTime: Date.now(),
        loginType: 'oneclick'
      });
    }
    
    // 生成token
    const token = Buffer.from(`${userId}_${Date.now()}_${Math.random()}`).toString('base64');
    
    return {
      code: 200,
      message: '一键登录成功',
      data: {
        token: token,
        userId: userId,
        phone: phone
      }
    };
  } catch (error) {
    console.error('一键登录失败:', error);
    return {
      code: 500,
      message: '一键登录失败'
    };
  }
};