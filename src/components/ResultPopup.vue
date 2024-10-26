<template>
  <view v-if="show" class="result-popup">
    <view class="result-content">
      <view class="result-icon">
        <uni-icons :type="success ? 'checkmarkempty' : 'closeempty'" size="60" :color="success ? '#4cd964' : '#dd524d'"></uni-icons>
      </view>
      <text class="result-title">{{ success ? '交易成功' : '交易失败' }}</text>
      <text class="result-message">{{ message }}</text>
      <button class="btn-confirm" @click="onClose">我知道了</button>
    </view>
  </view>
</template>

<script>
export default {
  props: {
    show: {
      type: Boolean,
      required: true
    },
    success: {
      type: Boolean,
      required: true
    },
    message: {
      type: String,
      required: true
    }
  },
  methods: {
    onClose() {
      this.$emit('close');
    }
  }
}
</script>
