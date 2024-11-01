<template>
  <view class="uni-container">
    <view class="header">
      <button class="back-button" @click="goBack"><uni-icons type="back" size="25"></uni-icons></button>
      <text class="uni-title">{{ tokenSymbol }}</text>
    </view>

    <view class="wallet-card" style="display: flex; flex-direction: column; align-items: center;">
      
        <text class="wallet-title">{{ tokenSymbol }}</text>

      <text class="wallet-balance">{{ tokenBalance }}</text>
    </view>
    <view v-for="(transaction, index) in transactions" :key="index">
      <!-- Deposit transaction -->
      <view v-if="transaction.transactionCode.code === 'DEP'" class="section-column" @click="showTransactionDetails(transaction)">
        <view class="transaction-icon receive">
          <uni-icons type="arrow-down" size="20" color="#fff"></uni-icons>
        </view>
        <view class="transaction-details">
          <text class="transaction-address">存款</text>
          <view class="transaction-date-container">
            <text class="transaction-date">{{ formatDate(transaction.timestamp) }}</text>
          </view>
        </view>
        <view class="transaction-amount-container">
          <text class="transaction-amount amount-positive">
            +{{ parseFloat(transaction.amount).toFixed(4) }} {{ tokenSymbol }}
          </text>
        </view>
      </view>
      
      <!-- Send by User ID transaction -->
      <view v-else-if="transaction.transactionCode.code === 'SND_UID'" class="section-column" @click="showTransactionDetails(transaction)">
        <view class="transaction-icon send">
          <uni-icons type="arrow-up" size="20" color="#fff"></uni-icons>
        </view>
        <view class="transaction-details">
          <text class="transaction-address">转到UID {{ transaction.receiverUserId }}</text>
          <view class="transaction-date-container">
            <text class="transaction-date">{{ formatDate(transaction.timestamp) }}</text>
          </view>
        </view>
        <view class="transaction-amount-container">
          <text class="transaction-amount amount-negative">
            -{{ parseFloat(transaction.amount).toFixed(4) }} {{ tokenSymbol }}
          </text>
          <text class="transaction-fee">
            Fee: {{ transaction.feeQty }} {{ tokenSymbol }}
          </text>
        </view>
      </view>

      <!-- Send by Address transaction -->
      <view v-else-if="transaction.transactionCode.code === 'SND_ADR'" class="section-column" @click="showTransactionDetails(transaction)">
        <view class="transaction-icon send">
          <uni-icons type="arrow-up" size="20" color="#fff"></uni-icons>
        </view>
        <view class="transaction-details">
          <text class="transaction-address">转到地址 {{ transaction.receiverAddress.slice(0, 6) }}...{{ transaction.receiverAddress.slice(-4) }}</text>
          <view class="transaction-date-container">
            <text class="transaction-date">{{ formatDate(transaction.timestamp) }}</text>
          </view>
        </view>
        <view class="transaction-amount-container">
          <text class="transaction-amount amount-negative">
            -{{ parseFloat(transaction.amount).toFixed(4) }} {{ tokenSymbol }}
          </text>
          <text class="transaction-fee">
            Fee: {{ transaction.feeQty }} {{ tokenSymbol }}
          </text>
        </view>
      </view>

      <!-- Balance Transfer transaction -->
      <view v-else-if="transaction.transactionCode.code === 'BAL_TRF'" class="section-column" @click="showTransactionDetails(transaction)">
        <view class="transaction-icon transfer">
          <uni-icons type="loop" size="20" color="#fff"></uni-icons>
        </view>
        <view class="transaction-details">
          <text class="transaction-address">划转</text>
          <view class="transaction-date-container">
            <text class="transaction-date">{{ formatDate(transaction.timestamp) }}</text>
          </view>
        </view>
        <view class="transaction-amount-container">
          <text class="transaction-amount" :class="transaction.senderUserId === userId ? 'amount-negative' : 'amount-positive'">
            {{ transaction.senderUserId === userId ? '-' : '+' }}{{ parseFloat(transaction.amount).toFixed(4) }} {{ tokenSymbol }}
          </text>
          <text class="transaction-fee" v-if="transaction.feeQty">
            Fee: {{ transaction.feeQty }} {{ tokenSymbol }}
          </text>
        </view>
      </view>
      

      <!-- Same User ID for Sender and Receiver -->
      <view v-else-if="transaction.senderUserId === transaction.receiverUserId" class="section-column" @click="showTransactionDetails(transaction)">
        <view class="transaction-icon transfer">
          <uni-icons type="loop" size="20" color="#fff"></uni-icons>
        </view>
        <view class="transaction-details">
          <text class="transaction-address">{{ transaction.transactionCode.code === 'BAL_UNL' ? '解冻' : '内部转账' }}</text>
          <view class="transaction-date-container">
            <text class="transaction-date">{{ formatDate(transaction.timestamp) }}</text>
          </view>
        </view>
        <view class="transaction-amount-container">
          <text class="transaction-amount amount-neutral">
            {{ parseFloat(transaction.amount).toFixed(4) }} {{ tokenSymbol }}
          </text>
          <text class="transaction-fee" v-if="transaction.feeQty">
            Fee: {{ transaction.feeQty }} {{ tokenSymbol }}
          </text>
        </view>
      </view>

      <!-- Withdrawal transaction -->
      <view v-if="transaction.transactionCode.code === 'WDR'" class="section-column" @click="showTransactionDetails(transaction)">
        <view class="transaction-icon send">
          <uni-icons type="arrow-up" size="20" color="#fff"></uni-icons>
        </view>
        <view class="transaction-details">
          <text class="transaction-address">提取地址 {{ transaction.receiverAddress.slice(0, 6) }}...{{ transaction.receiverAddress.slice(-4) }}</text>
          <view class="transaction-date-container">
            <text class="transaction-date">{{ formatDate(transaction.timestamp) }}</text>
          </view>
        </view>
        <view class="transaction-amount-container">
          <text class="transaction-amount amount-negative">
            -{{ parseFloat(transaction.amount).toFixed(4) }} {{ tokenSymbol }}
          </text>
          <text class="transaction-fee">
            Fee: {{ transaction.feeQty }} {{ tokenSymbol }}
          </text>
        </view>
      </view>

      <!-- Convert transaction -->
      <view v-if="transaction.transactionCode.code === 'CONVERT'" class="section-column" @click="showTransactionDetails(transaction)">
        <view class="transaction-icon transfer">
          <uni-icons type="refresh" size="20" color="#fff"></uni-icons>
        </view>
        <view class="transaction-details">
          <text class="transaction-address">
            {{ transaction.senderUserId === userId ? '兑换 DOU' : '兑换 USDT' }}
          </text>
          <view class="transaction-date-container">
            <text class="transaction-date">{{ formatDate(transaction.timestamp) }}</text>
          </view>
        </view>
        <view class="transaction-amount-container">
          <text class="transaction-amount" :class="transaction.senderUserId === userId ? 'amount-negative' : 'amount-positive'">
            {{ transaction.senderUserId === userId ? '-' : '+' }}{{ parseFloat(transaction.amount).toFixed(4) }} {{ tokenSymbol }}
          </text>
          <text class="transaction-fee" v-if="transaction.feeQty">
            Fee: {{ transaction.feeQty }} {{ tokenSymbol }}
          </text>
        </view>
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
import { fetchTokenSendTransactions } from '@/services/userService';

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
    this.tokenSymbol = option.tokenSymbol;
    this.tokenBalance = option.tokenBalance;
    this.userId = localStorage.getItem('userId');
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
        if (!this.userId) {
          console.error('User ID not found in localStorage');
          return;
        }
        const response = await fetchTokenSendTransactions(this.userId, this.tokenSymbol, this.page, this.size);
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
      return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
    },
    goBack() {
      uni.reLaunch({
        url: '/pages/Profile/Profile',
        success: function() {
          console.log('Successfully relaunched Profile page');
        },
        fail: function(err) {
          console.error('Failed to relaunch Profile page:', err);
        }
      });
    },
    handleTransfer() {
      uni.navigateTo({
        url: `/pages/Wallet/Send?tokenSymbol=${this.tokenSymbol}`
      });
    },
    showTransactionDetails(transaction) {
      uni.navigateTo({
        url: `/pages/Wallet/TransactionDetails?transactionDetails=${encodeURIComponent(JSON.stringify(transaction))}&tokenSymbol=${this.tokenSymbol}`
      });
    }
  }
};
</script>
