<template>
  <view class="order-select-wrapper" style="background-color: #ffffff; padding: 20px; border-radius: 10px;">
    <uni-popup ref="orderSelectPopup" type="bottom">
      <view class="order-select-content" style="background-color: #ffffff; padding: 15px;">
        <view class="order-select-header" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
          <view class="order-select-title" style="font-size: 18px; font-weight: bold;">
            <text>选择{{ orderType === 'BUY' ?  '卖出' : '买入' }}订单</text>
          </view>
          <uni-icons type="closeempty" size="24" color="#333" @click="close"></uni-icons>
        </view>
        <view class="target-qty">
            <text>目标数量: {{ parseFloat(targetQty).toFixed(4) }} SEE</text>
        </view>
        <view class="order-list">
          <view class="order-header">
            <view class="order-header-left">
              <text class="header-label">数量(SEE)</text>
            </view>
            <view class="order-header-right">
              <text class="header-label">价格(USDT)</text>
            </view>
          </view>
          <view v-for="order in filteredOrders" 
                :key="order.id" 
                class="order-item"
                @click="selectOrder(order)">
            <view class="order-item-left">
              <text class="order-qty">{{ parseFloat(order.remainingQty).toFixed(4) }}</text>
            </view>
            <view class="order-item-right">
              <text class="order-price">{{ parseFloat(order.price).toFixed(4) }}</text>
            </view>
            <checkbox :checked="selectedOrderIds.includes(order.id)" />
          </view>
        </view>

        <view class="order-select-footer">
          <button class="order-select-submit" @click="showConfirmation">
            确认
          </button>
        </view>
      </view>
    </uni-popup>

    <!-- Confirmation Popup -->
    <uni-popup ref="confirmationPopup" type="center">
      <view class="popup-content">

          <view class="confirmation-title">
            <text>确认{{ orderType === 'BUY' ? '买入' : '卖出' }}</text>
          </view>

        <view class="confirmation-details">
          <view class="detail-item">
            <text>数量</text>
            <text>{{ parseFloat(selectedTotal).toFixed(4) }} SEE</text>
          </view>
          <view class="detail-item">
            <text>价格区间</text>
            <text>{{ priceRange.min.toFixed(4) }} - {{ priceRange.max.toFixed(4) }} USDT</text>
          </view>
          <view class="detail-item">
            <text>交易总额</text>
            <text>{{ totalAmount.toFixed(4) }} USDT</text>
          </view>
          <view class="detail-item">
            <text>手续费({{ feeRate }}%)</text>
            <text v-if="isLoadingFee">加载中...</text>
            <text v-else-if="feeError" class="error-text">{{ feeError }}</text>
            <text v-else>{{ transactionFee.toFixed(4) }} {{ orderType === 'BUY' ? 'SEE' : 'USDT' }}</text>
          </view>
          <view class="detail-item">
            <text>实际获得</text>
            <text>{{ actualAmount.toFixed(4) }} {{ orderType === 'BUY' ? 'SEE' : 'USDT' }}</text>
          </view>
        </view>
        <view class="confirmation-buttons">
          <button class="btn-cancel" @click="closeConfirmation">取消</button>
          <button class="btn-confirm" @click="submitOrders">确认</button>
        </view>
      </view>
    </uni-popup>
  </view>
</template>

<script>
import { fetchTransactionFee } from '@/services/otcService.js';

export default {
  name: 'OrderSelect',
  props: {
    orderType: {
      type: String,
      required: true
    },
    rawOrders: {
      type: Array,
      required: true
    },
    targetQty: {
      type: Number,
      required: true
    }
  },
  data() {
    return {
      selectedOrderIds: [],
      partialOrders: {},
      feeRate: 0,
      totalFee: 0,
      isLoadingFee: false,
      feeError: null
    };
  },
  computed: {
    filteredOrders() {
      return this.rawOrders.filter(o => o.orderType === (this.orderType === 'BUY' ? 'SELL' : 'BUY'));
    },
    selectedTotal() {
      return this.selectedOrderIds.reduce((sum, id) => {
        const order = this.rawOrders.find(o => o.id === id);
        const amount = this.partialOrders[id] || parseFloat(order.remainingQty);
        return sum + parseFloat(amount);
      }, 0);
    },
    priceRange() {
      if (this.selectedOrderIds.length === 0) return { min: 0, max: 0 };
      
      const selectedPrices = this.selectedOrderIds.map(id => {
        const order = this.rawOrders.find(o => o.id === id);
        return parseFloat(order.price);
      });
      
      return {
        min: Math.min(...selectedPrices),
        max: Math.max(...selectedPrices)
      };
    },
    totalAmount() {
      return this.selectedOrderIds.reduce((sum, id) => {
        const order = this.rawOrders.find(o => o.id === id);
        const amount = this.partialOrders[id] || parseFloat(order.remainingQty);
        return sum + (parseFloat(amount) * parseFloat(order.price));
      }, 0);
    },
    transactionFee() {
      return this.totalFee;
    },
    actualAmount() {
      if (this.orderType === 'BUY') {
        return this.selectedTotal - this.totalFee;
      } else {
        return this.totalAmount - this.totalFee;
      }
    }
  },
  methods: {
    async loadFeeConfiguration() {
      if (this.selectedTotal <= 0) return;
      
      try {
        this.isLoadingFee = true;
        this.feeError = null;
        const token = this.orderType === 'BUY' ? 'SEE' : 'USDT';
        const qty = this.orderType === 'BUY' ? this.selectedTotal : this.totalAmount;
        
        const response = await fetchTransactionFee(token, qty);
        if (response && response.feeConfiguration) {
          this.feeRate = response.feeConfiguration.feeValue;
          this.totalFee = response.totalFee;
        }
      } catch (error) {
        console.error('Failed to load fee configuration:', error);
        this.feeError = '无法加载手续费信息';
        // Fallback calculations
        this.feeRate = 5;
        this.totalFee = this.orderType === 'BUY' 
          ? (this.selectedTotal * this.feeRate) / 100
          : (this.totalAmount * this.feeRate) / 100;
      } finally {
        this.isLoadingFee = false;
      }
    },
    
    async open() {
      this.selectedOrderIds = [];
      await this.loadFeeConfiguration();
      this.$refs.orderSelectPopup.open();
    },
    close() {
      this.$refs.orderSelectPopup.close();
    },
    async selectOrder(order) {
      const index = this.selectedOrderIds.indexOf(order.id);
      if (index === -1) {
        this.addOrderWithBestPrice(order);
      } else {
        this.selectedOrderIds.splice(index, 1);
        if (this.partialOrders[order.id]) {
          this.$delete(this.partialOrders, order.id);
        }
      }
      // Reload fee after order selection changes
      await this.loadFeeConfiguration();
    },

    addOrderWithBestPrice(newOrder) {
      let allOrders = [...this.selectedOrderIds.map(id => 
        this.rawOrders.find(o => o.id === id)
      ), newOrder];

      allOrders.sort((a, b) => {
        const priceA = parseFloat(a.price);
        const priceB = parseFloat(b.price);
        return this.orderType === 'BUY' ? priceA - priceB : priceB - priceA;
      });

      this.selectedOrderIds = [];
      this.partialOrders = {};

      let remainingTarget = this.targetQty;

      for (const order of allOrders) {
        if (remainingTarget <= 0) break;

        const orderQty = parseFloat(order.remainingQty);
        
        if (orderQty <= remainingTarget) {
          this.selectedOrderIds.push(order.id);
          remainingTarget -= orderQty;
        } else {
          this.selectedOrderIds.push(order.id);
          this.$set(this.partialOrders, order.id, remainingTarget);
          remainingTarget = 0;
        }
      }
    },

    async showConfirmation() {
      if (this.selectedOrderIds.length === 0) {
        uni.showToast({
          title: '请选择订单',
          icon: 'none'
        });
        return;
      }
      // Refresh fee before showing confirmation
      await this.loadFeeConfiguration();
      this.$refs.confirmationPopup.open();
    },
    closeConfirmation() {
      this.$refs.confirmationPopup.close();
    },
    submitOrders() {
      const orderDetails = this.selectedOrderIds.map(id => ({
        orderId: id,
        amount: this.partialOrders[id] || this.rawOrders.find(o => o.id === id).remainingQty
      }));
      this.$emit('submit', orderDetails);
      this.closeConfirmation();
      this.close();
    }
  },
  watch: {
    // Watch for changes in selected orders and update fee
    selectedTotal: {
      async handler(newValue) {
        if (newValue > 0) {
          await this.loadFeeConfiguration();
        }
      }
    }
  }
};
</script>
