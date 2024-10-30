<template>
  <view class="container">
    <uni-card>
      <button class="uni-btn" @click="showAddModal">Add New Token</button>
      
      <uni-table>
        <uni-tr>
          <uni-th>Symbol</uni-th>
          <uni-th>Name</uni-th>
          <uni-th>Contract Address</uni-th>
          <uni-th>Decimals</uni-th>
          <uni-th>Image</uni-th>
          <uni-th>Actions</uni-th>
        </uni-tr>
        <uni-tr v-for="token in tokens" :key="token.symbol">
          <uni-td>{{ token.symbol }}</uni-td>
          <uni-td>{{ token.name }}</uni-td>
          <uni-td>{{ token.contractAddress || 'N/A' }}</uni-td>
          <uni-td>{{ token.decimals }}</uni-td>
          <uni-td>
            <img :src="token.imageUrl" alt="Token Image" style="width: 40px; height: 40px;" />
          </uni-td>
          <uni-td>
            <uni-icons type="edit" @click="editToken(token)" />
            <uni-icons type="trash" @click="deleteToken(token.symbol)" />
          </uni-td>
        </uni-tr>
      </uni-table>
    </uni-card>
    
    <uni-popup ref="addModal" type="dialog">
      <view class="popup-content">
        <uni-easyinput v-model="form.symbol" placeholder="Token Symbol" />
        <uni-easyinput v-model="form.name" placeholder="Token Name" />
        <uni-easyinput v-model="form.contractAddress" placeholder="Contract Address (optional)" />
        <uni-easyinput v-model="form.decimals" placeholder="Decimals" type="number" />
        <uni-easyinput v-model="form.imageUrl" placeholder="Image URL" />
        <button class="uni-btn" @click="saveToken">Save</button>
      </view>
    </uni-popup>
  </view>
</template>

<script>
import request from '@/utils/request';

export default {
  data() {
    return {
      tokens: [],
      form: {
        symbol: '',
        name: '',
        contractAddress: '',
        decimals: 18,
        imageUrl: ''
      }
    }
  },
  methods: {
    async loadTokens() {
      try {
        const response = await request.send({
          url: `${this.$apiBaseUrl}/api/admin/tokens`,
          method: 'GET'
        });
        this.tokens = response.data;
      } catch (error) {
        uni.showToast({
          title: 'Failed to load tokens',
          icon: 'none'
        });
      }
    },
    
    showAddModal() {
      this.$refs.addModal.open();
    },
    
    async saveToken() {
      try {
        await request.send({
          url: `${this.$apiBaseUrl}/api/admin/tokens`,
          method: 'POST',
          data: this.form
        });
        
        this.$refs.addModal.close();
        this.loadTokens();
        uni.showToast({
          title: 'Token saved successfully',
          icon: 'success'
        });
      } catch (error) {
        uni.showToast({
          title: 'Failed to save token',
          icon: 'none'
        });
      }
    },
    
    async deleteToken(symbol) {
      try {
        await request.send({
          url: `${this.$apiBaseUrl}/api/admin/tokens/${symbol}`,
          method: 'DELETE'
        });
        
        this.loadTokens();
        uni.showToast({
          title: 'Token deleted successfully',
          icon: 'success'
        });
      } catch (error) {
        uni.showToast({
          title: 'Failed to delete token',
          icon: 'none'
        });
      }
    }
  },
  mounted() {
    this.loadTokens();
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