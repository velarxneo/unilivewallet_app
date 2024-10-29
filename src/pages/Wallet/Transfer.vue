<template>
  <view class="uni-container">
    <view class="header">
      <button class="back-button" @click="goBack">
        <uni-icons type="back" size="24" color="#000000"></uni-icons>
      </button>
      <text class="uni-title">划转</text>
    </view>

    <view class="section">
      <view class="input-group">
        <text>数量</text>
        <view class="input-wrapper">
          <input 
            type="number" 
            v-model="amount" 
            :placeholder="`输入${selectedToken}数量`" 
          />
          <picker :range="availableTokens" @change="onTokenChange" class="token-picker">
            <view class="picker">
              {{ selectedToken }}
              <uni-icons type="bottom" size="12"></uni-icons>
            </view>
          </picker>
        </view>
        
      </view>
      <view class="balance">
        <text>可划数量：{{ maxAmount }} {{ selectedToken }}</text>
        <text class="all-button" @click="setMaxAmount">全部</text>
      </view>
      <view class="balance">
        <text>OTC数量：{{ otcBalance }} {{ selectedToken }}</text>
    
      </view>
    </view>
    <view class="section">
      <view class="transfer-notice">
        <uni-icons type="info" size="16" color="#FF6B35"></uni-icons>
        <text class="notice-text">温馨提示</text>
      </view>
    
      <view class="notice-content">
        <text>划转到OTC账户的资产仅用于场外交易</text>
      </view>
    </view>
    <view class="section">
      <view class="history-header">
        <uni-icons type="bars" size="16" color="#FF6B35"></uni-icons>
        <text class="history-title">划转记录</text>
      </view>
      
      <view v-for="(record, index) in transferHistory" :key="index" class="history-item">
        <view class="history-item-main">
          <view>
          <text class="record-description">
            {{ record.senderUserId === userId ? '划转到OTC' : '收到' }}{{ record.amount }}{{ record.tokenSymbol }}
          </text>
          <br />
          <text class="record-date">{{ formatDate(record.timestamp) }}</text>
        </view>
          <view style="text-align: right;">
            <text class="record-amount" :class="getAmountClass(record)">
              {{ getAmountPrefix(record) }}{{ getDisplayAmount(record) }} {{ record.tokenSymbol }}
            </text>
            <br />
            <text class="record-feeQty" v-if="record.feeQty">
              手续费: {{ parseFloat(record.feeQty).toFixed(4) }} {{ record.tokenSymbol }}
            </text>
          </view>
        </view>
        
      </view>

      <!-- Add loading and end of list indicators -->
      <view v-if="loading" class="loading-indicator">
        加载中...
      </view>
      
      <view v-if="noMoreData" class="end-of-list">
        没有更多数据了
      </view>
    </view>

    <view class="footer">
      <button class="uni-btn" @click="handleTransfer" :disabled="!canTransfer">确定划转</button>
    </view>

    <!-- Update popup usage -->
    <uni-popup ref="confirmPopup" type="center" :animation="true">
      <view class="popup-content">
        <view class="confirmation-title">确认划转</view>
        <view class="confirmation-details">
          <view class="detail-item">
            <text>划转数量</text>
            <text>{{ parseFloat(amount).toFixed(4) }} {{ selectedToken }}</text>
          </view>
          
          <view class="detail-item">
            <text>手续费</text>
            <text>{{ parseFloat(fee).toFixed(4) }} {{ selectedToken }}</text>
          </view>
          <view class="detail-item">
            <text>收到</text>
            <text>{{ getTotalAmount() }} {{ selectedToken }}</text>
          </view>
        </view>
        <view class="confirmation-buttons">
          <button class="btn-cancel" @click="cancelTransfer">取消</button>
          <button class="btn-confirm" @click="confirmTransfer">确认</button>
        </view>
      </view>
    </uni-popup>

    <!-- Result Popup -->
    <uni-popup ref="resultPopup" type="center" :animation="true">
      <view class="popup-content">
        <view class="result-icon">
          <uni-icons 
            :type="transferSuccess ? 'checkmarkempty' : 'closeempty'" 
            size="50" 
            :color="transferSuccess ? '#4CD964' : '#FF3B30'"
          />
        </view>
        <text class="result-title">{{ transferSuccess ? '划转成功' : '划转失败' }}</text>
        <text class="result-message">{{ resultMessage }}</text>
        <button class="uni-btn" @click="closeResult">确定</button>
      </view>
    </uni-popup>
  </view>
</template>

<script>
import { fetchUserBalances, transferBalance, fetchTransferFee, fetchTransferHistory } from '@/services/userService';

export default {
  data() {
    return {
      userId: '',
      amount: '',
      fee: '0',
      walletBalance: '0',
      otcBalance: '0',
      maxAmount: '0',
      selectedToken: 'USDT',
      availableTokens: [],
      userBalances: [],
      transferSuccess: false,
      resultMessage: '',
      transferHistory: [],
      page: 0,
      size: 10,
      loading: false,
      noMoreData: false,
      totalPages: 0,
      feeConfig: '',
      totalFee: '0',
    };
  },
  computed: {
    canTransfer() {
      return this.amount > 0 && parseFloat(this.amount) <= parseFloat(this.maxAmount);
    }
  },
  async mounted() {
    this.userId = localStorage.getItem('userId');
    await this.fetchBalances();
    await this.fetchTransferHistory(); // Add this line
  },
  methods: {
    async fetchBalances() {
      try {
        const balances = await fetchUserBalances(this.userId);
        this.userBalances = balances;
        
        // Filter out DOU token and create available tokens list
        this.availableTokens = balances
          .filter(b => b.tokenSymbol !== 'DOU')
          .map(b => b.tokenSymbol);

        // Set default selected token if not already set
        if (!this.selectedToken && this.availableTokens.length > 0) {
          this.selectedToken = this.availableTokens[0];
        }

        this.updateBalanceDisplay();
      } catch (error) {
        console.error('Error fetching balances:', error);
      }
    },
    updateBalanceDisplay() {
      const selectedBalance = this.userBalances.find(b => b.tokenSymbol === this.selectedToken);
      if (selectedBalance) {
        this.walletBalance = (parseFloat(selectedBalance.walletBalance) - parseFloat(selectedBalance.lockedWalletBalance)).toFixed(4);
        this.otcBalance = (parseFloat(selectedBalance.otcBalance) - parseFloat(selectedBalance.lockedOtcBalance)).toFixed(4);
        this.maxAmount = this.walletBalance;
      }
    },
    onTokenChange(e) {
      const index = e.detail.value;
      this.selectedToken = this.availableTokens[index];
      this.updateBalanceDisplay();
      this.amount = ''; // Reset amount when token changes
    },
    setMaxAmount() {
      this.amount = this.maxAmount;
    },
    async handleTransfer() {
      if (!this.canTransfer) {
        uni.showToast({
          title: '划转数量超过可用余额',
          icon: 'none'
        });
        return;
      }

      try {
        // Fetch fee only when opening confirmation popup
        const feeData = await fetchTransferFee(this.selectedToken, this.amount);
      
        this.fee = feeData.totalFee; // Update to use totalFee from response
        
        // Check if total amount (including fee) exceeds balance
        const totalAmount = parseFloat(this.amount) - parseFloat(this.fee);
        if (totalAmount > parseFloat(this.maxAmount)) {
          uni.showToast({
            title: '划转数量加手续费超过可用余额',
            icon: 'none'
          });
          return;
        }

        this.$refs.confirmPopup.open();
      } catch (error) {
        console.error('Error fetching fee:', error);
        uni.showToast({
          title: '获取手续费失败',
          icon: 'none'
        });
      }
    },
    async confirmTransfer() {
      this.$refs.confirmPopup.close();
      try {
        const result = await transferBalance(this.userId, this.selectedToken, parseFloat(this.amount), true);
        this.transferSuccess = true;
        this.resultMessage = `成功划转 ${this.amount - this.fee} ${this.selectedToken} 到 OTC 账户`;
        this.$refs.resultPopup.open();
        await this.handleTransferSuccess(); // Add this line
        this.amount = '';
      } catch (error) {
        this.transferSuccess = false;
        this.resultMessage = error.message || '划转失败';
        this.$refs.resultPopup.open();
      }
    },
    cancelTransfer() {
      this.$refs.confirmPopup.close();
    },
    closeResult() {
      this.$refs.resultPopup.close();
    },
    goBack() {
      uni.reLaunch({
        url: '/pages/Profile/Profile'
      });
    },
    formatDate(timestamp) {
      const date = new Date(timestamp);
      return date.toLocaleString();
    },
    getAmountClass(record) {
      return record.senderUserId === this.userId ? 'amount-negative' : 'amount-positive';
    },
    getAmountPrefix(record) {
      return record.senderUserId === this.userId ? '-' : '+';
    },
    getDisplayAmount(record) {
      return parseFloat(record.amount).toFixed(4);
    },

    getTotalAmount() {
      const amount = parseFloat(this.amount) || 0;
      const fee = parseFloat(this.fee) || 0;
      return (amount + fee).toFixed(4);
    },

    async fetchTransferHistory() {
      if (this.loading || this.noMoreData) return;
      
      this.loading = true;
      try {
        const data = await fetchTransferHistory(this.userId, this.page, this.size);
        
        if (data.content.length === 0) {
          this.noMoreData = true;
        } else {
          this.transferHistory = [...this.transferHistory, ...data.content];
          this.page++;
          this.totalPages = data.totalPages;
          this.noMoreData = this.page >= this.totalPages;
        }
      } catch (error) {
        console.error('Error fetching transfer history:', error);
        uni.showToast({
          title: '加载划转记录失败',
          icon: 'none'
        });
      } finally {
        this.loading = false;
      }
    },

    // Add this method to handle successful transfer
    async handleTransferSuccess() {
      // Reset history data
      this.page = 0;
      this.transferHistory = [];
      this.noMoreData = false;
      
      // Refresh balances and history
      await this.fetchBalances();
      await this.fetchTransferHistory();
    }
  },
  // Add onReachBottom lifecycle hook for infinite scrolling
  onReachBottom() {
    if (!this.loading && !this.noMoreData) {
      this.fetchTransferHistory();
    }
  }
};
</script>


