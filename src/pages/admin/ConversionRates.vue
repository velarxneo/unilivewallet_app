<template>
  <view class="container">
    <uni-card>
      <button class="uni-btn" @click="showAddModal">Add New Rate</button>
      
      <uni-table>
        <uni-tr>
          <uni-th>From Token</uni-th>
          <uni-th>To Token</uni-th>
          <uni-th>Rate</uni-th>
          <uni-th>Actions</uni-th>
        </uni-tr>
        <uni-tr v-for="rate in rates" :key="rate.id">
          <uni-td>{{ rate.fromToken }}</uni-td>
          <uni-td>{{ rate.toToken }}</uni-td>
          <uni-td>{{ rate.rate }}</uni-td>
          <uni-td>
            <uni-icons type="edit" @click="editRate(rate)" />
            <uni-icons type="trash" @click="deleteRate(rate.id)" />
          </uni-td>
        </uni-tr>
      </uni-table>
    </uni-card>
    
    <uni-popup ref="addModal" type="dialog">
      <view class="popup-content">
        <uni-easyinput v-model="form.fromToken" placeholder="From Token" />
        <uni-easyinput v-model="form.toToken" placeholder="To Token" />
        <uni-easyinput v-model="form.rate" placeholder="Rate" />
        <button class="uni-btn" @click="saveRate">Save</button>
      </view>
    </uni-popup>
  </view>
</template>

<script>
export default {
  data() {
    return {
      rates: [],
      form: {
        fromToken: '',
        toToken: '',
        rate: ''
      }
    }
  },
  methods: {
    async loadRates() {
      const token = uni.getStorageSync('admin_token');
      const response = await uni.request({
        url: `${this.$apiBaseUrl}/api/admin/conversion-rates`,
        method: 'GET',
        header: {
          'Authorization': `Bearer ${token}`
        }
      });
      this.rates = response.data;
    },
    
    showAddModal() {
      this.$refs.addModal.open();
    },
    
    async saveRate() {
      const token = uni.getStorageSync('admin_token');
      await uni.request({
        url: `${this.$apiBaseUrl}/api/admin/conversion-rates`,
        method: 'POST',
        header: {
          'Authorization': `Bearer ${token}`
        },
        data: this.form
      });
      
      this.$refs.addModal.close();
      this.loadRates();
    }
  },
  mounted() {
    this.loadRates();
  }
}
</script> 