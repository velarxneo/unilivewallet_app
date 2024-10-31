import Vue from 'vue'
import App from './App'
import BottomMenu from './components/BottomMenu.vue'
import LoginPopup from './components/LoginPopup.vue'
import UniPopup from '@dcloudio/uni-ui/lib/uni-popup/uni-popup.vue'
import UniTransition from '@dcloudio/uni-ui/lib/uni-transition/uni-transition.vue'
import UniIcons from '@dcloudio/uni-ui/lib/uni-icons/uni-icons.vue'; // Adjust the path as needed
import { 
  uniTable,
  uniTr,
  uniTh,
  uniTd,
  uniPopup
} from '@dcloudio/uni-ui'

Vue.component('uni-popup', UniPopup);
Vue.component('uni-transition', UniTransition);
Vue.component('uni-icons', UniIcons);
Vue.component('uni-table', uniTable)
Vue.component('uni-tr', uniTr)
Vue.component('uni-th', uniTh)
Vue.component('uni-td', uniTd)
Vue.component('uni-popup', uniPopup)
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

// Add this if not already present
app.config.globalProperties.$apiBaseUrl = process.env.NODE_ENV === 'development' 
  ? 'http://localhost:8080'  // Change this to match your backend port
  : 'https://your-production-api.com';
