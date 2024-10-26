<template>
  <view class="uni-container">
    <view class="header">
      <button class="back-button" @click="goBack"><uni-icons type="back" size="24"></uni-icons></button>
      <text class="uni-title">转账</text>
    </view>
    
    <view class="transfer-form">
      <button class="wallet-button">钱包转账</button>
      
      <view class="input-group">
        <text>接收地址</text>
        <input type="text" v-model="recipientAddress" placeholder="请输入或长按粘贴转账地址" />
      </view>
      
      <view class="token-selector">
        <text>代币数量</text>
        <view class="token-input">
          <input type="number" v-model="amount" placeholder="0.00" />
          <select v-model="selectedToken">
            <option value="SEE">SEE</option>
            <!-- Add other token options here -->
          </select>
        </view>
      </view>
      
      <view class="balance-info">
        <text>可转数量：{{ availableBalance }} {{ selectedToken }}</text>
        <text class="all-button" @click="setMaxAmount">全部</text>
      </view>
      
      <view class="transfer-info">
        <text>转账说明</text>
        <text>• 转账地址与接收地址一致</text>
        <text>• 请确保与接收方核对</text>
        <text>• 当前可用余额不足时，无法发起转账</text>
        <text>• 交易所充值地址请勿转入非交易所</text>
        <text>  支持的代币，否则资产将不可找回</text>
      </view>
      
      <button class="confirm-button" @click="confirmTransfer">确定</button>
    </view>
  </view>
</template>

<script>
import { ref, computed } from 'vue';
import { fetchUserBalancesWithDetails } from '@/services/userService';

export default {
  setup() {
    const recipientAddress = ref('');
    const amount = ref('');
    const selectedToken = ref('SEE');
    const userBalances = ref([]);

    const availableBalance = computed(() => {
      const balance = userBalances.value.find(b => b.tokenSymbol === selectedToken.value);
      return balance ? parseFloat(balance.walletBalance) - parseFloat(balance.lockedWalletBalance) : 0;
    });

    const fetchBalances = async () => {
      try {
        const userId = 'user1'; // Replace with actual user ID retrieval logic
        const userData = await fetchUserBalancesWithDetails(userId);
        userBalances.value = userData.balances;
      } catch (error) {
        console.error('Error fetching user balances:', error);
      }
    };

    const setMaxAmount = () => {
      amount.value = availableBalance.value.toString();
    };

    const confirmTransfer = () => {
      // Implement transfer logic here
      console.log('Transfer confirmed:', {
        recipientAddress: recipientAddress.value,
        amount: amount.value,
        token: selectedToken.value
      });
    };

    const goBack = () => {
      uni.navigateBack();
    };

    // Fetch balances when component is mounted
    fetchBalances();

    return {
      recipientAddress,
      amount,
      selectedToken,
      availableBalance,
      setMaxAmount,
      confirmTransfer,
      goBack
    };
  }
};
</script>

<style scoped>
.uni-container {
  padding: 20px;
}

.header {
  display: flex;
  align-items: center;
  margin-bottom: 20px;
}

.back-button {
  background: none;
  border: none;
  padding: 0;
  margin-right: 10px;
}

.uni-title {
  font-size: 18px;
  font-weight: bold;
}

.transfer-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.wallet-button {
  background-color: #f0f0f0;
  border: none;
  padding: 10px;
  border-radius: 5px;
}

.input-group, .token-selector {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.token-input {
  display: flex;
  justify-content: space-between;
}

.balance-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.all-button {
  color: #007AFF;
}

.transfer-info {
  background-color: #f0f0f0;
  padding: 10px;
  border-radius: 5px;
}

.confirm-button {
  background-color: #007AFF;
  color: white;
  border: none;
  padding: 10px;
  border-radius: 5px;
}
</style>
