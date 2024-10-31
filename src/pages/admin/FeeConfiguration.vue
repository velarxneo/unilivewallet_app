<template>
  <view class="fee-configuration-container">
    <view class="header">
      <text class="title">管理手续费配置</text>
    </view>
    <button class="uni-btn" @click="openPopup('add')">添加手续费配置</button>
    <view class="fee-configuration-list">
      <view class="table-header" style="display: flex; justify-content: space-between;">
        <text class="header-item" style="flex: 1;">交易代码</text>
        <text class="header-item" style="flex: 1;">基础代币</text>
        <text class="header-item" style="flex: 1;">报价代币</text>
        <text class="header-item" style="flex: 1;">手续费</text>
        <text class="header-item" style="flex: 1;">收费方式</text>
        <text class="header-item" style="flex: 1;">操作</text>
      </view>
      <view v-for="fee in feeConfigurations" :key="fee.id" class="fee-item" style="display: flex; justify-content: space-between;">
        <text class="fee-item-text" style="flex: 1;">{{ fee.transactionCode.code }}</text>
        <text class="fee-item-text" style="flex: 1;">{{ fee.baseTokenSymbol || 'N/A' }}</text>
        <text class="fee-item-text" style="flex: 1;">{{ fee.quoteTokenSymbol || 'N/A' }}</text>
        <text class="fee-item-text" style="flex: 1;">{{ fee.feeValue }}{{ fee.feeMethod === 'PERCENTAGE' ? '%' : '' }}</text>
        <text class="fee-item-text" style="flex: 1;">{{ getFeeMethodLabel(fee.feeMethod) }}</text>
        <view class="fee-item-actions" style="flex: 1; display: flex; justify-content: flex-end;">
          <button @click="openPopup('edit', fee)">编辑</button>
          <button @click="deleteFee(fee.id)">删除</button>
        </view>
      </view>
    </view>

    <!-- Add/Edit Popup -->
    <uni-popup ref="feePopup" type="center">
      <view class="popup-content">
        <view class="input-group">
          <input 
            v-model="newFee.transactionCode"
            placeholder="交易代码"
            type="text"
          />
        </view>
        <view class="input-group">
          <input 
            v-model="newFee.baseTokenSymbol"
            placeholder="基础代币"
            type="text"
          />
        </view>
        <view class="input-group">
          <input 
            v-model="newFee.quoteTokenSymbol"
            placeholder="报价代币"
            type="text"
          />
        </view>
        <view class="input-group">
          <input 
            v-model.number="newFee.feeValue"
            placeholder="手续费"
            type="number"
            step="0.01"
            min="0"
          />
        </view>
        <view class="input-group">
          <select 
            v-model="newFee.feeMethod"
            class="fee-method-select"
          >
            <option value="PERCENTAGE">百分比</option>
            <option value="FLAT">固定金额</option>
          </select>
        </view>
        <button @click="isEditing ? updateFee() : addFee()" class="uni-btn">
          {{ isEditing ? '更新手续费配置' : '添加手续费配置' }}
        </button>
      </view>
    </uni-popup>
  </view>
</template>

<script>
import { uniPopup } from '@dcloudio/uni-ui'

export default {
  components: {
    uniPopup
  },
  data() {
    return {
      feeConfigurations: [],
      newFee: {
        id: null,
        transactionCode: '',
        baseTokenSymbol: '',
        quoteTokenSymbol: '',
        feeValue: 0,
        feeMethod: 'PERCENTAGE'
      },
      isEditing: false
    }
  },
  methods: {
    async fetchFeeConfigurations() {
      try {
        const [error, response] = await uni.request({
          url: `${this.$apiBaseUrl}/api/admin/fee-configurations`,
          method: 'GET',
          header: {
            'Content-Type': 'application/json'
          }
        });

        if (error) throw error;

        if (!response.data) {
          throw new Error('No data received');
        }

        console.log('Fetched configurations:', response.data);
        this.feeConfigurations = response.data;
      } catch (error) {
        console.error('Error fetching fee configurations:', error);
        uni.showToast({
          title: '获取数据失败',
          icon: 'none'
        });
      }
    },
    openPopup(action, fee = null) {
      if (!this.$refs.feePopup) {
        console.error('Popup reference not found');
        return;
      }
      if (action === 'edit' && fee) {
        this.newFee = {
          id: fee.id,
          transactionCode: fee.transactionCode.code,
          baseTokenSymbol: fee.baseTokenSymbol,
          quoteTokenSymbol: fee.quoteTokenSymbol,
          feeValue: fee.feeValue,
          feeMethod: fee.feeMethod || 'PERCENTAGE'
        };
        this.isEditing = true;
      } else {
        console.log('Resetting form');
        this.resetForm();
        this.isEditing = false;
      }
      this.$refs.feePopup.open();
    },
    closePopup() {
      if (!this.$refs.feePopup) {
        console.error('Popup reference not found');
        return;
      }
      this.$refs.feePopup.close();
    },
    async addFee() {
      try {
        if (!this.newFee.transactionCode || this.newFee.feeValue === null) {
          uni.showToast({
            title: '请填写所有必填字段',
            icon: 'none'
          });
          return;
        }

        const feeData = {
          transactionCode: {
            code: this.newFee.transactionCode
          },
          baseTokenSymbol: this.newFee.baseTokenSymbol || null,
          quoteTokenSymbol: this.newFee.quoteTokenSymbol || null,
          feeValue: parseFloat(this.newFee.feeValue),
          feeMethod: this.newFee.feeMethod
        };

        console.log('Sending data:', feeData);

        const [error, response] = await uni.request({
          url: `${this.$apiBaseUrl}/api/admin/fee-configurations`,
          method: 'POST',
          header: {
            'Content-Type': 'application/json'
          },
          data: feeData
        });

        if (error) {
          console.error('Request error:', error);
          throw error;
        }

        if (!response.data) {
          throw new Error('No response data received');
        }

        await this.fetchFeeConfigurations();
        this.closePopup();
        
        uni.showToast({
          title: '添加成功',
          icon: 'success'
        });
      } catch (error) {
        console.error('Error adding fee configuration:', error);
        uni.showToast({
          title: '添加失败',
          icon: 'none'
        });
      }
    },
    async updateFee() {
      try {
        if (!this.newFee.transactionCode || this.newFee.feeValue === null) {
          uni.showToast({
            title: '请填写所有必填字段',
            icon: 'none'
          });
          return;
        }

        const feeData = {
          id: this.newFee.id,
          transactionCode: {
            code: this.newFee.transactionCode
          },
          baseTokenSymbol: this.newFee.baseTokenSymbol || null,
          quoteTokenSymbol: this.newFee.quoteTokenSymbol || null,
          feeValue: parseFloat(this.newFee.feeValue),
          feeMethod: this.newFee.feeMethod
        };

        console.log('Updating with data:', feeData);

        const [error, response] = await uni.request({
          url: `${this.$apiBaseUrl}/api/admin/fee-configurations/${this.newFee.id}`,
          method: 'PUT',
          header: {
            'Content-Type': 'application/json'
          },
          data: feeData
        });

        if (error) {
          console.error('Request error:', error);
          throw error;
        }

        if (!response.data) {
          throw new Error('No response data received');
        }

        await this.fetchFeeConfigurations();
        this.closePopup();
        
        uni.showToast({
          title: '更新成功',
          icon: 'success'
        });
      } catch (error) {
        console.error('Error updating fee configuration:', error);
        uni.showToast({
          title: '更新失败',
          icon: 'none'
        });
      }
    },
    async deleteFee(feeId) {
      try {
        const [error] = await uni.request({
          url: `${this.$apiBaseUrl}/api/admin/fee-configurations/${feeId}`,
          method: 'DELETE'
        });
        if (error) throw error;
        this.feeConfigurations = this.feeConfigurations.filter(fee => fee.id !== feeId);
      } catch (error) {
        console.error('Error deleting fee configuration:', error);
      }
    },
    resetForm() {
      this.newFee = {
        id: null,
        transactionCode: '',
        baseTokenSymbol: '',
        quoteTokenSymbol: '',
        feeValue: 0,
        feeMethod: 'PERCENTAGE'
      };
      this.isEditing = false;
      console.log('Form reset to:', this.newFee);
    },
    goBack() {
      uni.navigateTo({
        url: '/pages/admin/Dashboard'
      });
    },
    getFeeMethodLabel(method) {
      const methods = {
        'PERCENTAGE': '百分比',
        'FLAT': '固定金额'
      };
      return methods[method] || method;
    }
  },
  mounted() {
    this.fetchFeeConfigurations();
  },
  created() {
    // Initialize any necessary popup state
    this.$nextTick(() => {
      if (!this.$refs.feePopup) {
        console.warn('Popup not mounted on created');
      }
    });
  }
}
</script>

<style>
.fee-configuration-container {
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
  font-weight: bold;
}

.fee-configuration-list {
  margin: 20px 0;
}

.table-header, .fee-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 0;
  border-bottom: 1px solid #ddd;
}

.header-item, .fee-item-text {
  flex: 1;
  text-align: center;
}

.fee-item-actions {
  display: flex;
  gap: 10px;
}

.popup-content {
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.uni-btn {
  background-color: #4CAF50;
  color: white;
  padding: 10px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
}

.fee-method-select {
  width: 100%;
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
  background-color: white;
  font-size: 14px;
}

.input-group {
  margin-bottom: 15px;
}

.input-group input,
.input-group select {
  width: 100%;
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
}

.input-group label {
  display: block;
  margin-bottom: 5px;
  font-size: 14px;
  color: #666;
}

/* Add these styles for better mobile display */
@media screen and (max-width: 768px) {
  .fee-item, .table-header {
    font-size: 12px;
  }
  
  .fee-item-actions button {
    padding: 4px 8px;
    font-size: 12px;
  }
}
</style> 