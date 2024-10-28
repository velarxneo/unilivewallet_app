<template>
  <view class="uni-container">
    <view class="header">
      <button @click="goBack" class="back-button">

      </button>
      <text class="uni-title">我的</text>
    </view>
    
    <view class="user-info">
      <image class="avatar" src="/static/images/default-avatar.png" mode="aspectFill"></image>
      <view class="user-details">
        <text class="username">{{ userId }}</text>
        <view class="user-level">
          <uni-icons type="medal" size="16" color="#FFD700"></uni-icons>
          <text class="level-text">创世OG</text>
        </view>
      </view>
    </view>
    
    <view class="wallet-card">
      <view class="wallet-header">
        <text class="wallet-title">钱包总资产 (USDT)</text>
        <text class="wallet-network">网络: BSC/BEP20</text>
      </view>
      <text class="wallet-balance">{{ parseFloat(usdtWalletBalance).toFixed(4) }}</text>
      <text class="wallet-address">钱包地址: {{ truncatedAddress }}</text>
    </view>
    
    <view class="quick-actions">
      <view class="action-item" @click="handleAction('send')">
        <uni-icons type="redo-filled" size="24" color="#333"></uni-icons>
        <text>转账</text>
      </view>
      <view class="action-item" @click="handleAction('receive')">
        <uni-icons type="download-filled" size="24" color="#333"></uni-icons>
        <text>收款</text>
      </view>
      <view class="action-item" @click="handleAction('exchange')">
        <uni-icons type="loop" size="24" color="#333"></uni-icons>
        <text>划转</text>
      </view>
      <view class="action-item" @click="navigateToConvert">
        <uni-icons type="refresh" size="30"></uni-icons>
        <text>兑换</text>
      </view>
    </view>
    
    <view class="asset-list">
      <view v-for="balance in balances" :key="balance.tokenSymbol" class="asset-item" @click="showTokenDetails(balance)">
        <uni-icons :type="balance.tokenSymbol === 'USDT' ? 'wallet' : 'wallet'" :size="24" :color="balance.tokenSymbol === 'USDT' ? '#4CD964' : '#007AFF'"></uni-icons>
        <text class="asset-name">{{ balance.tokenSymbol }}</text>
        <view class="asset-details">
          <view class="asset-row">
            <text class="asset-label">冻结</text>
            <text class="asset-value">{{ parseFloat(balance.lockedWalletBalance).toFixed(4) }}</text>
          </view>
          <view class="asset-row">
            <text class="asset-label">可用</text>
            <text class="asset-value">{{ (parseFloat(balance.walletBalance) - parseFloat(balance.lockedWalletBalance)).toFixed(4) }}</text>
          </view>
        </view>
        <uni-icons type="right" size="16" color="#999"></uni-icons>
      </view>
    </view>
    
    <!-- <view class="action-list">
      <view class="action-item" @click="navigateTo('/pages/OTCTrading/OTCHistory')">
        <text class="action-text">问题工单</text>
        <uni-icons type="right" size="16" color="#999"></uni-icons>
      </view>
    </view> -->
    
    <BottomMenu />
  </view>
</template>

<script>
import BottomMenu from '@/components/BottomMenu.vue';
import { fetchUserBalancesWithDetails } from '@/services/userService';

export default {
  name: 'Profile',
  components: {
    BottomMenu
  },
  data() {
    return {
      userId: '',
      address: '',
      balances: [],
      usdtWalletBalance: '0',
      truncatedAddress: ''
    };
  },
  mounted() {
    this.fetchUserData();
  },
  methods: {
    navigateTo(url) {
      uni.navigateTo({ url });
    },
    async fetchUserData() {
      try {
        const userId = localStorage.getItem('userId');
        if (!userId) {
          console.error('User ID not found in localStorage');
          // Handle the case when user is not logged in
          return;
        }
        const userData = await fetchUserBalancesWithDetails(userId);
        this.userId = userData.userId;
        this.address = userData.address;
        this.balances = userData.balances;
        this.usdtWalletBalance = userData.usdtWalletBalance;
        this.truncatedAddress = this.truncateAddress(userData.address);
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    },
    truncateAddress(address) {
      if (address.length > 15) {
        return `${address.slice(0, 8)}...${address.slice(-8)}`;
      }
      return address;
    },
    handleAction(action) {
      switch (action) {
        case 'send':
          console.log('Send action clicked');
          uni.navigateTo({
            url: '/pages/Wallet/Send',
            success: function() {
              console.log('Navigation to Send page successful');
            },
            fail: function(error) {
              console.error('Navigation to Send page failed:', error);
              uni.showToast({
                title: 'Failed to open Send page',
                icon: 'none'
              });
            }
          });
          break;
        case 'receive':
          console.log('Receive action clicked');
          uni.navigateTo({
            url: '/pages/Wallet/Receive',
            success: function() {
              console.log('Navigation to Receive page successful');
            },
            fail: function(error) {
              console.error('Navigation to Receive page failed:', error);
              uni.showToast({
                title: 'Failed to open Receive page',
                icon: 'none'
              });
            }
          });
          break;
        case 'exchange':
          console.log('Exchange action clicked');
          // Implement exchange logic or navigation
          break;
        case 'convert':
          console.log('Convert action clicked');
          // Implement convert logic or navigation
          break;
      }
    },
    showTokenDetails(balance) {
      uni.navigateTo({
        url: `/pages/Wallet/TokenTransaction?tokenSymbol=${balance.tokenSymbol}&tokenBalance=${balance.walletBalance}`,
        success: function() {
          console.log('Navigation to TokenTransaction page successful');
        },
        fail: function(error) {
          console.error('Navigation to TokenTransaction page failed:', error);
          uni.showToast({
            title: 'Failed to open TokenTransaction page',
            icon: 'none'
          });
        }
      });
    },
    navigateToConvert() {
      uni.navigateTo({
        url: '/pages/Wallet/Convert'
      });
    }
  }
};
</script>

