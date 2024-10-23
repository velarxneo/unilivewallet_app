import Vue from 'vue'
import App from './App'
import BottomMenu from './components/BottomMenu.vue'

import '@/uni.scss'

Vue.config.productionTip = false
Vue.prototype.$apiBaseUrl = 'http://localhost:8081' // Update this to match your backend URL

// Register BottomMenu as a global component
Vue.component('BottomMenu', BottomMenu)

App.mpType = 'app'

const app = new Vue({
  ...App
})
app.$mount()
