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
        
      </view>
      <view class="wallet-container">
        <text class="wallet-balance">{{ parseFloat(usdtWalletBalance).toFixed(4) }}</text>
        <button class="refresh-button" @click="refreshBalance">
          <image src="/static/refresh-icon.png" :class="{'rotating': isRefreshing}" class="refresh-icon"></image>
        </button>
      </view>
      <view class="wallet-address-container">
        <text class="wallet-network">网络: BSC/BEP20</text>
        <view class="wallet-container">
          <text class="wallet-network">钱包地址: {{ truncatedAddress }}</text>
          <button class="refresh-button" @click="copyAddress">
            <image :src="isCopied ? '/static/check-icon.png' : '/static/copy-icon.png'" class="refresh-icon"></image>
          </button>
        </view> 
      </view>
    </view>
    
    <view class="quick-actions">
      <view class="action-item" @click="handleAction('send')">
        <uni-icons type="redo-filled"></uni-icons>
        <text>转账</text>
      </view>
      <view class="action-item" @click="handleAction('receive')">
        <uni-icons type="download-filled"></uni-icons>
        <text>收款</text>
      </view>
      <view class="action-item" @click="handleAction('transfer')">
        <uni-icons type="loop"></uni-icons>
        <text>划转</text>
      </view>
      <view class="action-item" @click="handleAction('convert')">
        <uni-icons type="refresh"></uni-icons>
        <text>闪兑</text>
      </view>
    </view>
    
    
      <view v-for="balance in balances" :key="balance.tokenSymbol" class="asset-item" @click="showTokenDetails(balance)">
        <view class="asset-item-header">
          <view style="display: flex; align-items: left;">
            <image :src="`/static/images/tokens/${balance.tokenSymbol}.png`" :alt="balance.tokenSymbol" class="token-icon" style="width: 40px; height: 40px;"></image>
            <text class="asset-name">{{ balance.tokenSymbol }}</text>
          </view>
          <uni-icons type="right" size="16" color="#999" style="margin-left: 10px;"></uni-icons>
        </view>
     
        <view class="asset-item-details">
          <view class="asset-details">
            <text class="asset-label">冻结</text>
            <text class="asset-value">{{ parseFloat(balance.lockedWalletBalance).toFixed(4) }}</text>
          </view>
          <view class="asset-details" style="flex: 1;">
            <text class="asset-label">可用</text>
            <text class="asset-value">{{ (parseFloat(balance.walletBalance) - parseFloat(balance.lockedWalletBalance)).toFixed(4) }}</text>
          </view>
          <view class="asset-details" style="flex: 1;">
            <template v-if="balance.tokenSymbol === 'SEE'">
              <text class="asset-label">≈USDT</text>
              <text class="asset-value">0.000</text>
            </template>
          </view>
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
import { fetchUserBalancesWithDetails, checkWalletDeposits } from '@/services/userService';

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
      truncatedAddress: '',
      isCopied: false,
      isRefreshing: false
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
          if (!this.address) {
            uni.showToast({
              title: '钱包地址未获取',
              icon: 'none'
            });
            return;
          }
          uni.navigateTo({
            url: `/pages/Wallet/Receive?address=${this.address}`,
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
        case 'transfer':
        uni.navigateTo({
            url: '/pages/Wallet/Transfer',
            success: function() {
              console.log('Navigation to Transfer page successful');
            },
            fail: function(error) {
              console.error('Navigation to Transfer page failed:', error);
              uni.showToast({
                title: 'Failed to open Transfer page',
                icon: 'none'
              });
            }
          });
          break;
        case 'convert':
          uni.navigateTo({
            url: '/pages/Wallet/Convert',
            success: function() {
              console.log('Navigation to Convert page successful');
            },
            fail: function(error) {
              console.error('Navigation to Convert page failed:', error);
              uni.showToast({
                title: 'Failed to open Convert page',
                icon: 'none'
              });
            }
          });
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
    },
    copyAddress() {
      if (!this.address) {
        uni.showToast({
          title: '钱包地址未获取',
          icon: 'none'
        });
        return;
      }
      
      uni.setClipboardData({
        data: this.address,
        success: () => {
          this.isCopied = true;
          uni.showToast({
            title: '地址已复制',
            icon: 'success'
          });
          
          setTimeout(() => {
            this.isCopied = false;
          }, 3000);
        }
      });
    },
    async refreshBalance() {
      try {
        this.isRefreshing = true;
        const userId = localStorage.getItem('userId');
        if (!userId) {
          uni.showToast({
            title: '请先登录',
            icon: 'none'
          });
          return;
        }
        
        const result = await checkWalletDeposits(userId);
        // After checking deposits, refresh the balance display
        await this.fetchUserData();
        
        uni.showToast({
          title: result.message || '余额已更新',
          icon: 'success'
        });
      } catch (error) {
        console.error('Error refreshing balance:', error);
        uni.showToast({
          title: '更新失败',
          icon: 'none'
        });
      } finally {
        this.isRefreshing = false;
      }
    }
  }
};
</script>
