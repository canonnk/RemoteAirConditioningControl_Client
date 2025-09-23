'use strict';

const db = uniCloud.database();

exports.main = async (event, context) => {
  const { token } = event;
  
  if (!token) {
    return {
      code: 401,
      message: 'token不能为空'
    };
  }
  
  try {
    // 解析token获取用户ID（简单示例）
    const decoded = Buffer.from(token, 'base64').toString();
    const userId = decoded.split('_')[0];
    
    if (!userId) {
      return {
        code: 401,
        message: 'token格式错误'
      };
    }
    
    // 查询用户信息
    const userCollection = db.collection('users');
    const userResult = await userCollection.doc(userId).get();
    
    if (userResult.data.length === 0) {
      return {
        code: 401,
        message: '用户不存在'
      };
    }
    
    const user = userResult.data[0];
    
    return {
      code: 200,
      message: 'token有效',
      data: {
        userId: user._id,
        phone: user.phone,
        createTime: user.createTime,
        lastLoginTime: user.lastLoginTime
      }
    };
  } catch (error) {
    console.error('token验证失败:', error);
    return {
      code: 401,
      message: 'token验证失败'
    };
  }
};