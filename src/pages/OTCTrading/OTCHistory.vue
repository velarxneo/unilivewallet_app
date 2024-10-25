<template>
  <view class="uni-container">
    <view class="header">
      <button @click="goBack"><</button>
      <text class="title">我的订单</text>
    </view>
    <view class="otc-order-selector">
      <text :class="{ active: selectedTab === 'BUY' }" @click="selectTab('BUY')">买</text>
      <text :class="{ active: selectedTab === 'SELL' }" @click="selectTab('SELL')">卖出</text>
    </view>
    <br />
    <view class="otc-order-selector">
      <text :class="{ active: selectedStatus === 'OPEN' }" @click="selectStatus('OPEN')">进行中</text>
      <text :class="{ active: selectedStatus === 'FILLED' }" @click="selectStatus('FILLED')">已完成</text>
      <text :class="{ active: selectedStatus === 'CANCELLED' }" @click="selectStatus('CANCELLED')">已取消</text>
    </view>
    <view class="order-list" @scroll="handleScroll">
      <view v-for="(order, index) in filteredOrders" :key="index" class="order-item">
        <view class="order-header">
          <text>{{ order.orderType === 'BUY' ? '买入' : '卖出' }}</text>
          <text>SEE: {{ order.qty.toFixed(4).padEnd(4, '0') }}</text>
        </view>
        <view class="order-details">
          <view class="detail-row">
            <text>创建时间</text>
            <text>{{ new Date(order.createdAt).toLocaleString() }}</text>
          </view>
          <view class="detail-row">
            <text>状态</text>
            <text :class="['status', order.status.toLowerCase()]">
              {{ order.status === 'OPEN' ? '进行中' :
                 order.status === 'CANCELLED' ? '已取消' :
                 order.status === 'FILLED' ? '已完成' : '未知状态' }}
            </text>
          </view>
          <view class="detail-row">
            <text>挂单价格</text>
            <text>{{ order.price.toFixed(4).padEnd(4, '0') }}</text>
          </view>
          <view class="detail-row">
            <text>成交数量</text>
            <text>{{order.remainingQty.toFixed(4).padEnd(4, '0') }}</text>
          </view>
          <view class="detail-row">
            <text>成交价格</text>
            <text>{{ order.price.toFixed(4).padEnd(4, '0') }}</text>
          </view>
        </view>
      </view>
      <view v-if="loading" class="loading-indicator">加载中...</view>
      <view v-if="!hasMore" class="end-of-list">没有更多订单</view>
    </view>
  </view>
</template>

<script>
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
      loading: false
    };
  },
  methods: {
    async fetchOrderHistory() {
      if (this.loading || !this.hasMore) return;

      this.loading = true;
      const userId = localStorage.getItem('userId');
      if (!userId) {
        console.error('User ID not found');
        this.loading = false;
        return;
      }

      try {
        const response = await fetch(`http://localhost:8081/api/otc/orders/user?userId=${userId}&page=${this.currentPage}&size=${this.pageSize}&orderType=${this.selectedTab}&status=${this.selectedStatus}`);
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        if (data.content.length < this.pageSize) {
          this.hasMore = false;
        }
        this.orders = [...this.orders, ...data.content];
        this.filterOrders();
        this.currentPage++;
      } catch (error) {
        console.error('Error fetching order history:', error);
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
        order.status === this.selectedStatus
      );
    },
    resetPagination() {
      this.currentPage = 0;
      this.hasMore = true;
      this.orders = [];
    },
    handleScroll(event) {
      const { scrollTop, scrollHeight, clientHeight } = event.target;
      if (scrollTop + clientHeight >= scrollHeight - 10) {
        this.fetchOrderHistory();
      }
    },
    goBack() {
      uni.navigateBack({
        delta: 1
      });
    }
  },
  mounted() {
    this.fetchOrderHistory();
  }
};
</script>
