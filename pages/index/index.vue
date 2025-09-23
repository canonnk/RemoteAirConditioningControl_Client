<template>
	<view class="container" :class="{ 'dark-theme': isDarkMode }">
		<!-- 用户信息显示 -->
		<view class="user-info" v-if="userInfo">
			<text class="welcome">欢迎回来！</text>
			<text class="phone">手机号：{{ userInfo.phone }}</text>
			<button @click="logout" class="logout-btn">退出登录</button>
		</view>
		
		<!-- 主题切换快捷按钮 -->
		<view class="theme-toggle">
			<button @click="toggleTheme" class="theme-btn">
				{{ isDarkMode ? '🌞 切换到浅色模式' : '🌙 切换到深色模式' }}
			</button>
		</view>
		
		<view class="intro">本项目已包含uni ui组件，无需import和注册，可直接使用。在代码区键入字母u，即可通过代码助手列出所有可用组件。光标置于组件名称处按F1，即可查看组件文档。</view>
		<text class="intro">详见：</text>
		<uni-link :href="href" :text="href"></uni-link>
	</view>
</template>

<script>
import auth from '@/utils/auth.js';
import theme from '@/utils/theme.js';

export default {
	data() {
		return {
			href: 'https://uniapp.dcloud.io/component/README?id=uniui',
			userInfo: null,
			isDarkMode: false
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
	onUnload() {
		// 移除主题变化监听
		uni.$off('themeChanged', this.onThemeChanged);
	},
	methods: {
		// 主题变化回调
		onThemeChanged(isDark) {
			this.isDarkMode = isDark;
		},
		
		// 切换主题
		toggleTheme() {
			const newTheme = theme.toggleTheme();
			this.isDarkMode = newTheme === 'dark';
			
			uni.showToast({
				title: this.isDarkMode ? '已切换到深色模式' : '已切换到浅色模式',
				icon: 'success'
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

<style>
	.container {
		padding: 20px;
		font-size: 14px;
		line-height: 24px;
		background-color: #f8f9fa;
		min-height: 100vh;
		transition: all 0.3s ease;
	}
	
	.container.dark-theme {
		background-color: #1a1a1a;
		color: #fff;
	}
	
	.user-info {
		background-color: #fff;
		padding: 20px;
		margin-bottom: 20px;
		border-radius: 8px;
		box-shadow: 0 2px 4px rgba(0,0,0,0.1);
	}
	
	.dark-theme .user-info {
		background-color: #2d2d2d;
		box-shadow: 0 2px 4px rgba(255,255,255,0.1);
	}
	
	.welcome {
		display: block;
		font-size: 18px;
		font-weight: bold;
		color: #333;
		margin-bottom: 10px;
	}
	
	.dark-theme .welcome {
		color: #fff;
	}
	
	.phone {
		display: block;
		font-size: 14px;
		color: #666;
		margin-bottom: 15px;
	}
	
	.dark-theme .phone {
		color: #ccc;
	}
	
	.logout-btn {
		background-color: #ff4757;
		color: #fff;
		border: none;
		padding: 8px 16px;
		border-radius: 4px;
		font-size: 14px;
	}
	
	.theme-toggle {
		margin-bottom: 20px;
	}
	
	.theme-btn {
		background-color: #007aff;
		color: #fff;
		border: none;
		padding: 10px 20px;
		border-radius: 6px;
		font-size: 14px;
		width: 100%;
	}
	
	.dark-theme .theme-btn {
		background-color: #0056b3;
	}
	
	.intro {
		color: #333;
	}
	
	.dark-theme .intro {
		color: #ccc;
	}
</style>
