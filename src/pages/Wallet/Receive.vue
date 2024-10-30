<template>
  <view class="uni-container">
    <view class="header">
      <button class="back-button" @click="goBack"><uni-icons type="back" size="25"></uni-icons></button>
      <text class="uni-title">收款</text>
    </view>
    
    <view class="section">
        <view class="input-wrapper">
            <text>网络</text>
            <text>BSC/BEP20</text>
        </view>
    </view>

    <view class="section">
      <text class="input-label">钱包地址</text>
      <view class="input-wrapper">
        <text class="address">{{ userAddress }}</text>
        <button class="copy-button" @click="copyAddress">
        <img :src="isCopied ? '/static/check-icon.png' : '/static/copy-icon.png'" class="copy-icon" />
      </button>
      </view>
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
        <text class="instruction-item">复制钱包地址进行充值</text>
        <text class="instruction-item">请选择与币种平台一致的网络</text>
        <text class="instruction-item">当您充值该种时，仅限于通过下方钱包支持的网络充值</text>
        <text class="instruction-item">通过其他网络充值造成的资金丢失，如网络错误等，资金无法找回</text>
        <text class="instruction-item">仅支持币安智能链（BSC/BEP20）</text>
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
      userAddress: '',
      isCopied: false
    };
  },
  onLoad(option) {
    if (option.address) {
      this.userAddress = option.address;
    } else {
      uni.showToast({
        title: '未获取到钱包地址',
        icon: 'none'
      });
      setTimeout(() => {
        uni.navigateBack();
      }, 1500);
    }
  },
  methods: {
    goBack() {
      history.back();
    },
    copyAddress() {
      uni.setClipboardData({
        data: this.userAddress,
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
    }
  }
};
</script>
