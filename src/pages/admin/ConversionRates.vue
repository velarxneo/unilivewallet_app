<template>
  <view class="uni-container">
    <view class="header">
      <text class="title">管理汇率</text>
    </view>
    <uni-card>
      <view class="admin-menu">
        <button class="uni-btn" @click="openPopup('add')">添加汇率</button>
      </view>
    </uni-card>
    
    <view class="conversion-rates-list">
      <view class="table-header" style="display: flex; justify-content: space-between;">
        <text class="header-item" style="flex: 1;">源代币</text>
        <text class="header-item" style="flex: 1;">目标代币</text>
        <text class="header-item" style="flex: 1;">汇率</text>
        <text class="header-item" style="flex: 1;">操作</text>
      </view>
      <view v-for="rate in conversionRates" :key="rate.id" class="rate-item" style="display: flex; justify-content: space-between;">
        <text class="rate-item-text" style="flex: 1;">{{ rate.fromToken }}</text>
        <text class="rate-item-text" style="flex: 1;">{{ rate.toToken }}</text>
        <text class="rate-item-text" style="flex: 1;">{{ rate.rate }}</text>
        <view class="rate-item-actions" style="flex: 1; display: flex; justify-content: flex-end;">
          <button @click="openPopup('edit', rate)">编辑</button>
          <button @click="deleteRate(rate.id)">删除</button>
        </view>
      </view>
    </view>

    <!-- Add/Edit Popup -->
    <uni-popup ref="ratePopup" type="center">
      <view class="popup-content">
        <view class="input-group">
          <input v-model="newRate.fromToken" placeholder="源代币" />
        </view>
        <view class="input-group">
          <input v-model="newRate.toToken" placeholder="目标代币" />
        </view>
        <view class="input-group">
          <input v-model.number="newRate.rate" placeholder="汇率" type="number" />
        </view>
        <button @click="isEditing ? updateRate() : addRate()" class="uni-btn">
          {{ isEditing ? '更新汇率' : '添加汇率' }}
        </button>
      </view>
    </uni-popup>
  </view>
</template>

<script>
export default {
  data() {
    return {
      conversionRates: [],
      newRate: {
        id: null,
        fromToken: '',
        toToken: '',
        rate: null
      },
      isEditing: false
    }
  },
  methods: {
    async fetchConversionRates() {
      try {
        const [error, response] = await uni.request({
          url: `${this.$apiBaseUrl}/api/admin/conversion-rates`,
          method: 'GET'
        });
        if (error) throw error;
        this.conversionRates = response.data;
      } catch (error) {
        console.error('Error fetching conversion rates:', error);
      }
    },
    openPopup(action, rate = null) {
      console.log('Opening popup with action:', action); // Debugging line
      if (action === 'edit' && rate) {
        this.newRate = { ...rate };
        this.isEditing = true;
      } else {
        this.resetForm();
        this.isEditing = false;
      }
      this.$refs.ratePopup.open();
    },
    closePopup() {
      this.$refs.ratePopup.close();
    },
    async addRate() {
      try {
        console.log('Adding rate:', this.newRate); // Debugging line
        const [error, response] = await uni.request({
          url: `${this.$apiBaseUrl}/api/admin/conversion-rates`,
          method: 'POST',
          data: this.newRate
        });
        if (error) throw error;
        this.conversionRates.push(response.data);
        this.closePopup();
      } catch (error) {
        console.error('Error adding conversion rate:', error);
      }
    },
    async updateRate() {
      try {
        console.log('Updating rate:', this.newRate); // Debugging line
        const [error, response] = await uni.request({
          url: `${this.$apiBaseUrl}/api/admin/conversion-rates/${this.newRate.id}`,
          method: 'PUT',
          data: this.newRate
        });
        if (error) throw error;
        const index = this.conversionRates.findIndex(r => r.id === this.newRate.id);
        if (index !== -1) {
          this.conversionRates.splice(index, 1, response.data);
        }
        this.closePopup();
      } catch (error) {
        console.error('Error updating conversion rate:', error);
      }
    },
    async deleteRate(rateId) {
      try {
        const [error] = await uni.request({
          url: `${this.$apiBaseUrl}/api/admin/conversion-rates/${rateId}`,
          method: 'DELETE'
        });
        if (error) throw error;
        this.conversionRates = this.conversionRates.filter(rate => rate.id !== rateId);
      } catch (error) {
        console.error('Error deleting conversion rate:', error);
      }
    },
    resetForm() {
      this.newRate = { id: null, fromToken: '', toToken: '', rate: null };
      this.isEditing = false;
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

.title {
  font-size: 24px;
  color: #ffffff;
}

.conversion-rates-list {
  margin: 20px 0;
}

.table-header, .rate-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 0;
  border-bottom: 1px solid #ddd;
}

.header-item, .rate-item-text {
  flex: 1;
  text-align: center;
}

.rate-item-actions {
  display: flex;
  gap: 10px;
}

.popup-content {
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

</style> 