<template>
  <view class="otc-container">
    <view class="otc-header">
      <text class="otc-title">OTC</text>
      <view class="otc-history-link" @click="goToHistory">
        <text>历史订单</text>
        <uni-icons type="forward" size="18"></uni-icons>
      </view>
    </view>
    
    <view class="otc-trading-pair">
      <view class="otc-pair-selector">
        <text class="active">USDT</text>
        <text>SEE</text>
      </view>
    </view>
    
    <view class="otc-trade-form">
      <view class="otc-input-group">
        <text>数量</text>
        <input type="number" v-model="amount" placeholder="最低100SEE" />
        <text class="currency">USDT</text>
      </view>
      <view class="otc-input-group">
        <text>单价</text>
        <input type="number" v-model="price" placeholder="最低100USDT" />
        <text class="currency">USDT</text>
        <uni-icons type="refresh" size="24" color="#4cd964"></uni-icons>
      </view>
      <view class="otc-total-price">
        <text>总买入价</text>
        <text class="price">{{ totalPrice }} USDT</text>
      </view>
      <view class="otc-action-buttons">
        <button class="btn-buy">买</button>
        <button class="btn-sell">卖</button>
      </view>
    </view>
    
    <view class="otc-order-book">
      <text class="otc-section-title">订单列表</text>
      <view class="otc-order-headers">
        <view class="buy-header">
          <text>买</text>
          <view>
            <text>数量</text>
            <text>价格</text>
          </view>
        </view>
        <view class="sell-header">
          <text>卖</text>
          <view>
            <text>数量</text>
            <text>价格</text>
          </view>
        </view>
      </view>
      <view class="otc-order-list">
        <view class="buy-orders">
          <view v-for="(order, index) in orderBook.bids" :key="'buy-' + index" class="order-item">
            <text>{{ order.quantity }}</text>
            <text>{{ order.price }}</text>
          </view>
        </view>
        <view class="sell-orders">
          <view v-for="(order, index) in orderBook.asks" :key="'sell-' + index" class="order-item">
            <text>{{ order.quantity }}</text>
            <text>{{ order.price }}</text>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
export default {
  data() {
    return {
      amount: '',
      price: '',
      orderBook: {
        baseTokenSymbol: '',
        quoteTokenSymbol: '',
        bids: [],
        asks: []
      }
    };
  },
  computed: {
    totalPrice() {
      return (this.amount * this.price).toFixed(2);
    }
  },
  methods: {
    async fetchOrderBook() {
      try {
        const response = await fetch('http://localhost:8081/api/otc/orderbook/SEE/USDT');
        const data = await response.json();
        this.orderBook = data;
      } catch (error) {
        console.error('Error fetching order book:', error);
      }
    },
    goToHistory() {
      // Navigate to history page
    }
  },
  mounted() {
    this.fetchOrderBook();
  }
};
</script>

<style lang="scss">
@import '@/uni.scss';

.otc-container {
  .otc-header {
    margin-bottom: 1.25rem; // 20px
  }

  .otc-trading-pair {
    margin-bottom: 1.25rem; // 20px
  }

  .otc-trade-form {
    padding: 1.25rem; // 20px
    margin-bottom: 1.25rem; // 20px
  }

  .otc-input-group {
    margin-bottom: 1.25rem; // 20px

    input {
      margin: 0 0.625rem; // 10px
    }
  }

  .otc-order-book {
    padding: 1.25rem; // 20px
  }

  .otc-order-headers {
    margin-bottom: 0.625rem; // 10px

    .buy-header, .sell-header {
      view {
        text {
          margin-left: 1.25rem; // 20px
        }
      }
    }
  }
}
</style>
