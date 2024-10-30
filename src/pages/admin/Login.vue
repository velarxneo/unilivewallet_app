<template>
  <view class="login-container">
    <view class="login-box">
      <view class="title">Admin Login</view>
      <view class="input-group">
        <input 
          class="input" 
          v-model="userId" 
          placeholder="Admin User ID"
          type="text"
        />
      </view>
      <view class="input-group">
        <input 
          class="input" 
          v-model="password" 
          placeholder="Password"
          type="password"
        />
      </view>
      <button class="login-btn" @click="handleLogin">Login</button>
    </view>
  </view>
</template>

<script>
export default {
  data() {
    return {
      userId: '',
      password: ''
    }
  },
  methods: {
    async handleLogin() {
      try {
        const response = await uni.request({
          url: `${this.$apiBaseUrl}/api/admin/auth/login`,
          method: 'POST',
          data: {
            userId: this.userId,
            password: this.password
          }
        });
        
        if (response.data.token) {
          uni.setStorageSync('admin_token', response.data.token);
          uni.navigateTo({
            url: '/pages/admin/Dashboard'
          });
        }
      } catch (error) {
        uni.showToast({
          title: 'Login failed',
          icon: 'none'
        });
      }
    }
  }
}
</script>

<style>
.login-container {
  padding: 20px;
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background-color: #f8f8f8;
}

.login-box {
  width: 90%;
  max-width: 400px;
  padding: 20px;
  background-color: #fff;
  border-radius: 12rpx;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.title {
  font-size: 32rpx;
  text-align: center;
  margin-bottom: 20px;
  color: #333;
}

.input-group {
  margin-bottom: 15px;
}

.input {
  width: 100%;
  height: 40px;
  padding: 0 15px;
  border: 1px solid #e5e5e5;
  border-radius: 6rpx;
  font-size: 28rpx;
}

.login-btn {
  width: 100%;
  height: 40px;
  background-color: #ff6b35;
  color: #fff;
  border: none;
  border-radius: 6rpx;
  font-size: 28rpx;
  margin-top: 20px;
}

.login-btn:active {
  opacity: 0.8;
}
</style> 