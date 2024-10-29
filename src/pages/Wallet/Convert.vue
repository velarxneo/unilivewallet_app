<template>
  <view class="uni-container">
    <view class="header">
      <button class="back-button" @click="goBack"><uni-icons type="back" size="24" color="#000"></uni-icons></button>
      <text class="uni-title">闪兑</text>
    </view>

    <view class="section">
        <view class="balance">
            <text>可兑：{{ maxAmount }} USDT</text>
            <text class="all-button" @click="setMaxAmount">全部</text>
        </view>
    </view>

    <view class="section">
      <view class="input-group">
        <text>USDT数量</text>
        <input type="number" v-model="fromAmount" @input="updateToAmount" placeholder="输入USDT数量" />
      </view>

      <view class="conversion-rate">
        <text>兑换率: 1 USDT = {{ conversionRate }} DOU</text>
      </view>

      <view class="input-group">
        <text>DOU数量</text>
        <input type="number" v-model="toAmount" disabled placeholder="DOU数量" />
      </view>
    </view>

    <view class="section">
    <view class="notice">
      <uni-icons type="info" size="16" color="#FF6B35"></uni-icons>
      <text class="notice-text">温馨提示</text>
    </view>
    <view class="notice-content">
      <text>该豆仅用于购买Unilive APP服务或商品</text>
    </view>
</view>
    <view class="section">
      <view class="history-header">
        <uni-icons type="bars" size="16" color="#FF6B35"></uni-icons>
        <text class="history-title">闪兑记录</text>
      </view>
      <view v-for="(record, index) in conversionHistory" :key="index" class="history-item">
        <view class="history-item-main">
          <text class="record-description">
            {{ record.senderUserId === userId ? '兑换' : '收到' }}{{ record.amount }}{{ record.tokenSymbol }}
          </text>
          <text class="record-amount" :class="getAmountClass(record)" style="text-align: right;">
            {{ getAmountPrefix(record) }}{{ getDisplayAmount(record) }} {{ record.tokenSymbol }}
          </text>
          
        </view>
        <text class="record-date">{{ formatDate(record.timestamp) }}</text>
      </view>

      <view v-if="loading" class="loading-indicator">
        加载中...
      </view>
      
      <view v-if="noMoreData" class="end-of-list">
        没有更多数据了
      </view>
    </view>

    <view class="footer">
      <button class="uni-btn" @click="handleConvert" :disabled="!canConvert">确定兑换</button>
    </view>

    <!-- Confirmation Popup -->
    <uni-popup ref="confirmPopup" type="center">
      <view class="popup-content">
        <view class="confirmation-title">确认兑换</view>
        <view class="confirmation-details">
          <view class="detail-item">
            <text>兑换数量</text>
            <text>{{ fromAmount }} USDT</text>
          </view>
          <view class="detail-item">
            <text>获得数量</text>
            <text>{{ toAmount }} DOU</text>
          </view>
          <view class="detail-item">
            <text>兑换率</text>
            <text>1 USDT = {{ conversionRate }} DOU</text>
          </view>
        </view>
        <view class="confirmation-buttons">
          <button class="btn-cancel" :disabled="isProcessing" @click="cancelConversion">取消</button>
          <button class="btn-confirm" :disabled="isProcessing" @click="confirmConversion">
            <text v-if="!isProcessing">确认</text>
            <view v-else class="loading-container">
              <image src="/static/loading.png" class="loading-icon rotating"></image>
              <text>处理中...</text>
            </view>
          </button>
        </view>
      </view>
    </uni-popup>

    <!-- Result Popup -->
    <uni-popup ref="resultPopup" type="center">
      <view class="popup-content">
        <view class="result-icon">
          <uni-icons 
            :type="resultSuccess ? 'checkmarkempty' : 'closeempty'" 
            size="50" 
            :color="resultSuccess ? '#4CD964' : '#FF3B30'"
          />
        </view>
        <text class="result-title">{{ resultSuccess ? '兑换成功' : '兑换失败' }}</text>
        <text class="result-message">{{ resultMessage }}</text>
        <button class="uni-btn" @click="closeResult">确定</button>
      </view>
    </uni-popup>
  </view>
</template>

<script>
import { fetchConversionRate, convertTokens, fetchUserBalances, fetchConversionHistory } from '@/services/userService';

export default {
  data() {
    return {
      fromAmount: '',
      toAmount: '',
      conversionRate: 0,
      userId: '',
      fromBalance: '0',
      toBalance: '0',
      maxAmount: '0',
      conversionHistory: [],
      page: 0,
      size: 10,
      loading: false,
      noMoreData: false,
      totalPages: 0,
      showConfirmation: false,
      showResult: false,
      resultSuccess: false,
      resultMessage: '',
      isProcessing: false,
    };
  },
  computed: {
    canConvert() {
      return this.fromAmount > 0 && parseFloat(this.fromAmount) <= parseFloat(this.maxAmount);
    }
  },
  async mounted() {
    this.userId = localStorage.getItem('userId');
    await this.fetchConversionRate();
    await this.fetchBalances();
    await this.fetchConversionHistory();
  },
  methods: {
    async fetchConversionRate() {
      try {
        this.conversionRate = await fetchConversionRate('USDT', 'DOU');
      } catch (error) {
        console.error('Error fetching conversion rate:', error);
        uni.showToast({
          title: '获取兑换率失败',
          icon: 'none'
        });
      }
    },
    async fetchBalances() {
      try {
        const balances = await fetchUserBalances(this.userId);
        const usdtBalance = balances.find(b => b.tokenSymbol === 'USDT');
        const douBalance = balances.find(b => b.tokenSymbol === 'DOU');
        
        if (usdtBalance) {
          this.fromBalance = (parseFloat(usdtBalance.walletBalance) - parseFloat(usdtBalance.lockedWalletBalance)).toFixed(4);
          this.maxAmount = this.fromBalance;
        }
        
        if (douBalance) {
          this.toBalance = (parseFloat(douBalance.walletBalance) - parseFloat(douBalance.lockedWalletBalance)).toFixed(4);
        }
      } catch (error) {
        console.error('Error fetching balances:', error);
      }
    },
    setMaxAmount() {
      this.fromAmount = this.maxAmount;
      this.updateToAmount();
    },
    updateToAmount() {
      if (this.fromAmount && this.conversionRate) {
        this.toAmount = (parseFloat(this.fromAmount) * this.conversionRate).toFixed(4);
      } else {
        this.toAmount = '';
      }
    },
    async handleConvert() {
      if (!this.canConvert) {
        uni.showToast({
          title: '兑换数量超过可用余额',
          icon: 'none'
        });
        return;
      }
      this.$refs.confirmPopup.open();
    },
    cancelConversion() {
      this.$refs.confirmPopup.close();
    },
    async confirmConversion() {
      if (this.isProcessing) return;
      
      this.isProcessing = true;
      try {
        const result = await convertTokens(
          this.userId,
          'USDT',
          'DOU',
          parseFloat(this.fromAmount)
        );
        
        this.resultSuccess = true;
        this.resultMessage = `成功兑换 ${this.toAmount} DOU`;
        this.$refs.confirmPopup.close();
        this.$refs.resultPopup.open();
        
        await this.fetchBalances();
        this.page = 0;
        this.conversionHistory = [];
        await this.fetchConversionHistory();
        this.fromAmount = '';
        this.toAmount = '';
      } catch (error) {
        console.error('Error converting tokens:', error);
        this.resultSuccess = false;
        this.resultMessage = error.message || '兑换失败';
        this.$refs.confirmPopup.close();
        this.$refs.resultPopup.open();
      } finally {
        this.isProcessing = false;
      }
    },
    closeResult() {
      this.$refs.resultPopup.close();
      if (this.resultSuccess) {
        setTimeout(() => {
          this.goBack();
        }, 500);
      }
    },
    goBack() {
        uni.reLaunch({
          url: '/pages/Profile/Profile',
          success: function() {
            console.log('Successfully relaunched Profile page');
          },
          fail: function(err) {
            console.error('Failed to relaunch OTCTrading page:', err);
          }
        });
    },
    formatDate(timestamp) {
      const date = new Date(timestamp);
      return date.toLocaleString();
    },
    async fetchConversionHistory() {
      if (this.loading || this.noMoreData) return;
      
      this.loading = true;
      try {
        const data = await fetchConversionHistory(this.userId, this.page, this.size);
        
        if (data.content.length === 0) {
          this.noMoreData = true;
        } else {
          this.conversionHistory = [...this.conversionHistory, ...data.content];
          this.page++;
          this.totalPages = data.totalPages;
          this.noMoreData = this.page >= this.totalPages;
        }
      } catch (error) {
        console.error('Error fetching conversion history:', error);
        uni.showToast({
          title: '加载兑换记录失败',
          icon: 'none'
        });
      } finally {
        this.loading = false;
      }
    },
    getAmountClass(record) {
      return record.senderUserId === this.userId ? 'amount-negative' : 'amount-positive';
    },

    getAmountPrefix(record) {
      return record.senderUserId === this.userId ? '-' : '+';
    },

    getDisplayAmount(record) {
      if (record.senderUserId === this.userId) {
        // For send transactions, display amount + fee
        return (parseFloat(record.amount) + parseFloat(record.feeQty)).toFixed(4);
      } else {
        // For receive transactions, display just the amount
        return parseFloat(record.amount).toFixed(4);
      }
    }
  },
  onReachBottom() {
    if (!this.loading && !this.noMoreData) {
      this.fetchConversionHistory();
    }
  }
};
</script>
