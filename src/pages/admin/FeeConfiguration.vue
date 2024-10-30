<template>
  <view class="container">
    <uni-card>
      <button class="uni-btn" @click="showAddModal">Add New Fee Configuration</button>
      
      <uni-table>
        <uni-tr>
          <uni-th>Transaction Code</uni-th>
          <uni-th>Base Token</uni-th>
          <uni-th>Quote Token</uni-th>
          <uni-th>Fee Value</uni-th>
          <uni-th>Fee Method</uni-th>
          <uni-th>Actions</uni-th>
        </uni-tr>
        <uni-tr v-for="fee in fees" :key="fee.id">
          <uni-td>{{ fee.transactionCode.code }}</uni-td>
          <uni-td>{{ fee.baseTokenSymbol || 'All' }}</uni-td>
          <uni-td>{{ fee.quoteTokenSymbol || 'All' }}</uni-td>
          <uni-td>{{ fee.feeValue }}</uni-td>
          <uni-td>{{ fee.feeMethod }}</uni-td>
          <uni-td>
            <uni-icons type="edit" @click="editFee(fee)" />
            <uni-icons type="trash" @click="deleteFee(fee.id)" />
          </uni-td>
        </uni-tr>
      </uni-table>
    </uni-card>
    
    <uni-popup ref="addModal" type="dialog">
      <view class="popup-content">
        <uni-easyinput v-model="form.transactionCode" placeholder="Transaction Code" />
        <uni-easyinput v-model="form.baseTokenSymbol" placeholder="Base Token Symbol (optional)" />
        <uni-easyinput v-model="form.quoteTokenSymbol" placeholder="Quote Token Symbol (optional)" />
        <uni-easyinput v-model="form.feeValue" placeholder="Fee Value" />
        <uni-data-select v-model="form.feeMethod" :localdata="feeMethods" />
        <button class="uni-btn" @click="saveFee">Save</button>
      </view>
    </uni-popup>
  </view>
</template>

<script>
import request from '@/utils/request';

export default {
  data() {
    return {
      fees: [],
      form: {
        transactionCode: '',
        baseTokenSymbol: '',
        quoteTokenSymbol: '',
        feeValue: '',
        feeMethod: 'PERCENTAGE'
      },
      feeMethods: [
        { value: 'PERCENTAGE', text: 'Percentage' },
        { value: 'FLAT', text: 'Flat' }
      ]
    }
  },
  methods: {
    async loadFees() {
      try {
        const response = await request.send({
          url: `${this.$apiBaseUrl}/api/admin/fees`,
          method: 'GET'
        });
        this.fees = response.data;
      } catch (error) {
        uni.showToast({
          title: 'Failed to load fees',
          icon: 'none'
        });
      }
    },
    
    showAddModal() {
      this.$refs.addModal.open();
    },
    
    async saveFee() {
      try {
        await request.send({
          url: `${this.$apiBaseUrl}/api/admin/fees`,
          method: 'POST',
          data: this.form
        });
        
        this.$refs.addModal.close();
        this.loadFees();
        uni.showToast({
          title: 'Fee saved successfully',
          icon: 'success'
        });
      } catch (error) {
        uni.showToast({
          title: 'Failed to save fee',
          icon: 'none'
        });
      }
    },
    
    async deleteFee(id) {
      try {
        await request.send({
          url: `${this.$apiBaseUrl}/api/admin/fees/${id}`,
          method: 'DELETE'
        });
        
        this.loadFees();
        uni.showToast({
          title: 'Fee deleted successfully',
          icon: 'success'
        });
      } catch (error) {
        uni.showToast({
          title: 'Failed to delete fee',
          icon: 'none'
        });
      }
    }
  },
  mounted() {
    this.loadFees();
  }
}
</script>

<style>
.popup-content {
  padding: 20px;
}

.uni-btn {
  margin: 10px 0;
}
</style> 