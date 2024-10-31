<template>
  <view class="conversion-rates-container">
    <view class="header">
      <button @click="goBack" class="back-button">返回</button>
      <text class="title">管理汇率</text>
    </view>
    <view class="conversion-rates-list">
      <view v-for="rate in conversionRates" :key="rate.id" class="rate-item">
        <text>{{ rate.fromCurrency }} to {{ rate.toCurrency }}: {{ rate.rate }}</text>
        <button @click="editRate(rate)">编辑</button>
        <button @click="deleteRate(rate.id)">删除</button>
      </view>
    </view>
    <button @click="addRate" class="add-button">添加汇率</button>
  </view>
</template>

<script>
export default {
  data() {
    return {
      conversionRates: [] // This will hold the list of conversion rates
    }
  },
  methods: {
    goBack() {
      uni.navigateBack();
    },
    fetchConversionRates() {
      // Fetch conversion rates from the server
      // Example: this.conversionRates = await fetchConversionRatesFromServer();
    },
    addRate() {
      // Logic to add a new conversion rate
    },
    editRate(rate) {
      // Logic to edit an existing conversion rate
    },
    deleteRate(rateId) {
      // Logic to delete a conversion rate
    }
  },
  mounted() {
    this.fetchConversionRates();
  }
}
</script>

<style>
.conversion-rates-container {
  padding: 20px;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.back-button {
  background-color: #f0f0f0;
  border: none;
  padding: 10px;
  border-radius: 5px;
}

.title {
  font-size: 24px;
  font-weight: bold;
}

.conversion-rates-list {
  margin-bottom: 20px;
}

.rate-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.add-button {
  background-color: #4CAF50;
  color: white;
  padding: 10px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
}
</style> 