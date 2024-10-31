<template>
  <view class="uni-container">
    <view class="header">
      <text class="uni-title">代币管理</text>
    </view>

    <uni-table>
      <uni-tr>
        <uni-th>代币符号</uni-th>
        <uni-th>名称</uni-th>
        <uni-th>合约地址</uni-th>
        <uni-th>小数位数</uni-th>
        <uni-th>操作</uni-th>
      </uni-tr>
      <uni-tr v-for="token in tokens" :key="token.symbol">
        <uni-td>{{ token.symbol }}</uni-td>
        <uni-td>{{ token.name }}</uni-td>
        <uni-td>{{ token.contractAddress || '暂无' }}</uni-td>
        <uni-td>{{ token.decimals }}</uni-td>
        <uni-td>
          <button class="edit-btn" @click="editToken(token)">编辑</button>
          <button class="delete-btn" @click="deleteToken(token)">删除</button>
        </uni-td>
      </uni-tr>
    </uni-table>

    <button class="add-btn" @click="showAddTokenModal">添加代币</button>

    <!-- Add/Edit Token Modal -->
    <uni-popup ref="tokenModal" type="dialog">
      <view class="popup-content">
        <text class="confirmation-title">{{ isEditing ? '编辑代币' : '添加代币' }}</text>
        <view class="input-group">
            <input v-model="tokenForm.symbol" placeholder="代币符号" :disabled="isEditing" />
        </view>
        <view class="input-group">
          <input v-model="tokenForm.name" placeholder="名称" />
        </view>
        <view class="input-group"> 
          <input v-model="tokenForm.contractAddress" placeholder="合约地址" />
        </view>
        <view class="input-group">
          <input v-model="tokenForm.decimals" type="number" placeholder="小数位数" />
        </view>
        <view class="input-group">
          <view class="image-upload">
            <view class="preview" v-if="tokenForm.imageUrl">
              <image :src="`/static/images/tokens/${tokenForm.imageUrl}`" mode="aspectFit" />
            </view>
            <text class="upload-hint">图片名称: {{ tokenForm.symbol.toUpperCase() }}.png</text>
          </view>
        </view>
        <view class="confirmation-buttons">
          <button class="btn-cancel" @click="closeModal">取消</button>
          <button class="btn-confirm" @click="saveToken">保存</button>
        </view>
      </view>
    </uni-popup>
  </view>
</template>

<script>
import { uniTable, uniTr, uniTh, uniTd } from '@dcloudio/uni-ui'

export default {
  components: {
    uniTable,
    uniTr,
    uniTh,
    uniTd
  },
  data() {
    return {
      tokens: [],
      isEditing: false,
      tokenForm: {
        symbol: '',
        name: '',
        contractAddress: '',
        decimals: 18,
        imageUrl: ''
      }
    }
  },
  methods: {
    async fetchTokens() {
      try {
        const [error, response] = await uni.request({
          url: `${this.$apiBaseUrl}/api/admin/tokens`,
          method: 'GET',
          header: {
            'Authorization': `Bearer ${uni.getStorageSync('admin_token')}`
          }
        });

        if (error) {
          throw error;
        }

        if (response.statusCode === 200) {
          this.tokens = response.data;
        }
      } catch (error) {
        console.error('Error fetching tokens:', error);
        uni.showToast({
          title: '获取代币列表失败',
          icon: 'none'
        });
      }
    },
    showAddTokenModal() {
      this.isEditing = false;
      this.tokenForm = {
        symbol: '',
        name: '',
        contractAddress: '',
        decimals: 18,
        imageUrl: ''
      };
      this.$refs.tokenModal.open();
    },
    editToken(token) {
      this.isEditing = true;
      this.tokenForm = { ...token };
      this.$refs.tokenModal.open();
    },
    async deleteToken(token) {
      try {
        const [error, response] = await uni.request({
          url: `${this.$apiBaseUrl}/api/admin/tokens/${token.symbol}`,
          method: 'DELETE',
          header: {
            'Authorization': `Bearer ${uni.getStorageSync('admin_token')}`
          }
        });

        if (error) {
          throw error;
        }

        if (response.statusCode === 200) {
          uni.showToast({
            title: '删除代币成功',
            icon: 'success'
          });
          this.fetchTokens();
        }
      } catch (error) {
        console.error('Error deleting token:', error);
        uni.showToast({
          title: '删除代币失败',
          icon: 'none'
        });
      }
    },
    async saveToken() {
      try {
        const tokenData = {
          ...this.tokenForm,
          imageUrl: `${this.tokenForm.symbol.toUpperCase()}.png`
        };

        const url = this.isEditing 
          ? `${this.$apiBaseUrl}/api/admin/tokens/${this.tokenForm.symbol}`
          : `${this.$apiBaseUrl}/api/admin/tokens`;
        
        const [error, response] = await uni.request({
          url,
          method: this.isEditing ? 'PUT' : 'POST',
          header: {
            'Authorization': `Bearer ${uni.getStorageSync('admin_token')}`,
            'Content-Type': 'application/json'
          },
          data: tokenData
        });

        if (error) {
          throw error;
        }

        if (response.statusCode === 200) {
          uni.showToast({
            title: this.isEditing ? '更新代币成功' : '添加代币成功',
            icon: 'success'
          });
          this.closeModal();
          this.fetchTokens();
        }
      } catch (error) {
        console.error('Error saving token:', error);
        uni.showToast({
          title: '保存代币失败',
          icon: 'none'
        });
      }
    },
    closeModal() {
      this.$refs.tokenModal.close();
      this.tokenForm = {
        symbol: '',
        name: '',
        contractAddress: '',
        decimals: 18,
        imageUrl: ''
      };
    }
  },
  mounted() {
    this.fetchTokens();
  }
}
</script>

<style>
/* ... existing styles ... */

.image-upload {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  margin: 10px 0;
}

.preview {
  width: 64px;
  height: 64px;
  border: 1px solid #ddd;
  border-radius: 8px;
  overflow: hidden;
}

.preview image {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.upload-hint {
  font-size: 12px;
  color: #999;
}
</style>
