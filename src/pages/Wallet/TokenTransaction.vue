<template>
  <view class="uni-container">
    <view class="header">
      <button @click="goBack" class="back-button">
        <uni-icons type="back" size="24"></uni-icons>
      </button>
      <text class="uni-title">{{ tokenSymbol }}</text>
    </view>
    
    <view class="token-balance">
      <text class="balance-amount">{{ tokenBalance }}</text>
    </view>
    
    <view class="transaction-list">
      <view v-for="(transaction, index) in transactions" :key="index" class="transaction-item">
        <view class="transaction-icon">
          <uni-icons :type="getTransactionIcon(transaction)" size="24" :color="getTransactionColor(transaction)"></uni-icons>
        </view>
        <view class="transaction-details">
          <text class="transaction-type">{{ getTransactionType(transaction) }}</text>
          <text class="transaction-date">{{ formatDate(transaction.timestamp) }}</text>
        </view>
        <text class="transaction-amount" :class="getAmountClass(transaction)">
          {{ getAmountPrefix(transaction) }}{{ transaction.amount.toFixed(4).padEnd(4, '0') }}
        </text>
      </view>
    </view>
    
    <view v-if="loading" class="loading-indicator">
      加载中...
    </view>
    
    <view v-if="noMoreData" class="end-of-list">
      没有更多数据了
    </view>
    
    <view class="footer">
      <button class="uni-btn" @click="handleTransfer">转账</button>
    </view>
  </view>
</template>

<script>
import { fetchTokenTransactions } from '@/services/userService';

export default {
  data() {
    return {
      userId: '',
      tokenSymbol: '',
      tokenBalance: '',
      transactions: [],
      page: 0,
      size: 10,
      loading: false,
      noMoreData: false,
      totalPages: 0
    };
  },
  onLoad(option) {
    this.userId = option.userId;
    this.tokenSymbol = option.tokenSymbol;
    this.tokenBalance = option.tokenBalance;
    this.fetchTransactions();
  },
  onReachBottom() {
    if (!this.loading && !this.noMoreData) {
      this.fetchTransactions();
    }
  },
  methods: {
    async fetchTransactions() {
      if (this.loading || this.noMoreData) return;
      
      this.loading = true;
      try {
        const response = await fetchTokenTransactions(this.userId, this.tokenSymbol, this.page, this.size);
        if (response.content.length === 0) {
          this.noMoreData = true;
        } else {
          this.transactions = [...this.transactions, ...response.content];
          this.page++;
          this.totalPages = response.totalPages;
          this.noMoreData = this.page >= this.totalPages;
        }
      } catch (error) {
        console.error('Error fetching token transactions:', error);
        uni.showToast({
          title: '加载交易记录失败',
          icon: 'none'
        });
      } finally {
        this.loading = false;
      }
    },
    formatDate(timestamp) {
      const date = new Date(timestamp);
      return date.toLocaleString();
    },
    getTransactionIcon(transaction) {
      switch (transaction.transactionCode.code) {
        case 'DEP':
          return 'arrow-down';
        case 'WDR':
          return 'arrow-up';
        case 'BAL_TRF':
          return 'loop';
        default:
          return 'info';
      }
    },
    getTransactionColor(transaction) {
      switch (transaction.transactionCode.code) {
        case 'DEP':
          return '#4CD964';
        case 'WDR':
          return '#FF3B30';
        case 'BAL_TRF':
          return '#007AFF';
        default:
          return '#999999';
      }
    },
    getTransactionType(transaction) {
      switch (transaction.transactionCode.code) {
        case 'DEP':
          return '存入';
        case 'WDR':
          return '转出';
        case 'BAL_TRF':
          return '余额转移';
        default:
          return transaction.transactionCode.transactionType;
      }
    },
    getAmountClass(transaction) {
      switch (transaction.transactionCode.code) {
        case 'DEP':
          return 'amount-positive';
        case 'WDR':
          return 'amount-negative';
        default:
          return '';
      }
    },
    getAmountPrefix(transaction) {
      switch (transaction.transactionCode.code) {
        case 'DEP':
          return '+';
        case 'WDR':
          return '-';
        default:
          return '';
      }
    },
    goBack() {
      uni.navigateBack();
    },
    handleTransfer() {
      uni.navigateTo({
        url: `/pages/Wallet/Transfer?tokenSymbol=${this.tokenSymbol}`
      });
    }
  }
};
</script>

<style lang="scss" scoped>
.uni-container {
  padding: 20px;
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

.token-balance {
  text-align: center;
  margin-bottom: 20px;
}

.balance-amount {
  font-size: 36px;
  font-weight: bold;
}

.transaction-list {
  margin-bottom: 20px;
}

.transaction-item {
  display: flex;
  align-items: center;
  padding: 15px 0;
  border-bottom: 1px solid $uni-border-color;

  &:last-child {
    border-bottom: none;
  }
}

.transaction-icon {
  margin-right: 15px;
}

.transaction-details {
  flex: 1;
}

.transaction-type {
  font-size: 16px;
  font-weight: bold;
}

.transaction-date {
  font-size: 12px;
  color: $uni-text-color-grey;
}

.transaction-amount {
  font-size: 16px;
  font-weight: bold;

  &.amount-positive {
    color: #4CD964;
  }

  &.amount-negative {
    color: #FF3B30;
  }
}

.footer {
  position: fixed;
  bottom: 20px;
  left: 20px;
  right: 20px;
}

.uni-btn {
  width: 100%;
  height: 44px;
  line-height: 44px;
  background-color: $uni-color-primary;
  color: #fff;
  border: none;
  border-radius: 22px;
  font-size: 16px;
}

.loading-indicator,
.end-of-list {
  text-align: center;
  padding: 10px;
  color: $uni-text-color-grey;
}
</style>
