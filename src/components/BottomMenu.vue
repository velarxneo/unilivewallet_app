<template>
  <view class="bottom-menu">
    <view class="menu-item" v-for="(item, index) in menuItems" :key="index" @tap="navigateTo(item.path)">
      <image :src="item.icon" class="menu-icon"></image>
      <text class="menu-text">{{ item.text }}</text>
    </view>
  </view>
</template>

<script>
export default {
  name: 'BottomMenu',
  data() {
    return {
      menuItems: [
        { text: '首页', icon: '/static/icons/home.png', path: '/pages/index/index' },
        { text: 'OTC', icon: '/static/icons/otc.png', path: '/pages/OTCTrading/OTCTrading' },
        { text: 'OG', icon: '/static/icons/og.png', path: '/pages/OG/OG' },
        { text: '任务', icon: '/static/icons/task.png', path: '/pages/Mission/Mission' },
        { text: '我的', icon: '/static/icons/profile.png', path: '/pages/Profile/Profile' },
      ]
    }
  },
  methods: {
    navigateTo(path) {
      uni.switchTab({
        url: path
      })
    }
  }
}
</script>

<style lang="scss">
@import "@/uni.scss";

.bottom-menu {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  display: flex;
  justify-content: space-around;
  align-items: center;
  height: 100rpx;
  background-color: $background-color;
  box-shadow: 0 -2rpx 10rpx rgba(0, 0, 0, 0.1);
}

.menu-item {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.menu-icon {
  width: 48rpx;
  height: 48rpx;
  margin-bottom: 4rpx;
}

.menu-text {
  font-size: $font-size-base;
  color: $text-color;
}
</style>
