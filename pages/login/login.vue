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
        
        if (result.result.success && result.result.code === 200) {
          uni.showToast({
            title: result.result.message,
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
        
        if (result.result.success && result.result.code === 200) {
          // 保存登录信息
          auth.setToken(result.result.data.token);
          auth.setUserInfo(result.result.data);
          
          uni.showToast({
            title: result.result.message,
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
        // 首先检查是否支持一键登录
        const checkResult = await uni.checkLogin({
          provider: 'univerify'
        });
        
        if (!checkResult.isSupport) {
          uni.showModal({
            title: '提示',
            content: '当前环境不支持一键登录，请使用验证码登录',
            showCancel: false
          });
          return;
        }
        
        uni.showLoading({
          title: '预登录中...'
        });
        
        // 预登录
        const preLoginResult = await uni.preLogin({
          provider: 'univerify'
        });
        
        if (preLoginResult.errCode !== 0) {
          uni.hideLoading();
          console.error('预登录失败:', preLoginResult);
          uni.showModal({
            title: '提示', 
            content: '预登录失败，请使用验证码登录',
            showCancel: false
          });
          return;
        }
        
        uni.hideLoading();
        
        // 显示一键登录界面
        uni.showLoading({
          title: '登录中...'
        });
        
        const loginResult = await uni.login({
          provider: 'univerify',
          univerifyStyle: {
            // 自定义一键登录界面样式
            fullScreen: true,
            backgroundColor: '#ffffff',
            buttons: {
              loginBtn: {
                width: '750rpx',
                height: '94rpx',
                textColor: '#ffffff',
                borderRadius: '10rpx',
                backgroundColor: '#007aff'
              }
            },
            privacyTerms: {
              defaultCheckBoxState: true,
              textColor: '#BBBBBB',
              termsColor: '#5496E3',
              prefix: '我已阅读并同意',
              suffix: '并使用本机号码登录'
            }
          }
        });
        
        if (loginResult.errMsg === 'login:ok') {
          // 调用云函数验证access_token并获取手机号
          const result = await uniCloud.callFunction({
            name: 'one-click-login',
            data: {
              access_token: loginResult.access_token,
              openid: loginResult.openid || ''
            }
          });
          
          uni.hideLoading();
          
          if (result.result.success && result.result.code === 200) {
            // 保存登录信息
            auth.setToken(result.result.data.token);
            auth.setUserInfo(result.result.data);
            
            uni.showToast({
              title: result.result.message,
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
          
          // 用户取消登录
          if (loginResult.errCode === 30002) {
            uni.showToast({
              title: '用户取消登录',
              icon: 'none'
            });
          } else {
            console.error('一键登录失败:', loginResult);
            uni.showToast({
              title: '登录失败: ' + (loginResult.errMsg || '未知错误'),
              icon: 'none'
            });
          }
        }
      } catch (error) {
        uni.hideLoading();
        console.error('一键登录异常:', error);
        
        // 根据错误类型给出不同提示
        let errorMessage = '一键登录失败';
        if (error.errCode) {
          switch (error.errCode) {
            case 30001:
              errorMessage = '一键登录服务初始化失败';
              break;
            case 30002:
              errorMessage = '用户取消登录';
              break;
            case 30003:
              errorMessage = '未开通一键登录服务';
              break;
            case 30004:
              errorMessage = '应用未配置一键登录';
              break;
            case 30005:
              errorMessage = '一键登录服务不可用';
              break;
            default:
              errorMessage = `登录失败(${error.errCode})`;
          }
        }
        
        uni.showModal({
          title: '提示',
          content: errorMessage + '，请使用验证码登录',
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