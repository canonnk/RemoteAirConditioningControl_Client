<template>
  <view class="remote-control" :class="{ 'is-off': !acState.power, 'dark-theme': isDarkMode }">
    <!-- 顶部区域 -->
    <view class="header">
      <view class="brand-selector">
        <view class="lang-switcher button" @click="switchLanguage">
          <text>{{ currentLang === 'zh' ? 'EN' : '中' }}</text>
        </view>
        <view class="selected-brand" @click="toggleBrandDropdown">
          <text>{{ brands[selectedBrandIndex] }}</text>
          <text class="dropdown-arrow">▼</text>
        </view>
        <view class="brand-dropdown" :class="{ 'open': showBrandDropdown }" v-if="showBrandDropdown">
          <input class="brand-search" v-model="brandSearchText" :placeholder="t('searchPlaceholder')" />
          <scroll-view class="brand-list" scroll-y>
            <view class="brand-item" 
                  v-for="(brand, index) in filteredBrands" 
                  :key="brand"
                  @click="selectBrand(index)">
              <text>{{ brand }}</text>
            </view>
          </scroll-view>
        </view>
      </view>
      
      <view class="power-button button" :class="{ 'on': acState.power }" @click="togglePower">
        <view class="power-icon">
          <text>⏻</text>
        </view>
      </view>
    </view>

    <!-- 温度控制 -->
    <view class="temp-control">
      <view class="button temp-btn" @click="decreaseTemp">
        <text>▼</text>
      </view>
      <view class="temp-display">
        <text v-if="acState.power">{{ acState.temperature }}<text class="temp-unit">°C</text></text>
        <text v-else>OFF</text>
      </view>
      <view class="button temp-btn" @click="increaseTemp">
        <text>▲</text>
      </view>
    </view>

    <!-- 模式选择 -->
    <view class="mode-selection">
      <view class="option-button" 
            :class="{ 'active': acState.mode === 'cool' }" 
            @click="setMode('cool')">
        <text>❄️</text>
      </view>
      <view class="option-button" 
            :class="{ 'active': acState.mode === 'heat' }" 
            @click="setMode('heat')">
        <text>☀️</text>
      </view>
      <view class="option-button" 
            :class="{ 'active': acState.mode === 'dry' }" 
            @click="setMode('dry')">
        <text>💧</text>
      </view>
      <view class="option-button" 
            :class="{ 'active': acState.mode === 'fan' }" 
            @click="setMode('fan')">
        <text>🌬️</text>
      </view>
      <view class="option-button" 
            :class="{ 'active': acState.mode === 'auto' }" 
            @click="setMode('auto')">
        <text>Ⓐ</text>
      </view>
    </view>

    <!-- 选项网格 -->
    <view class="options-grid">
      <view class="option-row">
        <text class="option-label">{{ t('fanSpeed') }}</text>
        <view class="option-buttons">
          <view class="option-button" 
                :class="{ 'active': acState.fanSpeed === 'auto' }" 
                @click="setFanSpeed('auto')">
            <text>{{ t('auto') }}</text>
          </view>
          <view class="option-button" 
                :class="{ 'active': acState.fanSpeed === 'low' }" 
                @click="setFanSpeed('low')">
            <text>{{ t('low') }}</text>
          </view>
          <view class="option-button" 
                :class="{ 'active': acState.fanSpeed === 'med' }" 
                @click="setFanSpeed('med')">
            <text>{{ t('med') }}</text>
          </view>
          <view class="option-button" 
                :class="{ 'active': acState.fanSpeed === 'high' }" 
                @click="setFanSpeed('high')">
            <text>{{ t('high') }}</text>
          </view>
        </view>
      </view>

      <view class="option-row">
        <text class="option-label">{{ t('swingV') }}</text>
        <view class="option-buttons">
          <view class="option-button" 
                :class="{ 'active': acState.vSwing === 'off' }" 
                @click="setVSwing('off')">
            <text>{{ t('off') }}</text>
          </view>
          <view class="option-button" 
                :class="{ 'active': acState.vSwing === 'up' }" 
                @click="setVSwing('up')">
            <text>{{ t('up') }}</text>
          </view>
          <view class="option-button" 
                :class="{ 'active': acState.vSwing === 'mid' }" 
                @click="setVSwing('mid')">
            <text>{{ t('mid') }}</text>
          </view>
          <view class="option-button" 
                :class="{ 'active': acState.vSwing === 'down' }" 
                @click="setVSwing('down')">
            <text>{{ t('down') }}</text>
          </view>
        </view>
      </view>

      <view class="option-row">
        <text class="option-label">{{ t('swingH') }}</text>
        <view class="option-buttons">
          <view class="option-button" 
                :class="{ 'active': acState.hSwing === 'auto' }" 
                @click="setHSwing('auto')">
            <text>{{ t('auto') }}</text>
          </view>
          <view class="option-button" 
                :class="{ 'active': acState.hSwing === 'mid' }" 
                @click="setHSwing('mid')">
            <text>{{ t('mid') }}</text>
          </view>
          <view class="option-button" 
                :class="{ 'active': acState.hSwing === 'off' }" 
                @click="setHSwing('off')">
            <text>{{ t('off') }}</text>
          </view>
        </view>
      </view>
    </view>

    <!-- 高级功能 -->
    <view class="advanced-features">
      <view class="option-button" 
            :class="{ 'active': acState.boost }" 
            @click="toggleBoost">
        <text>🚀 {{ t('boost') }}</text>
      </view>
      <view class="option-button" 
            :class="{ 'active': acState.light }" 
            @click="toggleLight">
        <text>💡 {{ t('light') }}</text>
      </view>
      <view class="option-button" 
            :class="{ 'active': acState.xFan }" 
            @click="toggleXFan">
        <text>🍃 {{ t('xFan') }}</text>
      </view>
      <view class="option-button" 
            :class="{ 'active': acState.sleep }" 
            @click="toggleSleep">
        <text>🌙 {{ t('sleep') }}</text>
      </view>
      <view class="option-button" 
            :class="{ 'active': acState.quiet }" 
            @click="toggleQuiet">
        <text>🤫 {{ t('quiet') }}</text>
      </view>
      <view class="option-button" 
            :class="{ 'active': acState.econo }" 
            @click="toggleEcono">
        <text>🌿 {{ t('econo') }}</text>
      </view>
      <!-- <view class="option-button" 
            :class="{ 'active': acState.timer > 0 }" 
            @click="setTimer">
        <text>⏱️ {{ t('timer') }}</text>
      </view> -->
    </view>
  </view>
</template>

<script>
import theme from '@/utils/theme.js';

export default {
  data() {
    return {
      isDarkMode: false,
      currentLang: 'zh',
      showBrandDropdown: false,
      brandSearchText: '',
      selectedBrandIndex: 0,
      brands: ["GREE", "Midea", "Haier", "Hisense", "TCL", "AUX", "Panasonic", "Daikin", "Mitsubishi", "LG", "Samsung", "CHIGO", "YORK"],
      
      // 空调状态
      acState: {
        brand: 'GREE',
        power: true,
        mode: 'cool',
        temperature: 24,
        fanSpeed: 'auto',
        vSwing: 'off', // off, up, mid, down
        hSwing: 'off',
        boost: false,
        light: false,
        xFan: false,
        sleep: false,
        quiet: false,
        econo: false,
        timer: 0
      },
      
      // 翻译字典
      translations: {
        en: {
          fanSpeed: "Fan Speed",
          swingV: "Swing V", 
          swingH: "Swing H",
          auto: "Auto",
          low: "Low",
          med: "Med", 
          high: "High",
          mid: "Mid",
          off: "Off",
          up: "Up",
          down: "Down",
          boost: "Boost",
          light: "Light", 
          xFan: "X-Fan",
          sleep: "Sleep",
          quiet: "Quiet",
          econo: "Econo",
          timer: "Timer",
          searchPlaceholder: "Search Brands..."
        },
        zh: {
          fanSpeed: "风速",
          swingV: "上下扫风",
          swingH: "左右扫风", 
          auto: "自动",
          low: "低",
          med: "中",
          high: "高",
          mid: "中", 
          off: "关",
          up: "上",
          down: "下",
          boost: "强力",
          light: "灯光",
          xFan: "干燥", 
          sleep: "睡眠",
          quiet: "静音",
          econo: "节能",
          timer: "定时",
          searchPlaceholder: "搜索品牌..."
        }
      }
    };
  },
  
  computed: {
    filteredBrands() {
      if (!this.brandSearchText) {
        return this.brands;
      }
      return this.brands.filter(brand => 
        brand.toLowerCase().includes(this.brandSearchText.toLowerCase())
      );
    }
  },
  
  onLoad(options) {
    // 初始化主题状态
    this.isDarkMode = theme.isDarkMode();
    
    // 监听主题变化
    uni.$on('themeChanged', this.onThemeChanged);
    
    // 从本地存储加载语言设置
    const savedLang = uni.getStorageSync('acRemoteLang');
    if (savedLang) {
      this.currentLang = savedLang;
    }
  },
  
  onShow() {
    // 每次页面显示时，都从全局状态同步并应用主题
    const currentTheme = theme.getCurrentTheme();
    this.isDarkMode = currentTheme === theme.THEMES.DARK;
    theme.setNavigationBarStyle(currentTheme);
    theme.setTabBarStyle(currentTheme);
  },
  
  onUnload() {
    // 移除主题变化监听
    uni.$off('themeChanged', this.onThemeChanged);
  },
  
  methods: {
    // 翻译方法
    t(key) {
      return this.translations[this.currentLang][key] || key;
    },
    
    // 主题变化回调
    onThemeChanged(isDark) {
      this.isDarkMode = isDark;
    },
    
    // 切换语言
    switchLanguage() {
      this.currentLang = this.currentLang === 'zh' ? 'en' : 'zh';
      uni.setStorageSync('acRemoteLang', this.currentLang);
    },
    
    // 切换品牌下拉框
    toggleBrandDropdown() {
      this.showBrandDropdown = !this.showBrandDropdown;
    },
    
    // 选择品牌
    selectBrand(index) {
      const originalIndex = this.brands.indexOf(this.filteredBrands[index]);
      this.selectedBrandIndex = originalIndex;
      this.acState.brand = this.brands[originalIndex];
      this.showBrandDropdown = false;
      this.brandSearchText = '';
      
      uni.showToast({
        title: `已切换到${this.acState.brand}`,
        icon: 'success'
      });
      
      this.sendCommand();
    },
    
    // 切换电源
    togglePower() {
      this.acState.power = !this.acState.power;
      this.sendCommand();
      this.updateUI();
    },
    
    // 增加温度
    increaseTemp() {
      if (this.acState.power && this.acState.temperature < 30) {
        this.acState.temperature++;
        this.sendCommand();
      }
    },
    
    // 降低温度
    decreaseTemp() {
      if (this.acState.power && this.acState.temperature > 16) {
        this.acState.temperature--;
        this.sendCommand();
      }
    },
    
    // 设置模式
    setMode(mode) {
      if (this.acState.power) {
        this.acState.mode = mode;
        this.sendCommand();
      }
    },
    
    // 设置风速
    setFanSpeed(speed) {
      if (this.acState.power) {
        this.acState.fanSpeed = speed;
        this.sendCommand();
      }
    },
    
    // 设置上下扫风
    setVSwing(swing) {
      if (this.acState.power) {
        this.acState.vSwing = swing;
        this.sendCommand();
      }
    },
    
    // 设置左右扫风
    setHSwing(swing) {
      if (this.acState.power) {
        this.acState.hSwing = swing;
        this.sendCommand();
      }
    },
    
    // 切换强力模式
    toggleBoost() {
      if (this.acState.power) {
        this.acState.boost = !this.acState.boost;
        this.sendCommand();
      }
    },
    
    // 切换灯光
    toggleLight() {
      this.acState.light = !this.acState.light;
      this.sendCommand();
    },
    
    // 切换干燥模式
    toggleXFan() {
      if (this.acState.power) {
        this.acState.xFan = !this.acState.xFan;
        this.sendCommand();
      }
    },
    
    // 切换睡眠模式
    toggleSleep() {
      if (this.acState.power) {
        this.acState.sleep = !this.acState.sleep;
        this.sendCommand();
      }
    },
    
    // 切换静音模式
    toggleQuiet() {
      if (this.acState.power) {
        this.acState.quiet = !this.acState.quiet;
        this.sendCommand();
      }
    },
    
    // 切换节能模式
    toggleEcono() {
      if (this.acState.power) {
        this.acState.econo = !this.acState.econo;
        this.sendCommand();
      }
    },
    
    // 设置定时
    setTimer() {
      if (this.acState.power) {
        uni.showModal({
          title: this.t('timer'),
          content: this.currentLang === 'zh' ? '设置定时分钟 (0-1440, 输入0取消)' : 'Set timer minutes (0-1440, 0 to cancel)',
          editable: true,
          placeholderText: this.acState.timer.toString(),
          success: (res) => {
            if (res.confirm) {
              const minutes = parseInt(res.content);
              if (!isNaN(minutes) && minutes >= 0 && minutes <= 1440) {
                this.acState.timer = minutes;
                this.sendCommand();
              } else {
                uni.showToast({
                  title: this.currentLang === 'zh' ? '请输入0到1440之间的数字！' : 'Please enter a number between 0 and 1440!',
                  icon: 'none'
                });
              }
            }
          }
        });
      }
    },
    
    // 更新UI状态
    updateUI() {
      // UI状态已通过数据绑定自动更新
    },
    
    // 发送命令
    async sendCommand() {
      // 构建命令字符串
      const modeMap = { cool: '01', heat: '04', dry: '02', fan: '03', auto: '00' };
      const fanMap = { auto: '0', low: '1', med: '2', high: '3' };
      const vSwingMap = { off: '00', up: '01', mid: '02', down: '03' };
      const hSwingMap = { auto: '01', mid: '04', off: '00' };
      
      const command = 
        (this.acState.power ? '1' : '0') +
        (modeMap[this.acState.mode] || '01').padStart(2, '0') +
        this.acState.temperature.toString().padStart(2, '0') +
        (fanMap[this.acState.fanSpeed] || '0') +
        (vSwingMap[this.acState.vSwing] || '00').padStart(2, '0') +
        (hSwingMap[this.acState.hSwing] || '00').padStart(2, '0') +
        (this.acState.boost ? '1' : '0') +
        (this.acState.light ? '1' : '0') +
        (this.acState.xFan ? '1' : '0') +
        (this.acState.sleep ? '1' : '0') +
        (this.acState.quiet ? '1' : '0') +
        (this.acState.econo ? '1' : '0') +
        this.acState.timer.toString().padStart(4, '0') +
        '--';
      
      console.log("准备发送指令:", command);
      
      try {
        // 这里可以调用实际的API发送命令
        // const response = await uni.request({
        //   url: 'https://myhome.cn/device/xxxx/sendCommmand',
        //   method: 'POST',
        //   data: { command: command }
        // });
        
        console.log('指令发送成功:', command);
      } catch (error) {
        console.error('指令发送失败:', error);
        uni.showToast({
          title: `指令发送失败: ${error.message}`,
          icon: 'none'
        });
      }
    }
  }
};
</script>

<style scoped>
/* CSS变量定义 */
.remote-control {
  --bg-dark: #2c3e50;
  --bg-panel: #34495e;
  --bg-dropdown: #46627f;
  --text-primary: #ecf0f1;
  --text-secondary: #95a5a6;
  --accent-blue: #3498db;
  --color-on: #2ecc71;
  --color-off: #e74c3c;
}

/* 浅色主题 */
.remote-control:not(.dark-theme) {
  --bg-dark: #f8f9fa;
  --bg-panel: #ffffff;
  --bg-dropdown: #e9ecef;
  --text-primary: #212529;
  --text-secondary: #6c757d;
  --accent-blue: #007bff;
  --color-on: #28a745;
  --color-off: #dc3545;
}

/* 深色主题 */
.remote-control.dark-theme {
  --bg-dark: #1a202c;
  --bg-panel: #2d3748;
  --bg-dropdown: #4a5568;
}

/* 主容器 */
.remote-control {
  width: 100%;
  min-height: 100vh;
  background-color: var(--bg-panel);
  box-sizing: border-box;
  padding: 30rpx 30rpx 50rpx 30rpx;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  gap: 64rpx;
  font-family: 'Roboto', sans-serif;
  color: var(--text-primary);
}

/* 按钮基础样式 */
.button, .option-button {
  background-color: var(--bg-dark);
  border: none;
  color: var(--text-secondary);
  border-radius: 20rpx;
  padding: 18rpx;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 24rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2rpx 8rpx rgba(0,0,0,0.1);
}

.button:active, .option-button:active {
  transform: scale(0.95);
}

.option-button.active {
  background-color: var(--accent-blue);
  color: white;
  box-shadow: 0 4rpx 16rpx rgba(52, 152, 219, 0.4);
  transform: translateY(-1rpx);
}

/* 关机状态下禁用按钮 */
.remote-control.is-off .button:not(.power-button):not(.lang-switcher),
.remote-control.is-off .option-button {
  opacity: 0.6;
  pointer-events: none;
}

/* 顶部区域 */
.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.brand-selector {
  position: relative;
  display: flex;
  align-items: center;
  gap: 12rpx;
  background-color: var(--bg-dark);
  border-radius: 20rpx;
  padding-right: 20rpx;
}

.lang-switcher {
  font-size: 20rpx;
  padding: 12rpx 16rpx;
  border-top-left-radius: 20rpx;
  border-bottom-left-radius: 20rpx;
  border-top-right-radius: 0;
  border-bottom-right-radius: 0;
}

.selected-brand {
  font-size: 28rpx;
  font-weight: bold;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8rpx;
}

.dropdown-arrow {
  font-size: 16rpx;
  opacity: 0.7;
}

.brand-dropdown {
  position: absolute;
  top: calc(100% + 8rpx);
  left: 0;
  width: 300rpx;
  background-color: var(--bg-dropdown);
  border-radius: 20rpx;
  box-shadow: 0 8rpx 16rpx rgba(0,0,0,0.3);
  z-index: 100;
  overflow: hidden;
  visibility: hidden;
  opacity: 0;
  transform: translateY(-10rpx);
  transition: opacity 0.2s ease, transform 0.2s ease, visibility 0s 0.2s;
}

.brand-dropdown.open {
  visibility: visible;
  opacity: 1;
  transform: translateY(0);
  transition: opacity 0.2s ease, transform 0.2s ease;
}

.brand-search {
  width: 100%;
  box-sizing: border-box;
  padding: 16rpx;
  border: none;
  background-color: rgba(0,0,0,0.2);
  color: var(--text-primary);
  font-size: 20rpx;
}

.brand-search:focus {
  outline: none;
  background-color: rgba(0,0,0,0.3);
}

.brand-list {
  max-height: 300rpx;
}

.brand-item {
  padding: 16rpx 20rpx;
  cursor: pointer;
  transition: background-color 0.2s;
  font-size: 20rpx;
}

.brand-item:hover {
  background-color: var(--accent-blue);
}

/* 电源按钮 */
.power-button {
  background: none;
  padding: 12rpx;
  border-radius: 50%;
}

.power-icon {
  width: 40rpx;
  height: 40rpx;
  color: var(--color-off);
  transition: color 0.3s;
  font-size: 40rpx;
}

.power-button.on .power-icon {
  color: var(--color-on);
}

/* 温度控制 */
.temp-control {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 25rpx;
  flex-shrink: 0;
  margin: 8rpx 0;
}

.temp-display {
  font-size: 80rpx;
  font-weight: 300;
  width: 200rpx;
  text-align: center;
  color: var(--text-primary);
}

.temp-unit {
  font-size: 32rpx;
}

.temp-btn {
  font-size: 36rpx;
  color: var(--text-primary);
  border-radius: 50%;
  width: 70rpx;
  height: 70rpx;
}

/* 模式选择 */
.mode-selection {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 12rpx;
  margin: 8rpx 0;
}

.mode-selection .option-button {
  padding: 22rpx 10rpx;
  font-size: 28rpx;
}

/* 选项网格 */
.options-grid {
  display: flex;
  flex-direction: column;
  gap: 10rpx;
  margin: 12rpx 0;
}

.option-row {
  display: flex;
  align-items: center;
  gap: 12rpx;
}

.option-label {
  width: 100rpx;
  text-align: right;
  font-size: 20rpx;
  color: var(--text-secondary);
  flex-shrink: 0;
}

.option-buttons {
  display: flex;
  gap: 10rpx;
  flex-grow: 1;
}

.option-buttons .option-button {
  flex-grow: 1;
  font-size: 18rpx;
  padding: 14rpx 8rpx;
}

/* 高级功能 */
.advanced-features {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12rpx;
  margin-top: 12rpx;
}

.advanced-features .option-button {
  font-size: 20rpx;
  padding: 16rpx 8rpx;
}

/* 响应式设计 */
@media screen and (max-width: 750rpx) {
  .remote-control {
    padding: 25rpx 20rpx 40rpx 20rpx;
    gap: 12rpx;
  }
  
  .temp-display {
    font-size: 70rpx;
    width: 180rpx;
  }
  
  .temp-control {
    gap: 20rpx;
    margin: 6rpx 0;
  }
  
  .mode-selection {
    gap: 10rpx;
    margin: 6rpx 0;
  }
  
  .mode-selection .option-button {
    padding: 18rpx 8rpx;
    font-size: 24rpx;
  }
  
  .options-grid {
    gap: 8rpx;
    margin: 10rpx 0;
  }
  
  .option-row {
    gap: 10rpx;
  }
  
  .advanced-features {
    grid-template-columns: repeat(2, 1fr);
    gap: 10rpx;
    margin-top: 10rpx;
  }
}

@media screen and (max-height: 1334rpx) {
  .remote-control {
    padding: 20rpx 15rpx 30rpx 15rpx;
    gap: 10rpx;
  }
  
  .temp-display {
    font-size: 60rpx;
    width: 160rpx;
  }
  
  .temp-control {
    gap: 18rpx;
    margin: 4rpx 0;
  }
  
  .mode-selection {
    gap: 8rpx;
    margin: 4rpx 0;
  }
  
  .mode-selection .option-button {
    padding: 16rpx 6rpx;
    font-size: 20rpx;
  }
  
  .options-grid {
    gap: 6rpx;
    margin: 8rpx 0;
  }
  
  .option-row {
    gap: 8rpx;
  }
  
  .option-buttons .option-button {
    font-size: 16rpx;
    padding: 12rpx 6rpx;
  }
  
  .advanced-features {
    gap: 8rpx;
    margin-top: 8rpx;
  }
  
  .advanced-features .option-button {
    font-size: 16rpx;
    padding: 12rpx 6rpx;
  }
}
</style>