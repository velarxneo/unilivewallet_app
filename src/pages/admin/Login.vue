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
      <button class="uni-btn" @click="handleLogin">Login</button>
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
        const [error, response] = await uni.request({
          url: `${this.$apiBaseUrl}/api/admin/auth/login`,
          method: 'POST',
          header: {
            'Content-Type': 'application/json'
          },
          data: {
            userId: this.userId,
            password: this.password
          }
        });

        if (error) {
          throw error;
        }

        console.log('Login response:', response);

        if (response.statusCode === 200 && response.data.token) {
          uni.setStorageSync('admin_token', response.data.token);

          uni.showToast({
            title: '登录成功',
            icon: 'success',
            duration: 2000
          });

          setTimeout(() => {
            uni.reLaunch({
              url: '/pages/admin/Dashboard',
              success: function() {
                console.log('Successfully navigated to Dashboard');
              },
              fail: function(err) {
                console.error('Failed to navigate:', err);
              }
            });
          }, 2000);
        } else {
          const errorMessage = response.data?.message || 
                             (response.statusCode === 401 ? '用户名或密码错误' : '登录失败');
          uni.showToast({
            title: errorMessage,
            icon: 'none',
            duration: 2000
          });
        }
      } catch (error) {
        console.error('Login error:', error);
        uni.showToast({
          title: '网络错误，请稍后重试',
          icon: 'none',
          duration: 2000
        });
      }
    }
  }
}
</script>
