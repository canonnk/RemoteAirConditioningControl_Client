<template>
	<view class="container" :class="{ 'dark-theme': isDarkMode }">
		<view class="header">
			<view class="avatar">
				<text class="avatar-text">{{ avatarText }}</text>
			</view>
			<view class="user-info">
				<text class="phone">{{ userInfo?.phone || '未登录' }}</text>
				<text class="login-time" v-if="userInfo?.lastLoginTime">
					最后登录：{{ formatTime(userInfo.lastLoginTime) }}
				</text>
			</view>
		</view>
		
		<view class="menu-list">
			<view class="menu-item" @click="showUserInfo">
				<text class="menu-title">个人信息</text>
				<text class="menu-arrow">></text>
			</view>
			<view class="menu-item" @click="showSettings">
				<text class="menu-title">设置</text>
				<text class="menu-arrow">></text>
			</view>
			<view class="menu-item" @click="showAbout">
				<text class="menu-title">关于我们</text>
				<text class="menu-arrow">></text>
			</view>
		</view>
		
		<view class="logout-section">
			<button @click="logout" class="logout-btn">退出登录</button>
		</view>
	</view>
</template>

<script>
import auth from '@/utils/auth.js';
import theme from '@/utils/theme.js';

export default {
	data() {
		return {
			userInfo: null,
			isDarkMode: false
		}
	},
	computed: {
		avatarText() {
			if (this.userInfo?.phone) {
				return this.userInfo.phone.slice(-2);
			}
			return '未';
		}
	},
	async onLoad() {
		// 检查页面访问权限
		const hasAccess = await auth.checkPageAccess();
		if (hasAccess) {
			this.userInfo = auth.getUserInfo();
		}
		
		// 初始化主题状态
		this.isDarkMode = theme.isDarkMode();
		
		// 监听主题变化
		uni.$on('themeChanged', this.onThemeChanged);
	},
	onShow() {
		// 每次显示页面时刷新用户信息
		if (auth.isLoggedIn()) {
			this.userInfo = auth.getUserInfo();
		}
		
		// 刷新主题状态
		this.isDarkMode = theme.isDarkMode();
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
		
		// 格式化时间
		formatTime(timestamp) {
			const date = new Date(timestamp);
			return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
		},
		
		// 显示个人信息
		showUserInfo() {
			if (!this.userInfo) return;
			
			uni.showModal({
				title: '个人信息',
				content: `手机号：${this.userInfo.phone}\n注册时间：${this.formatTime(this.userInfo.createTime)}\n最后登录：${this.formatTime(this.userInfo.lastLoginTime)}`,
				showCancel: false
			});
		},
		
		// 显示设置
		showSettings() {
			uni.navigateTo({
				url: '/pages/settings/settings'
			});
		},
		
		// 显示关于我们
		showAbout() {
			uni.showModal({
				title: '关于我们',
				content: '这是一个基于uni-app和uniCloud的手机登录示例应用',
				showCancel: false
			});
		},
		
		// 退出登录
		logout() {
			uni.showModal({
				title: '提示',
				content: '确定要退出登录吗？',
				success: (res) => {
					if (res.confirm) {
						auth.clearToken();
						uni.showToast({
							title: '已退出登录',
							icon: 'success'
						});
						setTimeout(() => {
							auth.redirectToLogin();
						}, 1500);
					}
				}
			});
		}
	}
}
</script>

<style scoped>
.container {
	background-color: #f8f9fa;
	min-height: 100vh;
	transition: all 0.3s ease;
}

.container.dark-theme {
	background-color: #1a1a1a;
}

.header {
	background-color: #fff;
	padding: 30px 20px;
	display: flex;
	align-items: center;
	border-bottom: 1px solid #f0f0f0;
}

.dark-theme .header {
	background-color: #2d2d2d;
	border-bottom-color: #404040;
}

.avatar {
	width: 60px;
	height: 60px;
	border-radius: 30px;
	background-color: #007aff;
	display: flex;
	align-items: center;
	justify-content: center;
	margin-right: 15px;
}

.avatar-text {
	color: #fff;
	font-size: 20px;
	font-weight: bold;
}

.user-info {
	flex: 1;
}

.phone {
	display: block;
	font-size: 18px;
	font-weight: bold;
	color: #333;
	margin-bottom: 5px;
}

.dark-theme .phone {
	color: #fff;
}

.login-time {
	display: block;
	font-size: 12px;
	color: #999;
}

.dark-theme .login-time {
	color: #888;
}

.menu-list {
	margin-top: 20px;
	background-color: #fff;
}

.dark-theme .menu-list {
	background-color: #2d2d2d;
}

.menu-item {
	padding: 15px 20px;
	border-bottom: 1px solid #f0f0f0;
	display: flex;
	justify-content: space-between;
	align-items: center;
}

.dark-theme .menu-item {
	border-bottom-color: #404040;
}

.menu-item:last-child {
	border-bottom: none;
}

.menu-title {
	font-size: 16px;
	color: #333;
}

.dark-theme .menu-title {
	color: #fff;
}

.menu-arrow {
	font-size: 16px;
	color: #ccc;
}

.dark-theme .menu-arrow {
	color: #666;
}

.logout-section {
	margin-top: 30px;
	padding: 0 20px;
}

.logout-btn {
	width: 100%;
	height: 50px;
	background-color: #ff4757;
	color: #fff;
	border: none;
	border-radius: 8px;
	font-size: 16px;
	font-weight: bold;
}
</style>
