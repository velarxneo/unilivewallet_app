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
      <button class="uni-btn" @click="handleConfirm">确定</button>
    </view>

    <!-- Confirmation Popup -->
    <uni-popup ref="popup" type="center">
      <view class="popup-content">
        <view class="confirmation-title">确认转账</view>
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
            <text>{{ parseFloat(amount).toFixed(4).padEnd(4, '0') || '0.0000' }}</text>
          </view>
          <template v-if="sendType === 'address' && !isInternalTransfer">
            <view class="detail-item-column">
              <text>Gas费用</text>
              <text>{{ parseFloat(gasFee).toFixed(4) }} {{ selectedToken }}</text>
            </view>
            <view class="detail-item-column">
              <text>手续费</text>
              <text>{{ parseFloat(transferFee).toFixed(4) }} {{ selectedToken }}</text>
            </view>
          </template>
          <view v-else class="detail-item-column">
            <text>手续费</text>
            <text>{{ parseFloat(transferFee).toFixed(4) }} {{ selectedToken }}</text>
          </view>
          <view class="detail-item-column">
            <text>实际到账</text>
            <text>{{ (parseFloat(amount) - parseFloat(totalFee)).toFixed(4) }} {{ selectedToken }}</text>
          </view>
        </view>
        <view class="confirmation-buttons">
          <button class="btn-cancel" :disabled="isProcessing" @click="cancelConfirmation">取消</button>
          <button class="btn-confirm" :disabled="isProcessing" @click="confirmTransfer">
            <text v-if="!isProcessing">确定</text>
            <view v-else class="loading-container">
              <image src="/static/loading.png" class="loading-icon rotating"></image>
              <text>处理中...</text>
            </view>
          </button>
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
        <text class="result-title">{{ transferSuccess ? '转账成功' : '转账失败' }}</text>
        <text class="result-message">{{ resultMessage }}</text>
        <button class="uni-btn" @click="closeResult">确定</button>
      </view>
    </uni-popup>
  </view>
</template>

<script>
import { fetchUserBalancesWithDetails, sendToAddress, sendToUserId, isInternalAddress, getEstimatedGasFee, withdrawBalance, fetchTransferFee } from '@/services/userService';

export default {
  data() {
    return {
      sendType: 'address',
      recipient: '',
      amount: '',
      selectedToken: '',
      userBalances: [],
      userId: '',
      transferSuccess: false,
      resultMessage: '',
      transferFee: '0',
      gasFee: '0',
      isInternalTransfer: false,
      totalFee: '0',
      isProcessing: false,
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
    async handleConfirm() {
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

      try {
        if (this.sendType === 'address') {
          const result = await isInternalAddress(this.recipient);
          this.isInternalTransfer = result.isInternal;
          
          if (result.isInternal) {
            const feeData = await fetchTransferFee(this.selectedToken, this.amount);
            this.transferFee = feeData.totalFee;
            this.totalFee = this.transferFee;
            this.sendType = 'address';
          } else {
            const [gasFeeResult, transferFeeData] = await Promise.all([
              getEstimatedGasFee(this.recipient, this.selectedToken, parseFloat(this.amount)),
              fetchTransferFee(this.selectedToken, this.amount)
            ]);
            
            this.gasFee = gasFeeResult.estimatedGasFee;
            this.transferFee = transferFeeData.totalFee;
            this.totalFee = (parseFloat(this.gasFee) + parseFloat(this.transferFee)).toFixed(4);
          }
        } else {
          const feeData = await fetchTransferFee(this.selectedToken, this.amount);
          this.transferFee = feeData.totalFee;
          this.totalFee = this.transferFee;
        }

        this.$refs.popup.open();
      } catch (error) {
        console.error('Error checking address:', error);
        uni.showToast({
          title: '地址检查失败',
          icon: 'none'
        });
      }
    },
    cancelConfirmation() {
      this.$refs.popup.close();
    },
    async confirmTransfer() {
      if (this.isProcessing) return;
      
      this.isProcessing = true;
      try {
        let result;
        
        if (this.sendType === 'address' && !this.isInternalTransfer) {
          result = await withdrawBalance(
            this.userId,
            this.selectedToken,
            parseFloat(this.amount),
            this.recipient
          );
        } else {
          if (this.sendType === 'address') {
            result = await this.sendToAddress();
          } else {
            result = await this.sendToUserId();
          }
        }

        this.transferSuccess = true;
        this.resultMessage = `成功转账 ${this.amount} ${this.selectedToken}`;
        this.$refs.popup.close();
        this.$refs.resultPopup.open();
      } catch (error) {
        this.transferSuccess = false;
        this.resultMessage = error.message || '转账失败';
        this.$refs.popup.close();
        this.$refs.resultPopup.open();
      } finally {
        this.isProcessing = false;
      }
    },
    async sendToAddress() {
      try {
        const response = await sendToAddress(
          this.userId,
          this.recipient,
          this.selectedToken,
          parseFloat(this.amount)
        );
        return response;
      } catch (error) {
        throw error;
      }
    },
    async sendToUserId() {
      try {
        const response = await sendToUserId(
          this.userId,
          this.recipient,
          this.selectedToken,
          parseFloat(this.amount)
        );
        return response;
      } catch (error) {
        throw error;
      }
    },
    goBack() {
      uni.reLaunch({
        url: '/pages/Profile/Profile',
        success: function() {
          console.log('Successfully relaunched Profile page');
        },
        fail: function(err) {
          console.error('Failed to relaunch Profile page:', err);
        }
      });
    },
    onTokenChange(e) {
      const index = e.detail.value;
      this.selectedToken = this.tokenOptions[index];
    },
    closeResult() {
      this.$refs.resultPopup.close();
      if (this.transferSuccess) {
        setTimeout(() => {
          this.goBack();
        }, 500);
      }
    },
  },
  onLoad() {
    this.fetchBalances();
  }
};
</script>

<style lang="scss" scoped>
.loading-container {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 5px;
}

.loading-icon {
  width: 16px;
  height: 16px;
}

.rotating {
  animation: rotate 1s linear infinite;
}

@keyframes rotate {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.btn-confirm {
  &:disabled {
    opacity: 0.7;
    cursor: not-allowed;
  }
}

.btn-cancel {
  &:disabled {
    opacity: 0.7;
    cursor: not-allowed;
  }
}
</style>