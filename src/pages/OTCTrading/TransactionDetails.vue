<template>
  <view class="uni-container">
    <view class="header">
      <button class="back-button" @click="goBack"><uni-icons type="back" size="24"></uni-icons></button>
      <text class="uni-title">交易明细</text>
    </view>
    <view class="transaction-details">
      <view v-for="(transaction, index) in transactions" :key="index" class="transaction-item">
        <view class="transaction-header">
          <text>{{ transaction.orderType === 'BUY' ? '买入' : '卖出' }}</text>
          <text>SEE: {{ transaction.qty }}</text>
        </view>
        <view class="transaction-details">
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
            <text>{{ transaction.price.toFixed(4) }}</text>
          </view>
          <view class="detail-row">
            <text>成交数量</text>
            <text>{{ transaction.qty.toFixed(4) }}</text>
          </view>
          <view class="detail-row">
            <text>成交价格</text>
            <text>{{ transaction.price.toFixed(4) }}</text>
          </view>
          <view class="detail-row">
            <text>手续费</text>
            <text>{{ transaction.feeQty.toFixed(4) }}</text>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
import { fetchTransactionDetails } from '@/services/otcService';

export default {
  data() {
    return {
      orderId: '',
      userId: '',
      transactions: []
    };
  },
  onLoad(option) {
    this.orderId = option.orderId;
    this.userId = option.userId;
    this.fetchTransactionDetails();
  },
  methods: {
    async fetchTransactionDetails() {
      try {
        const response = await fetchTransactionDetails(this.userId, this.orderId);
        this.transactions = response.content;
      } catch (error) {
        console.error('Error fetching transaction details:', error);
      }
    },
    goBack() {
      const pages = getCurrentPages();
      if (pages.length > 1) {
        uni.navigateBack({
          delta: 1
        });
      } else {
        uni.reLaunch({
          url: '/pages/OTCTrading/OTCHistory'
        });
      }
    }
  }
};
</script>
