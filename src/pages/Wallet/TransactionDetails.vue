<template>
  <view class="uni-container">
    <view class="header">
      <button class="back-button" @click="goBack"><uni-icons type="back" size="25"></uni-icons></button>
      <text class="uni-title">订单详情</text>
    </view>

    <view v-if="transaction" class="transaction-status">
      <view class="status-icon">
        <uni-icons type="checkmarkempty" size="40" color="#FF6B35"></uni-icons>
      </view>
      <text class="status-text">交易成功</text>
      <text class="transaction-amount">{{ getDisplayAmount(transaction) }} {{ tokenSymbol }}</text>
    </view>

    <view v-if="transaction" class="transaction-details">
      <view class="detail-item">
        <text class="detail-label">发送方</text>
        <text class="detail-value">{{ transaction.senderAddress }}</text>
      </view>
      <view class="detail-item">
        <text class="detail-label">接收方</text>
        <text class="detail-value">{{ transaction.receiverAddress }}</text>
      </view>
      <view class="detail-item">
        <text class="detail-label">手续费</text>
        <text class="detail-value">{{ transaction.feeQty }} {{ tokenSymbol }}</text>
      </view>
      <view class="detail-item">
        <text class="detail-label">交易哈希</text>
        <text class="detail-value">{{ transaction.transactionHash }}</text>
      </view>
      <view class="detail-item">
        <text class="detail-label">交易时间</text>
        <text class="detail-value">{{ formatDate(transaction.timestamp) }}</text>
      </view>
    </view>

  
  </view>
</template>

<script>
export default {
  data() {
    return {
      tokenSymbol: '',
      transaction: null,
      userId: ''
    };
  },
  onLoad(option) {
    this.tokenSymbol = option.tokenSymbol;
    this.transaction = JSON.parse(decodeURIComponent(option.transactionDetails));
    this.userId = localStorage.getItem('userId');
  },
  methods: {
    formatDate(timestamp) {
      const date = new Date(timestamp);
      return date.toLocaleString();
    },
    goBack() {
      history.back();
    },
    getDisplayAmount(transaction) {
      if (transaction.senderUserId === this.userId) {
        // For send transactions, display amount + fee
        return (parseFloat(transaction.amount) + parseFloat(transaction.feeQty)).toFixed(4);
      } else {
        // For receive transactions, display just the amount
        return parseFloat(transaction.amount).toFixed(4);
      }
    },
    openReceivePage() {
      uni.navigateTo({
        url: `/pages/Wallet/Receive?tokenSymbol=${this.tokenSymbol}`
      });
    }
  }
};
</script>

<style lang="scss" scoped>
.uni-container {
  padding: 20px;
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

.header {
  display: flex;
  align-items: center;
  margin-bottom: 20px;
}

.back-button {
  background: none;
  border: none;
  padding: 0;
  margin-right: 10px;
}

.uni-title {
  font-size: 18px;
  font-weight: bold;
}

.transaction-status {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 30px;
}

.status-icon {
  margin-bottom: 10px;
}

.status-text {
  font-size: 18px;
  font-weight: bold;
  margin-bottom: 10px;
}

.transaction-amount {
  font-size: 24px;
  font-weight: bold;
  color: #FF6B35;
}

.transaction-details {
  background-color: #fff;
  border-radius: 10px;
  padding: 20px;
  flex-grow: 1;
}

.detail-item {
  display: flex;
  flex-direction: column;
  margin-bottom: 15px;
}

.detail-label {
  font-size: 14px;
  color: #999;
  margin-bottom: 5px;
}

.detail-value {
  font-size: 16px;
  color: #333;
  word-break: break-all;
}


.uni-btn {
  width: 100%;
  height: 44px;
  line-height: 44px;
  background-color: #FF6B35;
  color: #fff;
  border: none;
  border-radius: 22px;
  font-size: 16px;
  text-align: center;
}
</style>
