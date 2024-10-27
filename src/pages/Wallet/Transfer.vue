<template>
  <view class="uni-container">
    <view class="header">
      <button class="back-button" @click="goBack"><uni-icons type="back" size="25"></uni-icons></button>
      <text class="uni-title">转账</text>
    </view>
    
    <view class="transfer-type-header">
      <view class="transfer-type-selector">
        <text :class="{ active: transferType === 'address' }" @click="transferType = 'address'">钱包地址</text>
        <text :class="{ active: transferType === 'userId' }" @click="transferType = 'userId'">用户PID</text>
      </view>
    </view>
    <view class="section">
      <view class="input-group">
        <text class="input-label">{{ transferType === 'address' ? '接收地址' : '接收用户ID' }}</text>
        <input type="text" v-model="recipient"
          :placeholder="transferType === 'address' ? '请输入或长按粘贴转账地址' : '请输入接收用户ID'" />
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

    <view class="section">
      <view class="section-header">
        <text class="title">转账说明</text>
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
          <view class="detail-item">
            <text>{{ transferType === 'address' ? '钱包地址' : '用户ID' }}</text>
            <text class="full-text">{{ recipient }}</text>
          </view>
          <view class="detail-item">
            <text>代币类型</text>
            <text>{{ selectedToken }}</text>
          </view>
          <view class="detail-item">
            <text>转账数量</text>
            <text>{{ amount }}</text>
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
import { fetchUserBalancesWithDetails } from '@/services/userService';
import ResultPopup from '@/components/ResultPopup.vue';

export default {
  components: {
    ResultPopup
  },
  data() {
    return {
      transferType: 'address',
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
    },
    async confirmTransfer() {
      this.showConfirmationPopup = false;
      if (this.transferType === 'address') {
        await this.transferToAddress();
      } else {
        await this.transferToUserId();
      }
    },
    async transferToAddress() {
      try {
        const response = await fetch('http://localhost:8081/api/wallet/send-to-address', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            senderUserId: this.userId,
            recipientAddress: this.recipient,
            tokenSymbol: this.selectedToken,
            qty: parseFloat(this.amount)
          })
        });
        
        if (response.ok) {
          this.showTransferResult(true, '转账成功');
        } else {
          const errorData = await response.json();
          throw new Error(errorData.message || '转账失败');
        }
      } catch (error) {
        this.showTransferResult(false, error.message);
      }
    },
    async transferToUserId() {
      try {
        const response = await fetch('http://localhost:8081/api/wallet/send-to-user', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            senderUserId: this.userId,
            recipientUserId: this.recipient,
            tokenSymbol: this.selectedToken,
            qty: parseFloat(this.amount)
          })
        });
        
        if (response.ok) {
          this.showTransferResult(true, '转账成功');
        } else {
          const errorData = await response.json();
          throw new Error(errorData.message || '转账失败');
        }
      } catch (error) {
        this.showTransferResult(false, error.message);
      }
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

<style lang="scss" scoped>
// ... (previous styles remain the same) ...

.confirmation-popup {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.confirmation-content {
  background-color: #fff;
  border-radius: 10px;
  padding: 20px;
  width: 80%;
  max-width: 300px;
}

.confirmation-title {
  font-size: 18px;
  font-weight: bold;
  text-align: center;
  margin-bottom: 20px;
}

.confirmation-details {
  margin-bottom: 20px;
}

.detail-item {
  display: flex;
  flex-direction: column;
  margin-bottom: 10px;
  
  text:first-child {
    color: #999;
    font-size: 14px;
    margin-bottom: 5px;
  }
  
  text:last-child {
    font-weight: bold;
    word-break: break-all;
  }
}

.full-text {
  font-size: 12px;
  word-break: break-all;
}

.confirmation-buttons {
  display: flex;
  justify-content: space-between;
}

.btn-cancel, .btn-confirm {
  width: 45%;
  padding: 10px;
  border: none;
  border-radius: 5px;
  font-size: 16px;
}

.btn-cancel {
  background-color: #f0f0f0;
  color: #333;
}

.btn-confirm {
  background-color: $uni-color-primary;
  color: #fff;
}
</style>
