<template>
  <v-app-bar>
    <v-container>
      <v-app-bar-title>購物網站</v-app-bar-title>
      <!-- eslint-disable-next-line -->
      <template v-for="item of navItems" :key="item.to">
        <v-btn v-if="item.show" :prepend-icon="item.icon" :to="item.to">
          {{ item.title }}
          <v-badge v-if="item.to === '/cart' && user.cartTotal > 0" color="red" :content="user.cartTotal" floating />
        </v-btn>
      </template>
      <v-btn v-if="user.isLoggedIn" prepend-icon="mdi-logout" @click="logout">登出</v-btn>
    </v-container>
  </v-app-bar>
  <!-- eslint-disable-next-line -->
  <v-main>
    <router-view :key="$route.fullPath" />
  </v-main>
</template>

<script setup>
  import { computed } from 'vue'
  import { useRouter } from 'vue-router'
  import { useSnackbar } from 'vuetify-use-dialog'
  import userService from '@/services/user'
  import { useUserStore } from '@/stores/user'

  const user = useUserStore()
  const createSnackbar = useSnackbar()
  const router = useRouter()

  const navItems = computed(() => [
    { title: '首頁', to: '/', icon: 'mdi-home', show: true },
    { title: '註冊', to: '/register', icon: 'mdi-account-plus', show: !user.isLoggedIn },
    { title: '登入', to: '/login', icon: 'mdi-login', show: !user.isLoggedIn },
    { title: '購物車', to: '/cart', icon: 'mdi-cart', show: user.isLoggedIn },
    { title: '訂單', to: '/orders', icon: 'mdi-invoice-list-outline', show: user.isLoggedIn },
    { title: '管理', to: '/admin', icon: 'mdi-cog', show: user.isLoggedIn && user.isAdmin },
  ])

  const logout = async () => {
    try {
      await userService.logout()
    } catch (error) {
      console.error(error)
    }
    user.logout()
    router.push('/')
    createSnackbar({
      text: '登出成功！',
      snackbarProps: {
        color: 'green',
      },
    })
  }
</script>
