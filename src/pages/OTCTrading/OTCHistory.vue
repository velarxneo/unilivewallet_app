<template>
  <view class="uni-container">
    <view class="header">
      <text class="title">我的订单</text>
      <button @click="goBack">返回</button>
    </view>
    <view class="otc-order-selector">
      <text :class="{ active: selectedTab === 'BUY' }" @click="selectTab('BUY')">买</text>
      <text :class="{ active: selectedTab === 'SELL' }" @click="selectTab('SELL')">卖出</text>
    </view>
    <br />
    <view class="otc-order-selector">
      <text :class="{ active: selectedStatus === 'in-progress' }" @click="selectStatus('in-progress')">进行中</text>
      <text :class="{ active: selectedStatus === 'completed' }" @click="selectStatus('completed')">已完成</text>
      <text :class="{ active: selectedStatus === 'cancelled' }" @click="selectStatus('cancelled')">已取消</text>
    </view>
    <view class="order-list">
      <view v-for="(transaction, index) in filteredTransactions" :key="index" class="order-item">
        <view class="order-header">
          <text>{{ transaction.orderType === 'BUY' ? '买入' : '卖出' }}</text>
          <text>SEE: {{ transaction.qty }}</text>
        </view>
        <view class="order-details">
          <view class="detail-row">
            <text>交易时间</text>
            <text>{{ new Date(transaction.transactionDate).toLocaleString() }}</text>
          </view>
          <view class="detail-row">
            <text>状态</text>
            <text :class="['status', transaction.transactionType.toLowerCase()]">
              {{ transaction.transactionType === 'CREATE' ? '进行中' :
                 transaction.transactionType === 'CANCEL' ? '已取消' :
                 transaction.transactionType === 'FILL' ? '已完成' : '未知状态' }}
            </text>
          </view>
          <view class="detail-row">
            <text>挂单价格</text>
            <text>{{ transaction.price.toFixed(2) }}</text>
          </view>
          <view class="detail-row">
            <text>成交数量</text>
            <text>{{ transaction.qty.toFixed(2) }}</text>
          </view>
          <view class="detail-row">
            <text>成交价格</text>
            <text>{{ transaction.price.toFixed(2) }}</text>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
import { fetchTransactionHistory } from '@/services/otcService';

export default {
  data() {
    return {
      selectedTab: 'BUY',
      selectedStatus: 'in-progress',
      transactions: [],
      filteredTransactions: []
    };
  },
  methods: {
    async fetchTransactionHistory() {
      const userId = localStorage.getItem('userId');
      if (!userId) {
        console.error('User ID not found');
        return;
      }

      try {
        const data = await fetchTransactionHistory(userId);
        this.transactions = data.content;
        this.filterTransactions();
      } catch (error) {
        console.error('Error fetching transaction history:', error);
      }
    },
    selectTab(tab) {
      this.selectedTab = tab;
      this.filterTransactions();
    },
    selectStatus(status) {
      this.selectedStatus = status;
      this.filterTransactions();
    },
    filterTransactions() {
      this.filteredTransactions = this.transactions.filter(transaction => 
        transaction.orderType === this.selectedTab && 
        transaction.transactionType.toLowerCase() === this.selectedStatus
      );
    },
    goBack() {
      uni.navigateBack({
        delta: 1
      });
    }
  },
  mounted() {
    this.fetchTransactionHistory();
  }
};
</script>
