import Vue from 'vue'
import App from './App'
import BottomMenu from './components/BottomMenu.vue'
import LoginPopup from './components/LoginPopup.vue'

import '@/uni.scss'

Vue.config.productionTip = false
Vue.prototype.$apiBaseUrl = 'http://localhost:8081' // Update this to match your backend URL

// Register BottomMenu as a global component
Vue.component('BottomMenu', BottomMenu)
Vue.component('LoginPopup', LoginPopup)

// Add a global mixin to check for login session
Vue.mixin({
  beforeCreate() {
    if (!this.$options.skipLoginCheck) {
      const userId = localStorage.getItem('userId')
      if (!userId) {
        this.$root.$emit('showLoginPopup')
      }
    }
  }
})

App.mpType = 'app'

const app = new Vue({
  ...App
})
app.$mount()
