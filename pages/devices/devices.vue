<template>
  <view class="container" :class="{ 'dark-theme': isDarkMode }">
    <!-- 顶部导航 -->
    <view class="header">
      <view class="location-tabs">
        <view 
          v-for="(room, index) in rooms" 
          :key="index"
          class="tab-item"
          :class="{ 'active': currentRoom === index }"
          @click="switchRoom(index)"
        >
          <text class="tab-text">{{ room.name }}</text>
        </view>
      </view>
      <view class="header-actions">
        <view class="add-btn" @click="addDevice">
          <text class="add-icon">+</text>
        </view>
      </view>
    </view>

    <!-- 设备列表 -->
    <scroll-view class="device-list" scroll-y>
      <view class="device-grid">
        <view 
          v-for="device in currentRoomDevices" 
          :key="device.id"
          class="device-card"
          :class="{ 'has-switch': device.hasSwitch }"
          @click="openDevice(device)"
        >
          <!-- 设备图标 -->
          <view class="device-icon">
            <text class="icon">{{ device.icon }}</text>
          </view>
          
          <!-- 设备信息 -->
          <view class="device-info">
            <text class="device-name">{{ device.name }}</text>
            <text class="device-status" v-if="device.status">{{ device.status }}</text>
            <text class="device-room">{{ device.room }}</text>
          </view>
          
          <!-- 开关按钮 -->
          <view 
            v-if="device.hasSwitch" 
            class="device-switch"
            :class="{ 'on': device.isOn }"
            @click.stop="toggleDevice(device)"
          >
            <view class="switch-circle"></view>
          </view>
        </view>
      </view>
      
      <!-- 空状态 -->
      <view v-if="currentRoomDevices.length === 0" class="empty-state">
        <text class="empty-icon">📱</text>
        <text class="empty-text">暂无设备</text>
        <text class="empty-desc">点击右上角 + 号添加设备</text>
      </view>
    </scroll-view>
  </view>
</template>

<script>
import auth from '@/utils/auth.js';
import theme from '@/utils/theme.js';

export default {
  data() {
    return {
      isDarkMode: false,
      currentRoom: 0,
      rooms: [
        { name: '全屋', id: 'all' },
        { name: '客厅', id: 'living_room' },
        { name: '卧室', id: 'bedroom' },
        { name: '厨房', id: 'kitchen' },
        { name: '卫生间', id: 'bathroom' }
      ],
      devices: [
        {
          id: 1,
          name: '环境',
          status: '室内环境信息',
          room: '客厅',
          roomId: 'living_room',
          icon: '🌿',
          hasSwitch: false,
          type: 'environment'
        },
        {
          id: 2,
          name: '床头灯',
          status: '',
          room: '卧室',
          roomId: 'bedroom',
          icon: '💡',
          hasSwitch: true,
          isOn: false,
          type: 'light'
        },
        {
          id: 3,
          name: '智能电压力锅 2.5L',
          status: '江景厨房 · 设备离线',
          room: '厨房',
          roomId: 'kitchen',
          icon: '🍲',
          hasSwitch: false,
          type: 'cooker'
        },
        {
          id: 4,
          name: '净水器',
          status: '滤芯剩余 · TDS 17',
          room: '厨房',
          roomId: 'kitchen',
          icon: '💧',
          hasSwitch: false,
          type: 'purifier'
        },
        {
          id: 5,
          name: '288主',
          status: '',
          room: '客厅',
          roomId: 'living_room',
          icon: '📶',
          hasSwitch: false,
          type: 'router'
        },
        {
          id: 6,
          name: '小爱音箱Pro',
          status: '',
          room: '卧室',
          roomId: 'bedroom',
          icon: '🔊',
          hasSwitch: false,
          type: 'speaker'
        },
        {
          id: 7,
          name: '血压计',
          status: '288二楼客厅... 离线9天',
          room: '客厅',
          roomId: 'living_room',
          icon: '🩺',
          hasSwitch: false,
          type: 'health'
        },
        {
          id: 8,
          name: '路由器散热',
          status: '未分配房间',
          room: '未分配',
          roomId: 'unassigned',
          icon: '🌀',
          hasSwitch: true,
          isOn: true,
          type: 'fan'
        },
        {
          id: 9,
          name: '空调',
          status: '制冷模式 · 26°C',
          room: '卧室',
          roomId: 'bedroom',
          icon: '❄️',
          hasSwitch: true,
          isOn: true,
          type: 'airconditioner'
        },
        {
          id: 10,
          name: '扫地机器人',
          status: '充电中',
          room: '客厅',
          roomId: 'living_room',
          icon: '🤖',
          hasSwitch: false,
          type: 'vacuum'
        }
      ]
    };
  },
  computed: {
    currentRoomDevices() {
      if (this.currentRoom === 0) {
        // 全屋显示所有设备
        return this.devices;
      } else {
        // 显示当前房间的设备
        const roomId = this.rooms[this.currentRoom].id;
        return this.devices.filter(device => device.roomId === roomId);
      }
    }
  },
  async onLoad() {
    // 检查页面访问权限
    const hasAccess = await auth.checkPageAccess();
    if (!hasAccess) return;
    
    // 初始化主题状态
    this.isDarkMode = theme.isDarkMode();
    
    // 监听主题变化
    uni.$on('themeChanged', this.onThemeChanged);
  },
  onUnload() {
    // 移除主题变化监听
    uni.$off('themeChanged', this.onThemeChanged);
  },
  methods: {
    // 主题变化回调
    onThemeChanged(isDark) {
      this.isDarkMode = isDark;
    },
    
    // 切换房间
    switchRoom(index) {
      this.currentRoom = index;
    },
    
    // 添加设备
    addDevice() {
      uni.showActionSheet({
        itemList: ['扫描二维码', '手动添加', '附近设备'],
        success: (res) => {
          switch(res.tapIndex) {
            case 0:
              this.scanQRCode();
              break;
            case 1:
              this.manualAdd();
              break;
            case 2:
              this.findNearbyDevices();
              break;
          }
        }
      });
    },
    
    // 扫描二维码添加设备
    scanQRCode() {
      // #ifdef APP-PLUS
      uni.scanCode({
        success: (res) => {
          uni.showToast({
            title: '扫描成功，正在添加设备...',
            icon: 'success'
          });
          // 这里处理扫描结果
        },
        fail: () => {
          uni.showToast({
            title: '扫描失败',
            icon: 'none'
          });
        }
      });
      // #endif
      
      // #ifndef APP-PLUS
      uni.showToast({
        title: '当前环境不支持扫码',
        icon: 'none'
      });
      // #endif
    },
    
    // 手动添加设备
    manualAdd() {
      uni.navigateTo({
        url: '/pages/device-add/device-add'
      });
    },
    
    // 查找附近设备
    findNearbyDevices() {
      uni.showLoading({
        title: '搜索中...'
      });
      
      setTimeout(() => {
        uni.hideLoading();
        uni.showToast({
          title: '未发现新设备',
          icon: 'none'
        });
      }, 2000);
    },
    
    // 切换设备开关
    toggleDevice(device) {
      device.isOn = !device.isOn;
      
      uni.showToast({
        title: device.isOn ? '已开启' : '已关闭',
        icon: 'success'
      });
      
      // 这里可以调用云函数更新设备状态
      this.updateDeviceStatus(device);
    },
    
    // 更新设备状态
    async updateDeviceStatus(device) {
      try {
        // 调用云函数更新设备状态
        // const result = await uniCloud.callFunction({
        //   name: 'update-device-status',
        //   data: {
        //     deviceId: device.id,
        //     isOn: device.isOn
        //   }
        // });
        
        console.log('设备状态已更新:', device.name, device.isOn);
      } catch (error) {
        console.error('更新设备状态失败:', error);
        // 回滚状态
        device.isOn = !device.isOn;
        uni.showToast({
          title: '操作失败，请重试',
          icon: 'none'
        });
      }
    },
    
    // 打开设备详情
    openDevice(device) {
      // 根据设备类型跳转到不同页面
      switch(device.type) {
        case 'light':
          uni.navigateTo({
            url: `/pages/device-light/device-light?id=${device.id}`
          });
          break;
        case 'airconditioner':
          uni.navigateTo({
            url: `/pages/device-ac/device-ac?id=${device.id}`
          });
          break;
        case 'environment':
          uni.navigateTo({
            url: `/pages/device-environment/device-environment?id=${device.id}`
          });
          break;
        default:
          uni.navigateTo({
            url: `/pages/device-detail/device-detail?id=${device.id}&type=${device.type}`
          });
          break;
      }
    }
  }
};
</script>

<style scoped>
.container {
  background-color: #f8f9fa;
  min-height: 100vh;
  transition: all 0.3s ease;
}

.container.dark-theme {
  background-color: #000000;
}

.header {
  background-color: #fff;
  padding: 20rpx 40rpx;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 2rpx solid #f0f0f0;
}

.dark-theme .header {
  background-color: #1a1a1a;
  border-bottom-color: #333;
}

.location-tabs {
  display: flex;
  flex: 1;
}

.tab-item {
  margin-right: 40rpx;
  padding: 16rpx 0;
  position: relative;
}

.tab-item.active .tab-text {
  color: #007aff;
  font-weight: bold;
}

.tab-text {
  font-size: 32rpx;
  color: #333;
}

.dark-theme .tab-text {
  color: #fff;
}

.dark-theme .tab-item.active .tab-text {
  color: #007aff;
}

.header-actions {
  display: flex;
  align-items: center;
}

.add-btn {
  width: 64rpx;
  height: 64rpx;
  background-color: #007aff;
  border-radius: 32rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.add-icon {
  color: #fff;
  font-size: 40rpx;
  font-weight: bold;
}

.device-list {
  flex: 1;
  padding: 40rpx;
}

.device-grid {
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  width: 100%;
  padding: 0;
  margin: 0;
}

.device-card {
  width: calc(50% - 15rpx);
  background-color: #fff;
  border-radius: 16rpx;
  padding: 30rpx;
  position: relative;
  min-height: 180rpx;
  display: flex;
  flex-direction: column;
  box-shadow: 0 2rpx 12rpx rgba(0,0,0,0.1);
  transition: all 0.3s ease;
  margin-right: 15rpx;
  margin-bottom: 20rpx;
  box-sizing: border-box;
}

.device-card:nth-child(2n) {
  margin-right: 0;
}

.dark-theme .device-card {
  background-color: #1a1a1a;
  box-shadow: 0 2px 8px rgba(255,255,255,0.1);
}

.device-icon {
  margin-bottom: 20rpx;
}

.icon {
  font-size: 40rpx;
}

.device-info {
  flex: 1;
}

.device-name {
  display: block;
  font-size: 28rpx;
  font-weight: bold;
  color: #333;
  margin-bottom: 8rpx;
}

.dark-theme .device-name {
  color: #fff;
}

.device-status {
  display: block;
  font-size: 22rpx;
  color: #999;
  margin-bottom: 6rpx;
  line-height: 1.3;
}

.device-room {
  display: block;
  font-size: 22rpx;
  color: #666;
}

.dark-theme .device-room {
  color: #888;
}

.device-switch {
  position: absolute;
  top: 30rpx;
  right: 30rpx;
  width: 70rpx;
  height: 40rpx;
  background-color: #e5e5e5;
  border-radius: 20rpx;
  display: flex;
  align-items: center;
  padding: 3rpx;
  transition: all 0.3s ease;
}

.dark-theme .device-switch {
  background-color: #444;
}

.device-switch.on {
  background-color: #007aff;
}

.switch-circle {
  width: 34rpx;
  height: 34rpx;
  background-color: #fff;
  border-radius: 17rpx;
  transition: all 0.3s ease;
}

.device-switch.on .switch-circle {
  transform: translateX(30rpx);
}

.empty-state {
  text-align: center;
  padding: 120rpx 40rpx;
}

.empty-icon {
  font-size: 96rpx;
  display: block;
  margin-bottom: 40rpx;
}

.empty-text {
  font-size: 36rpx;
  color: #333;
  display: block;
  margin-bottom: 20rpx;
}

.dark-theme .empty-text {
  color: #fff;
}

.empty-desc {
  font-size: 28rpx;
  color: #999;
  display: block;
}

.dark-theme .empty-desc {
  color: #666;
}
</style>