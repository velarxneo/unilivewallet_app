<template>
  <view class="uni-container">
    <uni-card>
      <view class="admin-menu">
        <button class="uni-btn" @click="navigateTo('/pages/admin/ConversionRates')">
          管理汇率
        </button>
        <button class="uni-btn" @click="navigateTo('/pages/admin/FeeConfiguration')">
          管理费用
        </button>
        <button class="uni-btn" @click="navigateTo('/pages/admin/Tokens')">
          管理代币
        </button>
      </view>
    </uni-card>
  </view>
</template>

<script>
import UniCard from '@dcloudio/uni-ui/lib/uni-card/uni-card.vue'; // Adjust the path as needed

export default {
  components: {
    UniCard
  },
  methods: {
    navigateTo(url) {
      uni.navigateTo({ url });
    }
  }
}
</script>

<style>
.container {
  padding: 20px;
}
.admin-menu {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.uni-btn {
  margin: 10px 0;
}
</style> 