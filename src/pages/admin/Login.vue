<template>
  <view class="login-container">
    <view class="login-box">
      <view class="title">管理员登录</view>
      <view class="input-group">
        <input 
          class="input" 
          v-model="userId" 
          placeholder="管理员用户ID"
          type="text"
          @keyup.enter="handleLogin"
        />
      </view>
      <view class="input-group">
        <input 
          class="input" 
          v-model="password" 
          placeholder="密码"
          type="password"
          @keyup.enter="handleLogin"
        />
      </view>
      <button class="uni-btn" @click="handleLogin">登录</button>
      <view v-if="errorMessage" class="error-message">{{ errorMessage }}</view>
    </view>
  </view>
</template>

<script>
export default {
  name: 'AdminLogin',
  data() {
    return {
      userId: '',
      password: '',
      errorMessage: ''
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
                console.log('成功导航到仪表板');
              },
              fail: function(err) {
                console.error('导航失败:', err);
              }
            });
          }, 2000);
        } else {
          this.errorMessage = '登录失败';
          uni.showToast({
            title: this.errorMessage,
            icon: 'none',
            duration: 2000
          });
        }
      } catch (error) {
        console.error('登录错误:', error);
        this.errorMessage = '网络错误，请稍后重试';
        uni.showToast({
          title: this.errorMessage,
          icon: 'none',
          duration: 2000
        });
      }
    }
  },
  onLoad() {
    console.log('管理员登录页面加载');
    if (typeof window !== 'undefined' && window.document) {
      // Hide bottom menu if it exists
      const bottomMenu = document.querySelector('.bottom-menu');
      if (bottomMenu) {
        bottomMenu.style.display = 'none';
      }
    }
  },
  onUnload() {
    if (typeof window !== 'undefined' && window.document) {
      // Show bottom menu again when leaving the page
      const bottomMenu = document.querySelector('.bottom-menu');
      if (bottomMenu) {
        bottomMenu.style.display = 'block';
      }
    }
  }
}
</script>

<style>
.login-container {
  min-height: 100vh;
  background-color: #fff;
}

.error-message {
  color: red;
  margin-top: 10px;
}
</style>
