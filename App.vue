<script>
import auth from '@/utils/auth.js';
import theme from '@/utils/theme.js';

export default {
	onLaunch: function() {
		console.warn('当前组件仅支持 uni_modules 目录结构 ，请升级 HBuilderX 到 3.1.0 版本以上！')
		console.log('App Launch')
		
		// 初始化uniCloud
		this.initUniCloud();
		
		// 初始化主题系统
		this.initTheme();
	},
	onShow: function() {
		console.log('App Show')
		
		// 每次应用显示时检查登录状态
		this.checkLoginStatus();
		
		// 确保主题样式正确应用（包括tabbar）
		theme.applyTheme(theme.getCurrentTheme());
	},
	onHide: function() {
		console.log('App Hide')
	},
	methods: {
		// 初始化uniCloud
		initUniCloud() {
			// 这里可以添加uniCloud的初始化配置
		},
		
		// 初始化主题系统
		initTheme() {
			theme.initTheme();
		},
		
		// 检查登录状态
		async checkLoginStatus() {
			// 获取当前页面
			const pages = getCurrentPages();
			if (pages.length === 0) return;
			
			const currentPage = pages[pages.length - 1];
			const currentRoute = currentPage.route;
			
			// 登录页面不需要检查
			if (currentRoute === 'pages/login/login') {
				return;
			}
			
			// 检查是否需要登录
			if (!auth.isLoggedIn()) {
				auth.redirectToLogin();
				return;
			}
			
			// 验证token有效性
			const isValid = await auth.validateToken();
			if (!isValid) {
				uni.showModal({
					title: '提示',
					content: '登录已过期，请重新登录',
					showCancel: false,
					success: () => {
						auth.redirectToLogin();
					}
				});
			}
		}
	}
}
</script>

<style lang="scss">
	/*每个页面公共css */
	@import '@/uni_modules/uni-scss/index.scss';
	/* #ifndef APP-NVUE */
	@import '@/static/customicons.css';
	// 设置整个项目的背景色
	page {
		background-color: #f5f5f5;
	}

	/* #endif */
	.example-info {
		font-size: 14px;
		color: #333;
		padding: 10px;
	}
</style>