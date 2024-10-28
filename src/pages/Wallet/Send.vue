<template>
  <view class="uni-container">
    <view class="header">
      <button class="back-button" @click="goBack"><uni-icons type="back" size="25"></uni-icons></button>
      <text class="uni-title">转账</text>
    </view>
    
    <view class="send-type-header">
      <view class="send-type-selector">
        <text :class="{ active: sendType === 'address' }" @click="sendType = 'address'">钱包地址</text>
        <text :class="{ active: sendType === 'userId' }" @click="sendType = 'userId'">用户PID</text>
      </view>
    </view>
    <view class="section">
      <view class="input-group">
        <text class="input-label">{{ sendType === 'address' ? '接收地址' : '接收用户ID' }}</text>
        <input type="text" v-model="recipient"
          :placeholder="sendType === 'address' ? '请输入或长按粘贴转账地址' : '请输入接收用户ID'" />
      </view>

      <view class="input-group">
        <text class="input-label">代币数量</text>
        <view class="input-wrapper">
          <input type="number" v-model="amount" placeholder="0.00" />
          <picker :range="tokenOptions" @change="onTokenChange">
            <view class="picker">
              {{ selectedToken }}
              <uni-icons type="bottom" size="12"></uni-icons>
            </view>
          </picker>
        </view>
      </view>

      <view class="balance">
        <text>可转数量：{{ availableBalance }} {{ selectedToken }}</text>
        <text class="all-button" @click="setMaxAmount">全部</text>
      </view>
    </view>

    <view class="instructions">
      <view class="instruction-header">
        <uni-icons type="info" size="20" color="#FF6B35"></uni-icons>
        <text class="instruction-title">转账说明</text>
      </view>
      <view class="info">
        <text>转账地址与接收地址一致</text>
        <text>请确保与接收方核对</text>
        <text>当前可用余额不足时，无法发起转账</text>
        <text>交易所充值地址请勿转入非交易所</text>
        <text>支持的代币，否则资产将不可找回</text>
      </view>
    </view>


    <view class="footer">
      <button class="uni-btn" @click="showConfirmation">确定</button>
    </view>

    <!-- Add this confirmation popup -->
    <view v-if="showConfirmationPopup" class="confirmation-popup">
      <view class="confirmation-content">
        <view class="confirmation-title">转账信息</view>
        <view class="confirmation-details">
          <view class="detail-item-column">
            <text>{{ sendType === 'address' ? '钱包地址' : '用户ID' }}</text>
            <text class="full-text">{{ recipient }}</text>
          </view>
          <view class="detail-item-column">
            <text>代币类型</text>
            <text>{{ selectedToken }}</text>
          </view>
          <view class="detail-item-column">
            <text>转账数量</text>
            <text>{{ parseFloat(amount).toFixed(4).padEnd(4, '0')  || '0.0000' }}</text>
          </view>
        </view>
        <view class="confirmation-buttons">
          <button class="btn-cancel" @click="cancelConfirmation">取消</button>
          <button class="btn-confirm" @click="confirmTransfer">确定</button>
        </view>
      </view>
    </view>

    <!-- Add the ResultPopup component -->
    <ResultPopup 
      :show="showResultPopup"
      :success="transactionSuccess"
      :message="resultMessage"
      :amount="amount"
      :token="selectedToken"
      @close="closeResultPopup"
    />
  </view>
</template>

<script>
import { fetchUserBalancesWithDetails, sendToAddress, sendToUserId } from '@/services/userService';
import ResultPopup from '@/components/ResultPopup.vue';

export default {
  components: {
    ResultPopup
  },
  data() {
    return {
      sendType: 'address',
      recipient: '',
      amount: '',
      selectedToken: '',
      userBalances: [],
      userId: '',
      showConfirmationPopup: false,
      showResultPopup: false,
      transactionSuccess: false,
      resultMessage: '',
    };
  },
  computed: {
    availableBalance() {
      const balance = this.userBalances.find(b => b.tokenSymbol === this.selectedToken);
      return balance ? parseFloat(balance.walletBalance) - parseFloat(balance.lockedWalletBalance) : 0;
    },
    tokenOptions() {
      return this.userBalances.map(b => b.tokenSymbol);
    }
  },
  methods: {
    async fetchBalances() {
      try {
        this.userId = localStorage.getItem('userId');
        if (!this.userId) {
          console.error('User ID not found in localStorage');
          return;
        }
        const userData = await fetchUserBalancesWithDetails(this.userId);
        this.userBalances = userData.balances;
        if (this.userBalances.length > 0) {
          this.selectedToken = this.userBalances[0].tokenSymbol;
        }
      } catch (error) {
        console.error('Error fetching user balances:', error);
      }
    },
    setMaxAmount() {
      this.amount = this.availableBalance.toString();
    },
    showConfirmation() {
      if (!this.recipient || !this.amount || !this.selectedToken) {
        uni.showToast({
          title: '请填写所有必填字段',
          icon: 'none'
        });
        return;
      }

      if (parseFloat(this.amount) > this.availableBalance) {
        uni.showToast({
          title: '余额不足',
          icon: 'none'
        });
        return;
      }

      this.showConfirmationPopup = true;
    },
    cancelConfirmation() {
      this.showConfirmationPopup = false;
      // Don't show any result popup when cancelling
    },
    async confirmTransfer() {
      this.showConfirmationPopup = false;
      try {
        let result;
        if (this.sendType === 'address') {
          result = await this.sendToAddress();
        } else {
          result = await this.sendToUserId();
        }
        
        if (result && result.success) {
          this.showTransferResult(true, '转账成功');
        } else {
          throw new Error(result.message || '转账失败');
        }
      } catch (error) {
        this.showTransferResult(false, error.message);
      }
    },
    async sendToAddress() {
      return await sendToAddress(
        this.userId,
        this.recipient,
        this.selectedToken,
        parseFloat(this.amount)
      );
    },
    async sendToUserId() {
      return await sendToUserId(
        this.userId,
        this.recipient,
        this.selectedToken,
        parseFloat(this.amount)
      );
    },
    showTransferResult(success, message) {
      this.transactionSuccess = success;
      this.resultMessage = message;
      this.showResultPopup = true;
    },
    closeResultPopup() {
      this.showResultPopup = false;
      if (this.transactionSuccess) {
        this.goBack();
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
    onTokenChange(e) {
      const index = e.detail.value;
      this.selectedToken = this.tokenOptions[index];
    },
  },
  onLoad() {
    this.fetchBalances();
  }
};
</script>

