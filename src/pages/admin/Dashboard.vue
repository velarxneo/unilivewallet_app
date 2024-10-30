<template>
  <view class="container">
    <uni-card>
      <view class="admin-menu">
        <button class="uni-btn" @click="navigateTo('/pages/admin/ConversionRates')">
          Manage Conversion Rates
        </button>
        <button class="uni-btn" @click="navigateTo('/pages/admin/FeeConfiguration')">
          Manage Fees
        </button>
        <button class="uni-btn" @click="navigateTo('/pages/admin/Tokens')">
          Manage Tokens
        </button>
      </view>
    </uni-card>
  </view>
</template>

<script>
export default {
  methods: {
    navigateTo(url) {
      uni.navigateTo({ url });
    }
  }
}
</script>

<style>
.admin-menu {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.uni-btn {
  margin: 10px 0;
}
</style> 