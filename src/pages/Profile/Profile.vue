<template>
  <view class="uni-container">
    <view class="header">
      <view class="back-button-placeholder"></view>
      <text class="uni-title">我的</text>
      <view class="settings-icon">
        <!-- <uni-icons type="gear" size="24" color="#fff"></uni-icons> -->
      </view>
    </view>
    
    <view class="user-info">
      <image class="avatar" src="/static/images/default-avatar.png" mode="aspectFill"></image>
      <view class="user-details">
        <text class="username">Jason</text>
        <view class="user-level">
          <uni-icons type="medal" size="16" color="#FFD700"></uni-icons>
          <text class="level-text">创世OG</text>
        </view>
      </view>
    </view>
    
    <view class="wallet-card">
      <view class="wallet-header">
        <text class="wallet-title">钱包总资产 (USDT)</text>
        <text class="wallet-address">网络: BSC/BEP20</text>
      </view>
      <text class="wallet-balance">102.016</text>
      <text class="wallet-address">钱包地址: 0xCB853E7A...GCsc5AD0267</text>
    </view>
    
    <view class="asset-list">
      <view class="asset-item">
        <uni-icons type="wallet" size="24" color="#4CD964"></uni-icons>
        <text class="asset-name">USDT</text>
        <view class="asset-details">
          <text class="asset-label">冻结</text>
          <text class="asset-value">0.000</text>
        </view>
        <view class="asset-details">
          <text class="asset-label">可用</text>
          <text class="asset-value">0.000</text>
        </view>
      </view>
      <view class="asset-item">
        <uni-icons type="wallet" size="24" color="#007AFF"></uni-icons>
        <text class="asset-name">SEE</text>
        <view class="asset-details">
          <text class="asset-label">冻结</text>
          <text class="asset-value">0.000</text>
        </view>
        <view class="asset-details">
          <text class="asset-label">可用</text>
          <text class="asset-value">0.000</text>
        </view>
        <text class="asset-usd-value">≈USDT 0.000</text>
      </view>
    </view>
    
    <view class="action-list">
      <view class="action-item" @click="navigateTo('/pages/OTCTrading/OTCHistory')">
        <text class="action-text">问题工单</text>
        <uni-icons type="forward" size="16" color="#999"></uni-icons>
      </view>
    </view>
    
    <BottomMenu />
  </view>
</template>

<script>
import BottomMenu from '@/components/BottomMenu.vue';

export default {
  name: 'Profile',
  components: {
    BottomMenu
  },
  methods: {
    navigateTo(url) {
      uni.navigateTo({ url });
    }
  }
}
</script>

<style lang="scss">
@import "../../uni.scss";

.profile-container {
  padding: 20px;
  background-color: $background-color;
  min-height: 100vh;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.title {
  font-size: $font-size-xxl;
  font-weight: bold;
  color: #fff;
}

.user-info {
  display: flex;
  align-items: center;
  margin-bottom: 20px;
}

.avatar {
  width: 60px;
  height: 60px;
  border-radius: 30px;
  margin-right: 15px;
}

.user-details {
  display: flex;
  flex-direction: column;
}

.username {
  font-size: $font-size-lg;
  font-weight: bold;
  color: #fff;
  margin-bottom: 5px;
}

.user-level {
  display: flex;
  align-items: center;
}

.level-text {
  font-size: $font-size-sm;
  color: #FFD700;
  margin-left: 5px;
}

.wallet-card {
  background-color: #fff;
  border-radius: 10px;
  padding: 15px;
  margin-bottom: 20px;
}

.wallet-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 10px;
}

.wallet-title {
  font-size: $font-size-base;
  color: $text-color;
}

.wallet-balance {
  font-size: $font-size-xxl;
  font-weight: bold;
  color: $text-color;
  margin-bottom: 10px;
}

.wallet-address {
  font-size: $font-size-xs;
  color: $light-text-color;
}

.asset-list {
  margin-bottom: 20px;
}

.asset-item {
  display: flex;
  align-items: center;
  background-color: #fff;
  border-radius: 10px;
  padding: 15px;
  margin-bottom: 10px;
}

.asset-name {
  font-size: $font-size-base;
  font-weight: bold;
  color: $text-color;
  margin-left: 10px;
  flex: 1;
}

.asset-details {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  margin-left: 10px;
}

.asset-label {
  font-size: $font-size-xs;
  color: $light-text-color;
}

.asset-value {
  font-size: $font-size-sm;
  color: $text-color;
}

.asset-usd-value {
  font-size: $font-size-xs;
  color: $light-text-color;
  margin-left: 10px;
}

.action-list {
  background-color: #fff;
  border-radius: 10px;
}

.action-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px;
  border-bottom: 1px solid $uni-border-color;

  &:last-child {
    border-bottom: none;
  }
}

.action-text {
  font-size: $font-size-base;
  color: $text-color;
}
</style>
