<template>
  <view class="uni-container">
    <!-- <view class="otc-header">
      <text class="otc-title">OTC</text>
      <view class="otc-history-link" @click="goToHistory">
        <text>历史订单</text>
        <uni-icons type="forward" size="18"></uni-icons>
      </view>
    </view> -->
    
    <view class="otc-trading-pair">
      <view class="otc-trading-pair-header">
        <text class="otc-trading-pair-title">SEE/USDT</text>
        <view class="otc-history-link" @click="goToHistory">
          <text>历史订单</text>
          <uni-icons type="forward" size="18"></uni-icons>
        </view>
      </view>
      <view class="otc-pair-selector">
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
        const response = await fetch('http://localhost:8081/api/otc/orderbook/SEE/USDT');
        const data = await response.json();
        this.orderBook = data;
        // Set the initial best price after fetching the order book
        this.setBestPrice();
      } catch (error) {
        console.error('Error fetching order book:', error);
      }
    },
    async fetchUserBalances() {
      const userId = localStorage.getItem('userId');
      if (userId) {
        try {
          const response = await fetch(`http://localhost:8081/api/wallet/balances/user/${userId}`);
          if (response.ok) {
            this.userBalances = await response.json();
          } else {
            throw new Error('Failed to fetch user balances');
          }
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
        const response = await fetch('http://localhost:8081/api/get-fee-configuration/TRADE');
        if (response.ok) {
          const data = await response.json();
          this.feeConfiguration = data[0];
        } else {
          throw new Error('Failed to fetch fee configuration');
        }
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

      // Set expiration date to one year from now
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
        const response = await fetch('http://localhost:8081/api/otc/match', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(requestBody),
        });

        const result = await response.json();

        this.transactionSuccess = response.ok;
        this.resultMessage = response.ok ? '您可以在我的订单中查看' : '该订单已被其他人成交';
        this.showResultPopup = true;
      } catch (error) {
        console.error('Error placing order:', error);
        this.transactionSuccess = false;
        this.resultMessage = '交易过程中发生错误，请稍后重试';
        this.showResultPopup = true;
      }

      this.showConfirmationPopup = false;
    },
    closeResultPopup() {
      this.showResultPopup = false;
      // Reset form if the transaction was successful
      if (this.transactionSuccess) {
        this.amount = '';
        this.price = '';
        this.fetchOrderBook();
        this.fetchUserBalances();
      }
    },
    goToHistory() {
      // Navigate to history page
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
  },
  mounted() {
    this.fetchOrderBook();
    this.fetchUserBalances();
    this.fetchFeeConfiguration();
    this.$root.$on('userLoggedIn', (userId, balances) => {
      this.userBalances = balances;
    });
    // Set the initial best price
    this.setBestPrice();
  }
};
</script>







