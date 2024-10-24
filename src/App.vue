<template>
  <view id="app">
    <!-- Your existing app content -->
    <router-view></router-view>
    <LoginPopup />
    <BottomMenu />
  </view>
</template>

<script>
import BottomMenu from './components/BottomMenu.vue'
import LoginPopup from './components/LoginPopup.vue'

export default {
	name: 'App',
	skipLoginCheck: true,
	mpType: 'app',
	components: {
		BottomMenu,
		LoginPopup
	}
}
</script>

<style>
/* Global styles */
page {
	background-color: #f8f8f8;
}
</style>
