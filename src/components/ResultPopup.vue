<template>
  <view v-if="show" class="result-popup">
    <view class="result-content">
      <view class="result-icon">
        <uni-icons type="checkmarkempty" size="60" color="#ff6b35"></uni-icons>
      </view>
      <view class="result-title">交易成功</view>
      <view class="result-amount">{{ amount }}{{ token }}</view>
      <view class="result-message">恭喜你！转账成功，可前往钱包明细查看记录</view>
      <button class="btn-confirm" @click="close">关闭</button>
    </view>
  </view>
</template>

<script>
export default {
  props: {
    show: Boolean,
    success: Boolean,
    message: String,
    amount: String,
    token: String
  },
  methods: {
    close() {
      this.$emit('close');
    }
  }
};
</script>

<style lang="scss" scoped>
.result-popup {
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

.result-content {
  background-color: #fff;
  border-radius: 10px;
  padding: 30px;
  width: 80%;
  max-width: 300px;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.result-icon {
  margin-bottom: 20px;
}

.result-title {
  font-size: 24px;
  font-weight: bold;
  margin-bottom: 10px;
}

.result-amount {
  font-size: 28px;
  font-weight: bold;
  color: #ff6b35;
  margin-bottom: 20px;
}

.result-message {
  font-size: 14px;
  text-align: center;
  margin-bottom: 30px;
  color: #666;
}

.btn-confirm {
  width: 100%;
  padding: 12px;
  border: none;
  border-radius: 25px;
  font-size: 18px;
  background-color: #ff6b35;
  color: #fff;
}
</style>
