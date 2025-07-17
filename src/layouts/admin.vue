<template>
  <v-navigation-drawer permanent>
    <v-list>
      <v-list-item :prepend-avatar="`https://api.dicebear.com/9.x/thumbs/png/seed=${user.account}`" :title="user.account" />
    </v-list>
    <v-divider />
    <v-list>
      <v-list-item
        v-for="item of navItems"
        :key="item.to"
        :prepend-icon="item.icon"
        :title="item.title"
        :to="item.to"
      />
    </v-list>
  </v-navigation-drawer>
  <!-- eslint-disable-next-line -->
  <v-main>
    <router-view />
  </v-main>
</template>

<script setup>
  import { useUserStore } from '@/stores/user'

  const user = useUserStore()

  const navItems = [
    { title: '商品管理', to: '/admin/products', icon: 'mdi-shopping' },
    { title: '訂單管理', to: '/admin/orders', icon: 'mdi-invoice-list-outline' },
    { title: '首頁', to: '/', icon: 'mdi-home' },
  ]
</script>
