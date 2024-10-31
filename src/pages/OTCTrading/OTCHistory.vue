<template>
  <view class="uni-container">
    <view class="header">
      <button class="back-button" @click="goBack"><uni-icons type="back" size="25"></uni-icons></button>
      <text class="uni-title">我的订单</text>
    </view>
    <view class="otc-order-selector">
      <text :class="{ active: selectedTab === 'BUY' }" @click="selectTab('BUY')">买</text>
      <text :class="{ active: selectedTab === 'SELL' }" @click="selectTab('SELL')">卖出</text>
    </view>
    
    <view class="otc-order-selector">
      <text :class="{ active: selectedStatus === 'OPEN' }" @click="selectStatus('OPEN')">进行中</text>
      <text :class="{ active: selectedStatus === 'FILLED' }" @click="selectStatus('FILLED')">已完成</text>
      <text :class="{ active: selectedStatus === 'CANCELLED' }" @click="selectStatus('CANCELLED')">已取消</text>
    </view>
    <view>
      <view v-for="(order, index) in filteredOrders" :key="index" class="section">
        <view class="history-item-main">
          <text>{{ order.orderType === 'BUY' ? '买入' : '卖出' }}</text>
          <view class="token-wrapper">
            <img :src="`/static/images/tokens/${order.baseTokenSymbolImageUrl}`" alt="Token Image" class="token-icon" />
            <text class="token-text">SEE: {{ order.qty ? order.qty.toFixed(4).padEnd(4, '0') : '0.0000' }}</text>
          </view>
        </view>
        <view class="order-details">
          <view class="detail-row">
            <text>创建时间</text>
            <text>{{ order.createdAt ? new Date(order.createdAt).toLocaleString() : 'N/A' }}</text>
          </view>
          <view class="detail-row">
            <text>状态</text>
            <text :class="['status', order.status ? order.status.toLowerCase() : '']">
              {{ order.status === 'OPEN' || order.status === 'PARTIALLY_FILLED' ? '进行中' :
                 order.status === 'CANCELLED' ? '已取消' :
                 order.status === 'FILLED' ? '已完成' : '未知状态' }}
            </text>
          </view>
          <view class="detail-row">
            <text>挂单价格</text>
            <text>{{ order.price ? order.price.toFixed(4).padEnd(4, '0') : '0.0000' }}</text>
          </view>
          <view class="detail-row">
            <text>成交数量</text>
            <text>{{ order.remainingQty ? order.remainingQty.toFixed(4).padEnd(4, '0') : '0.0000' }}</text>
          </view>
          <view class="detail-row">
            <text>成交价格</text>
            <text>{{ order.price ? order.price.toFixed(4).padEnd(4, '0') : '0.0000' }}</text>
          </view>
        </view>
        <view class="order-actions-wrapper">
          <view class="order-actions">
            <button v-if="order.status === 'OPEN' || order.status === 'PARTIALLY_FILLED'" @click="showCancelConfirmation(order)">取消</button>
            <button @click="viewDetails(order.id)">明细</button>
          </view>
        </view>
      </view>
      <view v-if="loading" class="loading-indicator">加载中...</view>
      <view v-if="!hasMore" class="end-of-list">没有更多订单</view>
    </view>

    <!-- Cancel Confirmation Popup -->
    <uni-popup ref="cancelPopup" type="dialog">
      <view class="popup-content">
        <text class="confirmation-title">确认取消订单</text>
        <text class="confirmation-subtitle">您确认要取消这个订单吗？</text>
        <view class="confirmation-details">
          <view class="detail-item">
            <text>订单类型</text>
            <text>{{ orderToCancel ? (orderToCancel.orderType === 'BUY' ? '买入' : '卖出') : 'N/A' }}</text>
          </view>
          <view class="detail-item">
            <text>数量</text>
            <text>{{ orderToCancel ? orderToCancel.qty.toFixed(4) : '0.0000' }} SEE</text>
          </view>
          <view class="detail-item">
            <text>价格</text>
            <text>{{ orderToCancel ? orderToCancel.price.toFixed(4) : '0.0000' }} USDT</text>
          </view>
          <view class="detail-item">
            <text>总额</text>
            <text>{{ orderToCancel ? (orderToCancel.qty * orderToCancel.price).toFixed(4) : '0.0000' }} USDT</text>
          </view>
        </view>
        <view class="confirmation-buttons">
          <button class="btn-cancel" @click="cancelCancelConfirmation">取消</button>
          <button class="btn-confirm" @click="confirmCancelOrder">确定</button>
        </view>
      </view>
    </uni-popup>

    <!-- Result Popup -->
    <uni-popup ref="resultPopup" type="center">
      <view class="popup-content">
        <view class="result-icon">
          <uni-icons 
            :type="cancelSuccess ? 'checkmarkempty' : 'closeempty'" 
            size="50" 
            :color="cancelSuccess ? '#4CD964' : '#FF3B30'"
          />
        </view>
        <text class="result-title">{{ cancelSuccess ? '交易成功' : '交易失败' }}</text>
        <text class="result-message"></text>
        <text class="result-submessage">您的订单取消{{ cancelSuccess ? '成功' : '失败' }}</text>
        <button class="uni-btn" @click="closeResultPopup">确定</button>
      </view>
    </uni-popup>
  </view>
</template>

<script>
import { fetchOrderHistory, cancelOrder } from '@/services/otcService';

export default {
  data() {
    return {
      selectedTab: 'BUY',
      selectedStatus: 'OPEN',
      orders: [],
      filteredOrders: [],
      currentPage: 0,
      pageSize: 10,
      hasMore: true,
      loading: false,
      userId: localStorage.getItem('userId'),
      orderIdToCancel: null,
      showResultPopup: false,
      cancelSuccess: false,
      resultMessage: '',
      showCancelConfirmationPopup: false,
      orderToCancel: null,
    };
  },
  onReachBottom() {
    console.log('Reached bottom');
    if (!this.loading && this.hasMore) {
      this.fetchOrderHistory();
    }
  },
  methods: {
    async fetchOrderHistory() {
      if (this.loading || !this.hasMore) return;

      this.loading = true;
      const userId = this.userId;
      if (!userId) {
        console.error('User ID not found');
        this.loading = false;
        return;
      }

      try {
        console.log('Fetching page:', this.currentPage);
        const data = await fetchOrderHistory(userId, this.currentPage, this.pageSize, this.selectedTab, this.selectedStatus);
        console.log('Fetched Order History:', data);
        
        if (data.content) {
          if (data.content.length === 0) {
            this.hasMore = false;
          } else {
            this.orders = [...this.orders, ...data.content];
            this.filterOrders();
            this.hasMore = !data.last;
            if (!data.last) {
              this.currentPage++;
            }
          }
        }
      } catch (error) {
        console.error('Error fetching order history:', error);
        uni.showToast({
          title: '加载失败',
          icon: 'none'
        });
      } finally {
        this.loading = false;
      }
    },
    selectTab(tab) {
      this.selectedTab = tab;
      this.resetPagination();
      this.fetchOrderHistory();
    },
    selectStatus(status) {
      this.selectedStatus = status;
      this.resetPagination();
      this.fetchOrderHistory();
    },
    filterOrders() {
      this.filteredOrders = this.orders.filter(order => 
        order.orderType === this.selectedTab && 
        (this.selectedStatus === 'OPEN' 
          ? ['OPEN', 'PARTIALLY_FILLED'].includes(order.status) 
          : order.status === this.selectedStatus)
      );
    },
    resetPagination() {
      this.currentPage = 0;
      this.hasMore = true;
      this.orders = [];
    },
    goBack() {
      console.log('Attempting to navigate back');
      const pages = getCurrentPages();
      if (pages.length > 1) {
        uni.navigateBack({
          delta: 1,
          success: function() {
            console.log('Successfully navigated back');
          },
          fail: function(err) {
            console.error('Failed to navigate back:', err);
            uni.reLaunch({
              url: '/pages/OTCTrading/OTCTrading',
              success: function() {
                console.log('Successfully relaunched OTCTrading page');
              },
              fail: function(err) {
                console.error('Failed to relaunch OTCTrading page:', err);
              }
            });
          }
        });
      } else {
        console.log('No previous page, relaunching OTCTrading');
        uni.reLaunch({
          url: '/pages/OTCTrading/OTCTrading',
          success: function() {
            console.log('Successfully relaunched OTCTrading page');
          },
          fail: function(err) {
            console.error('Failed to relaunch OTCTrading page:', err);
          }
        });
      }
    },
    showCancelConfirmation(order) {
      this.orderToCancel = order;
      this.$refs.cancelPopup.open();
    },
    cancelCancelConfirmation() {
      this.$refs.cancelPopup.close();
      this.orderToCancel = null;
    },
    async confirmCancelOrder() {
      this.$refs.cancelPopup.close();
      if (this.orderToCancel) {
        try {
          await cancelOrder(this.orderToCancel.id);
          this.cancelSuccess = true;
          this.resultMessage = '订单已成功取消';
          this.resetPagination();
          this.fetchOrderHistory();
        } catch (error) {
          this.cancelSuccess = false;
          this.resultMessage = '取消订单失败: ' + error.message;
        }
        this.$refs.resultPopup.open();
      }
    },
    closeResultPopup() {
      this.$refs.resultPopup.close();
      this.orderToCancel = null;
    },

    cancelOrder(order) {
      this.showCancelConfirmation(order);
    },
    viewDetails(orderId) {
      uni.navigateTo({
        url: `/pages/OTCTrading/TransactionDetails?orderId=${orderId}&userId=${this.userId}`
      });
    }
  },
  mounted() {
    this.fetchOrderHistory();
  }
};
</script>