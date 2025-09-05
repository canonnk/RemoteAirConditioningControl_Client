<!-- components/DeviceCard.vue (已修正) -->
<template>
	<!-- 
		【关键修复】: 添加 v-if="device" 
		这个指令会确保只有在 device prop 真实存在且不为 undefined 时，
		才会渲染卡片的内部内容，从而避免了读取 undefined 属性的错误。
	-->
	<view class="card" v-if="device" @click="navigateToSettings">
		<view class="card-content">
			<!-- 左侧图标 -->
			<view class="device-icon">
				<image :src="device.icon" style="width: 50px; height: 50px;"></image>
			</view>
			
			<view class="device-info">
				<view class="device-name">{{ device.name }}</view>
				<view class="device-status" :class="{'online': device.status === '在线'}">
					{{ device.status }}
				</view>
			</view>
			
			<view class="device-switch">
				<switch :checked="device.isOn" @change="onSwitchChange" color="#3c9cff" />
			</view>
		</view>
	</view>
</template>

<script>
	export default {
		name: "DeviceCard",
		props: {
			device: {
				type: Object,
				required: true
			}
		},
		methods: {
			onSwitchChange(e) {
				const isOn = e.detail.value;
				// 阻止卡片点击事件冒泡
				console.log(`${this.device.name} 的状态变为: ${isOn ? '开启' : '关闭'}`);
				this.$emit('switch-change', { id: this.device.id, isOn: isOn });
			},
			navigateToSettings() {
				uni.navigateTo({
					url: '/pages/device-settings/device-settings?id=' + this.device.id
				});
			}
		}
	}
</script>

<style scoped>
	.card {
		background-color: #fff;
		border-radius: 12px;
		padding: 20px;
		margin-bottom: 15px;
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
		transition: all 0.2s ease-in-out;
	}
	.card:active {
		transform: scale(0.98);
	}
	.card-content {
		display: flex;
		align-items: center;
		justify-content: space-between;
	}
	.device-icon {
		margin-right: 15px;
	}
	.device-info {
		flex-grow: 1;
	}
	.device-name {
		font-size: 16px;
		font-weight: bold;
		color: #333;
	}
	.device-status {
		font-size: 12px;
		color: #999;
		margin-top: 5px;
	}
	.device-status.online {
		color: #00c777;
	}
	.device-switch {
		transform: scale(0.8);
	}
</style>