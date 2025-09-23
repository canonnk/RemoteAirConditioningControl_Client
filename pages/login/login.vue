<template>
  <view class="container" :class="{ 'dark-theme': isDarkMode }">
    <view class="header">
      <text class="title">手机号登录</text>
    </view>
    
    <!-- 手机号输入 -->
    <view class="input-group">
      <input 
        type="number" 
        v-model="phone" 
        placeholder="请输入手机号" 
        maxlength="11"
        class="phone-input"
      />
    </view>
    
    <!-- 验证码输入 -->
    <view class="input-group">
      <input 
        type="number" 
        v-model="smsCode" 
        placeholder="请输入验证码" 
        maxlength="6"
        class="code-input"
      />
      <button 
        @click="sendSmsCode" 
        :disabled="!canSendSms || countdown > 0"
        class="send-code-btn"
      >
        {{ countdown > 0 ? `${countdown}s后重发` : '发送验证码' }}
      </button>
    </view>
    
    <!-- 登录按钮 -->
    <button @click="loginWithSms" :disabled="!canLogin" class="login-btn">
      验证码登录
    </button>
    
    <!-- 一键登录按钮 -->
    <button @click="oneClickLogin" class="oneclick-btn">
      一键登录
    </button>
    
    <!-- 提示信息 -->
    <view class="tips">
      <text>登录即表示同意《用户协议》和《隐私政策》</text>
    </view>
  </view>
</template>

<script>
import auth from '@/utils/auth.js';
import theme from '@/utils/theme.js';

export default {
  data() {
    return {
      phone: '',
      smsCode: '',
      countdown: 0,
      timer: null,
      isDarkMode: false
    };
  },
  computed: {
    // 是否可以发送验证码
    canSendSms() {
      return /^1[3-9]\d{9}$/.test(this.phone);
    },
    // 是否可以登录
    canLogin() {
      return this.canSendSms && this.smsCode.length === 6;
    }
  },
  onLoad() {
    // 如果已经登录，直接跳转到首页
    if (auth.isLoggedIn()) {
      uni.reLaunch({
        url: '/pages/index/index'
      });
    }
    
    // 初始化主题状态
    this.isDarkMode = theme.isDarkMode();
    
    // 监听主题变化
    uni.$on('themeChanged', this.onThemeChanged);
  },
  onUnload() {
    // 清除定时器
    if (this.timer) {
      clearInterval(this.timer);
    }
    
    // 移除主题变化监听
    uni.$off('themeChanged', this.onThemeChanged);
  },
  methods: {
    // 主题变化回调
    onThemeChanged(isDark) {
      this.isDarkMode = isDark;
    },
    
    // 发送短信验证码
    async sendSmsCode() {
      if (!this.canSendSms) {
        uni.showToast({
          title: '请输入正确的手机号',
          icon: 'none'
        });
        return;
      }
      
      try {
        uni.showLoading({
          title: '发送中...'
        });
        
        const result = await uniCloud.callFunction({
          name: 'send-sms',
          data: {
            phone: this.phone
          }
        });
        
        uni.hideLoading();
        
        if (result.result.code === 200) {
          uni.showToast({
            title: '验证码发送成功',
            icon: 'success'
          });
          
          // 开始倒计时
          this.startCountdown();
          
          // 开发环境显示验证码（生产环境应删除）
          if (result.result.data && result.result.data.debugCode) {
            console.log('验证码:', result.result.data.debugCode);
            uni.showModal({
              title: '开发提示',
              content: `验证码: ${result.result.data.debugCode}`,
              showCancel: false
            });
          }
        } else {
          uni.showToast({
            title: result.result.message || '发送失败',
            icon: 'none'
          });
        }
      } catch (error) {
        uni.hideLoading();
        console.error('发送验证码失败:', error);
        uni.showToast({
          title: '发送失败，请重试',
          icon: 'none'
        });
      }
    },
    
    // 开始倒计时
    startCountdown() {
      this.countdown = 60;
      this.timer = setInterval(() => {
        this.countdown--;
        if (this.countdown <= 0) {
          clearInterval(this.timer);
          this.timer = null;
        }
      }, 1000);
    },
    
    // 验证码登录
    async loginWithSms() {
      if (!this.canLogin) {
        uni.showToast({
          title: '请输入手机号和验证码',
          icon: 'none'
        });
        return;
      }
      
      try {
        uni.showLoading({
          title: '登录中...'
        });
        
        const result = await uniCloud.callFunction({
          name: 'verify-sms',
          data: {
            phone: this.phone,
            code: this.smsCode
          }
        });
        
        uni.hideLoading();
        
        if (result.result.code === 200) {
          // 保存登录信息
          auth.setToken(result.result.data.token);
          auth.setUserInfo(result.result.data);
          
          uni.showToast({
            title: '登录成功',
            icon: 'success'
          });
          
          // 跳转到首页
          setTimeout(() => {
            uni.reLaunch({
              url: '/pages/index/index'
            });
          }, 1500);
        } else {
          uni.showToast({
            title: result.result.message || '登录失败',
            icon: 'none'
          });
        }
      } catch (error) {
        uni.hideLoading();
        console.error('登录失败:', error);
        uni.showToast({
          title: '登录失败，请重试',
          icon: 'none'
        });
      }
    },
    
    // 一键登录
    async oneClickLogin() {
      try {
        uni.showLoading({
          title: '登录中...'
        });
        
        // 调用uni-app的一键登录API
        const loginResult = await uni.login({
          provider: 'univerify'
        });
        
        if (loginResult.errMsg === 'login:ok') {
          // 调用云函数验证
          const result = await uniCloud.callFunction({
            name: 'one-click-login',
            data: {
              access_token: loginResult.access_token,
              openid: loginResult.openid
            }
          });
          
          uni.hideLoading();
          
          if (result.result.code === 200) {
            // 保存登录信息
            auth.setToken(result.result.data.token);
            auth.setUserInfo(result.result.data);
            
            uni.showToast({
              title: '登录成功',
              icon: 'success'
            });
            
            // 跳转到首页
            setTimeout(() => {
              uni.reLaunch({
                url: '/pages/index/index'
              });
            }, 1500);
          } else {
            uni.showToast({
              title: result.result.message || '登录失败',
              icon: 'none'
            });
          }
        } else {
          uni.hideLoading();
          uni.showToast({
            title: '一键登录取消',
            icon: 'none'
          });
        }
      } catch (error) {
        uni.hideLoading();
        console.error('一键登录失败:', error);
        
        // 如果一键登录不可用，提示用户使用验证码登录
        uni.showModal({
          title: '提示',
          content: '一键登录暂不可用，请使用验证码登录',
          showCancel: false
        });
      }
    }
  }
};
</script>

<style scoped>
.container {
  padding: 40px 30px;
  background-color: #f8f9fa;
  min-height: 100vh;
  transition: all 0.3s ease;
}

.container.dark-theme {
  background-color: #1a1a1a;
}

.header {
  text-align: center;
  margin-bottom: 60px;
}

.title {
  font-size: 28px;
  font-weight: bold;
  color: #333;
}

.dark-theme .title {
  color: #fff;
}

.input-group {
  position: relative;
  margin-bottom: 20px;
}

.phone-input, .code-input {
  width: 100%;
  height: 50px;
  border: 1px solid #e1e5e9;
  border-radius: 8px;
  padding: 0 15px;
  font-size: 16px;
  background-color: #fff;
  box-sizing: border-box;
}

.dark-theme .phone-input, 
.dark-theme .code-input {
  background-color: #2d2d2d;
  border-color: #404040;
  color: #fff;
}

.code-input {
  padding-right: 120px;
}

.send-code-btn {
  position: absolute;
  right: 8px;
  top: 8px;
  width: 100px;
  height: 34px;
  background-color: #007aff;
  color: #fff;
  border: none;
  border-radius: 6px;
  font-size: 14px;
}

.send-code-btn:disabled {
  background-color: #ccc;
}

.login-btn, .oneclick-btn {
  width: 100%;
  height: 50px;
  border-radius: 8px;
  font-size: 16px;
  font-weight: bold;
  margin-bottom: 15px;
  border: none;
}

.login-btn {
  background-color: #007aff;
  color: #fff;
}

.login-btn:disabled {
  background-color: #ccc;
}

.oneclick-btn {
  background-color: #fff;
  color: #007aff;
  border: 1px solid #007aff;
}

.tips {
  text-align: center;
  margin-top: 30px;
}

.tips text {
  font-size: 12px;
  color: #999;
}

.dark-theme .tips text {
  color: #888;
}
</style>