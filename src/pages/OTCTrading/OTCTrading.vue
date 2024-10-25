<template>
  <view class="uni-container">
    <view class="otc-trading-pair">
      <view class="otc-trading-pair-header">
        <text class="otc-trading-pair-title">SEE/USDT</text>
        <view class="otc-history-link" @click="goToHistory">
          <text>历史订单</text>
          <uni-icons type="forward" size="18"></uni-icons>
        </view>
      </view>
      <view class="otc-order-selector">
        <text :class="{ active: selectedOrderType === 'BUY' }" @click="selectOrderType('BUY')">买入</text>
        <text :class="{ active: selectedOrderType === 'SELL' }" @click="selectOrderType('SELL')">卖出</text>
      </view>
    </view>
    
    <view class="otc-trade-form">
      <view class="otc-available-balance">
        <text>余额: {{ parseFloat(availableBalance).toFixed(4).padEnd(4, '0') }} {{ selectedOrderType === 'BUY' ? 'USDT' : 'SEE' }}</text>
      </view>
      <view class="otc-input-group">
        <text>价格</text>
        <input type="number" v-model="price" placeholder="USDT" />
      </view>
      <view class="otc-input-group">
        <text>数量</text>
        <input type="number" v-model="amount" placeholder="SEE" @blur="onAmountInput" />
        <button class="btn-max" @click="setMaxAmount">最大</button>
      </view>
      <view class="otc-slider-group">
        <slider 
          :min="0" 
          :max="100" 
          :value="sliderValue" 
          @change="onSliderChange" 
        />
      </view>
      <view class="otc-total">
        <text>总额</text>
        <text>{{ parseFloat(totalPrice).toFixed(4).padEnd(4, '0') }} USDT</text>
      </view>
      <view class="otc-action-buttons">
        <button v-if="selectedOrderType === 'BUY'" class="btn-buy" @click="showConfirmation('buy')">买入 SEE</button>
        <button v-if="selectedOrderType === 'SELL'" class="btn-sell" @click="showConfirmation('sell')">卖出 SEE</button>
      </view>
    </view>
    
    <view class="otc-order-book">
      <view class="otc-order-book-header">
        <view class="buy-header">
          <text>买入(BID)</text>
        </view>
        <view class="sell-header">
          <text>卖出(ASK)</text>
        </view>
      </view>
      <view class="otc-order-book-content">
        <view class="otc-buy-orders">
          <view class="order-header">
            <text>数量(SEE)</text>
            <text>价格(USDT)</text>
          </view>
          <view v-for="(order, index) in orderBook.bids.slice(0, 5)" :key="'buy-' + index" class="order-item buy">
            <text>{{ parseFloat(order.quantity).toFixed(4).padEnd(4, '0') }}</text>
            <text>{{ parseFloat(order.price).toFixed(4).padEnd(4, '0') }}</text>
          </view>
        </view>
        <view class="otc-sell-orders">
          <view class="order-header">
            <text>价格(USDT)</text>
            <text>数量(SEE)</text>
          </view>
          <view v-for="(order, index) in sortedAsks.slice(0, 5)" :key="'sell-' + index" class="order-item sell">
            <text>{{ parseFloat(order.price).toFixed(4).padEnd(4, '0') }}</text>
            <text>{{ parseFloat(order.quantity).toFixed(4).padEnd(4, '0') }}</text>
          </view>
        </view>
      </view>
      <view class="otc-current-price">
        <text>{{ parseFloat(currentPrice).toFixed(4).padEnd(4, '0') }} USDT</text>
      </view>
    </view>

    <!-- Transaction History Section -->
    <view class="transaction-history">
      <text class="history-title">最新成交记录</text>
      <view v-for="(transaction, index) in transactionHistory" :key="'transaction-' + index" class="transaction-item">
        <view class="transaction-header">
          <text>{{ transaction.orderType === 'BUY' ? '买入' : '卖出' }}</text>
          <text>SEE: {{ transaction.qty.toFixed(0) }}</text>
        </view>
        <view class="transaction-details">
          <view class="detail-row">
            <text>交易时间</text>
            <text>{{ new Date(transaction.transactionDate).toLocaleString() }}</text>
          </view>
          <view class="detail-row">
            <text>状态</text>
            <text :class="['status', {
              'in-progress': transaction.transactionType === 'CREATE',
              'cancelled': transaction.transactionType === 'CANCEL',
              'completed': transaction.transactionType === 'FILL'
            }]">
              {{ transaction.transactionType === 'CREATE' ? '进行中' :
                 transaction.transactionType === 'CANCEL' ? '已取消' :
                 transaction.transactionType === 'FILL' ? '已完成' : '未知状态' }}
            </text>
          </view>
          <view class="detail-row">
            <text>挂单价格</text>
            <text>{{ transaction.price.toFixed(4).padEnd(4, '0') }}</text>
          </view>
          <view class="detail-row">
            <text>成交数量</text>
            <text>{{ transaction.qty.toFixed(4).padEnd(4, '0') }}</text>
          </view>
          <view class="detail-row">
            <text>成交价格</text>
            <text>{{ transaction.price.toFixed(4).padEnd(4, '0') }}</text>
          </view>
        </view>
      </view>
    </view>

    <!-- Confirmation Popup -->
    <view v-if="showConfirmationPopup" class="confirmation-popup">
      <view class="confirmation-content">
        <text class="confirmation-title">{{ confirmationTitle }}</text>
        <text class="confirmation-subtitle">您确认{{ orderType }}{{ amount }} {{ orderCurrency }}吗</text>
        <view class="confirmation-details">
          <view class="detail-item">
            <text>单价</text>
            <text>{{ parseFloat(price).toFixed(4).padEnd(4, '0') }} {{ priceCurrency }}</text>
          </view>
          <view class="detail-item">
            <text>实际支付</text>
            <text v-if="selectedOrderType === 'BUY'">{{ parseFloat(totalPrice).toFixed(4).padEnd(4, '0') }} {{ priceCurrency }}</text>
            <text v-else>{{ parseFloat(amount).toFixed(4).padEnd(4, '0') }} {{ orderCurrency }}</text>
          </view>
          <view class="detail-item">
            <text>手续费</text>
            <text>{{ parseFloat(fee).toFixed(4).padEnd(4, '0') }} {{ feeCurrency }}</text>
          </view>
          <view class="detail-item">
            <text>实际到账 ({{ receivedCurrency }})</text>
            <text>{{ parseFloat(actualAmount).toFixed(4).padEnd(4, '0') }} {{ receivedCurrency }}</text>
          </view>
        </view>
        <view class="confirmation-buttons">
          <button class="btn-cancel" @click="cancelConfirmation">取消</button>
          <button class="btn-confirm" @click="confirmOrder">确定</button>
        </view>
      </view>
    </view>

    <!-- Transaction Result Popup -->
    <view v-if="showResultPopup" class="result-popup">
      <view class="result-content">
        <view class="result-icon">
          <uni-icons :type="transactionSuccess ? 'checkmarkempty' : 'closeempty'" size="60" :color="transactionSuccess ? '#4cd964' : '#dd524d'"></uni-icons>
        </view>
        <text class="result-title">{{ transactionSuccess ? '交易成功' : '交易失败' }}</text>
        <text class="result-message">{{ resultMessage }}</text>
        <button class="btn-confirm" @click="closeResultPopup">我知道了</button>
      </view>
    </view>
  </view>
</template>

<script>

import { fetchOrderBook, fetchFeeConfiguration, fetchTransactionHistory, matchOrder } from '@/services/otcService';
import { fetchUserBalances } from '@/services/userService';
export default {
  data() {
    return {
      DECIMAL_PLACES: 4, // Define a constant for decimal places
      selectedOrderType: 'BUY',
      amount: '',
      price: '',
      orderBook: {
        baseTokenSymbol: 'SEE',
        quoteTokenSymbol: 'USDT',
        bids: [],
        asks: []
      },
      userBalances: [],
      showConfirmationPopup: false,
      feeConfiguration: null,
      showResultPopup: false,
      transactionSuccess: false,
      resultMessage: '',
      sliderValue: 0,
      transactionHistory: [], // Add this line
    };
  },
  computed: {
    totalPrice() {
      return (this.amount * this.price);
    },
    availableBalance() {
      const balanceCurrency = this.selectedOrderType === 'BUY' ? 'USDT' : 'SEE';
      const balance = this.userBalances.find(b => b.tokenSymbol === balanceCurrency);
      if (balance) {
        return (parseFloat(balance.otcBalance) - parseFloat(balance.lockedOtcBalance)).toString();
      }
      return '0.0000';
    },
    orderType() {
      return this.selectedOrderType === 'BUY' ? '买入' : '卖出';
    },
    confirmationTitle() {
      return this.selectedOrderType === 'BUY' ? '买SEE' : '卖SEE';
    },
    fee() {
      if (this.feeConfiguration) {
        const feePercentage = this.feeConfiguration.feeValue;
        const feeAmount = this.selectedOrderType === 'BUY'
          ? ((parseFloat(this.amount) * feePercentage) / 100)
          : ((parseFloat(this.totalPrice) * feePercentage) / 100);
        return feeAmount;
      }
      return '0.0000';
    },
    actualAmount() {
      const actual = this.selectedOrderType === 'BUY'
        ? (parseFloat(this.amount) - parseFloat(this.fee))
        : (parseFloat(this.totalPrice) - parseFloat(this.fee));
      return actual;
    },
    receivedCurrency() {
      return this.selectedOrderType === 'BUY' ? 'SEE' : 'USDT';
    },
    sortedAsks() {
      return [...this.orderBook.asks].sort((a, b) => parseFloat(a.price) - parseFloat(b.price));
    },
    currentPrice() {
      const lowestAsk = this.sortedAsks[0];
      const highestBid = this.orderBook.bids[0];
      return lowestAsk && highestBid 
        ? ((parseFloat(lowestAsk.price) + parseFloat(highestBid.price)) / 2)
        : '0.0000';
    },
    orderCurrency() {
      return 'SEE';
    },
    priceCurrency() {
      return 'USDT';
    },
    feeCurrency() {
      return this.selectedOrderType === 'BUY' ? 'SEE' : 'USDT';
    },
  },
  methods: {
    async fetchOrderBook() {
      try {
        this.orderBook = await fetchOrderBook();
        this.setBestPrice();
      } catch (error) {
        console.error('Error fetching order book:', error);
      }
    },
    async fetchUserBalances() {
      const userId = localStorage.getItem('userId');
      if (userId) {
        try {
          this.userBalances = await fetchUserBalances(userId);
        } catch (error) {
          console.error('Error fetching user balances:', error);
        }
      }
    },
    selectOrderType(orderType) {
      this.selectedOrderType = orderType;
      this.amount = '';
      this.setBestPrice();
    },
    async fetchFeeConfiguration() {
      try {
        const data = await fetchFeeConfiguration();
        this.feeConfiguration = data[0];
      } catch (error) {
        console.error('Error fetching fee configuration:', error);
      }
    },
    showConfirmation(type) {
      this.orderType = type;
      console.log(this.orderType);
      console.log(this.fee);
      console.log(this.actualAmount);
      console.log(this.selectedOrderType);
      this.showConfirmationPopup = true;
    },
    cancelConfirmation() {
      this.showConfirmationPopup = false;
    },
    async confirmOrder() {
      const userId = localStorage.getItem('userId');
      if (!userId) {
        console.error('User ID not found');
        return;
      }

      const oneYearFromNow = new Date();
      oneYearFromNow.setFullYear(oneYearFromNow.getFullYear() + 1);

      const requestBody = {
        userId: userId,
        orderType: this.selectedOrderType,
        baseTokenSymbol: 'SEE',
        quoteTokenSymbol: 'USDT',
        qty: parseFloat(this.amount),
        price: parseFloat(this.price),
        expirationDate: oneYearFromNow.toISOString()
      };

      try {
        const result = await matchOrder(requestBody);
        this.transactionSuccess = true;
        this.resultMessage = '您可以在我的订单中查看';
      } catch (error) {
        this.transactionSuccess = false;
        this.resultMessage = '交易过程中发生错误，请稍后重试';
      } finally {
        this.showResultPopup = true;
        this.showConfirmationPopup = false;
      }
    },
    closeResultPopup() {
      this.showResultPopup = false;
      // Reset form if the transaction was successful
      if (this.transactionSuccess) {
        this.amount = '';
        this.price = '';
        this.fetchOrderBook();
        this.fetchUserBalances();
        this.fetchTransactionHistory();
      }
    },
    goToHistory() {
      uni.navigateTo({
        url: '/pages/OTCTrading/OTCHistory'
      });
    },
    setBestPrice() {
      if (this.selectedOrderType === 'BUY') {
        // For buying SEE, use the lowest ask price
        const lowestAsk = this.sortedAsks[0];
        this.price = lowestAsk ? lowestAsk.price : '';
      } else {
        // For selling SEE, use the highest bid price
        const highestBid = this.orderBook.bids[0];
        this.price = highestBid ? highestBid.price : '';
      }
    },
    setMaxAmount() {
      this.amount = this.availableBalance;
      this.sliderValue = 100;
    },
    onSliderChange(e) {
      this.sliderValue = e.detail.value;
      const maxAmount = this.selectedOrderType === 'BUY'
        ? parseFloat(this.availableBalance)
        : parseFloat(this.availableBalance) / parseFloat(this.price);
      this.amount = (maxAmount * (this.sliderValue / 100));
    },
    onAmountInput(e) {
      const inputValue = e.target.value;
      if (inputValue === '') {
        this.amount = '';
        this.sliderValue = 0;
      } else {
        const numValue = parseFloat(inputValue);
        if (!isNaN(numValue)) {
          const maxAmount = this.selectedOrderType === 'BUY'
            ? parseFloat(this.availableBalance)
            : parseFloat(this.availableBalance) / parseFloat(this.price);
          this.amount = Math.min(numValue, maxAmount);
          this.sliderValue = (numValue / maxAmount) * 100;
        }
      }
    },
    async fetchTransactionHistory() {
      const userId = localStorage.getItem('userId');
      if (!userId) {
        console.error('User ID not found');
        return;
      }

      try {
        const data = await fetchTransactionHistory(userId);
        this.transactionHistory = data.content;
      } catch (error) {
        console.error('Error fetching transaction history:', error);
      }
    },
  },
  mounted() {
    this.fetchOrderBook();
    this.fetchUserBalances();
    this.fetchFeeConfiguration();
    this.$root.$on('userLoggedIn', (userId, balances) => {
      this.userBalances = balances;
    });
    this.setBestPrice();
    this.fetchTransactionHistory();
  }
};
</script>



















