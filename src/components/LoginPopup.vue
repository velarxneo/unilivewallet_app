<template>
  <view v-if="showPopup" class="login-popup">
    <view class="login-popup-content">
      <text class="login-title">Welcome Back</text>
      <br /><br />
      <text class="login-subtitle">Please enter your User ID to continue</text>
      <input 
        v-model="userId" 
        type="text" 
        class="login-input" 
        placeholder="User ID" 
      />
      <button @click="login" class="login-button">
        <text>Login</text>
      </button>
    </view>
  </view>
</template>

<script>
export default {
  data() {
    return {
      showPopup: false,
      userId: ''
    }
  },
  created() {
    this.$root.$on('showLoginPopup', this.showLoginPopup)
  },
  methods: {
    showLoginPopup() {
      this.showPopup = true
    },
    async login() {
      if (this.userId.trim()) {
        try {
          const response = await fetch(`http://localhost:8081/api/wallet/balances/user/${this.userId.trim()}`)
          if (response.ok) {
            const balances = await response.json()
            localStorage.setItem('userId', this.userId.trim())
            localStorage.setItem('userBalances', JSON.stringify(balances))
            this.showPopup = false
            this.$root.$emit('userLoggedIn', this.userId.trim(), balances)
          } else {
            throw new Error('Failed to fetch user balances')
          }
        } catch (error) {
          console.error('Error logging in:', error)
          uni.showToast({
            title: 'Login failed. Please try again.',
            icon: 'none'
          })
        }
      } else {
        uni.showToast({
          title: 'Please enter a valid User ID',
          icon: 'none'
        })
      }
    }
  }
}
</script>

<style lang="scss">
@import "../uni.scss";
</style>
