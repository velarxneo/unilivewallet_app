<template>
  <view class="uni-container">
    <view class="header">
      <button class="back-button" @click="goBack"><uni-icons type="back" size="25"></uni-icons></button>
      <text class="uni-title">收款</text>
    </view>
    
    <view class="network-info">
      <text class="network-label">网络</text>
      <text class="network-value">BSC/BEP20</text>
    </view>

    <view class="wallet-address">
      <text class="address">{{ userAddress }}</text>
      <button class="copy-button" @click="copyAddress">
        <uni-icons type="copy" size="20" color="#007AFF"></uni-icons>
      </button>
    </view>

    <view class="qr-code">
      <qrcode :text="userAddress" :size="200"></qrcode>
    </view>

    <view class="instructions">
      <view class="instruction-header">
        <uni-icons type="info" size="20" color="#FF6B35"></uni-icons>
        <text class="instruction-title">收款说明</text>
      </view>
      <view class="info">
        <text class="instruction-item">该地址仅支持BSC链上资产</text>
        <text class="instruction-item">请使用与当前网络相符的钱包进行转账</text>
        <text class="instruction-item">仅支持BSC/BEP20网络上的代币转账，其他网络的转账可能导致资产丢失</text>
      </view>
    </view>
  </view>
</template>

<script>
import QrcodeVue from 'vue-qrcode-component'

export default {
  components: {
    qrcode: QrcodeVue
  },
  data() {
    return {
      tokenSymbol: '',
      userAddress: '0xCBB53E7A12a7AF9D9E9C7C6C9D909E944b03C'
    };
  },
  onLoad(option) {
    this.tokenSymbol = option.tokenSymbol;
    // Fetch user address here
  },
  methods: {
    goBack() {
      history.back();
    },
    copyAddress() {
      uni.setClipboardData({
        data: this.userAddress,
        success: () => {
          uni.showToast({
            title: '地址已复制',
            icon: 'success'
          });
        }
      });
    }
  }
};
</script>

<style lang="scss" scoped>


.network-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: #fff;
  padding: 15px;
  border-radius: 10px;
  margin-bottom: 20px;
}

.network-label {
  color: #999;
}

.network-value {
  font-weight: bold;
}

.wallet-address {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: #fff;
  padding: 15px;
  border-radius: 10px;
  margin-bottom: 20px;
}

.address {
  font-size: 14px;
  color: #333;
  word-break: break-all;
  flex: 1;
  margin-right: 10px;
}

.copy-button {
  background: none;
  border: none;
  padding: 5px;
}

</style>
