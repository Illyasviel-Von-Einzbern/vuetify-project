<template>
  <v-container>
    <v-row>
      <v-col cols="12">
        <h1 class="text-center">訂單管理</h1>
      </v-col>
      <v-divider />
      <v-col cols="12">
        <v-data-table :headers="headers" :items="orders">
          <template #[`item.cart`]="{value}">
            <ul>
              <li v-for="item in value" :key="item._id">
                {{ item.product.name }} - {{ item.quantity }} 件
              </li>
            </ul>
          </template>
        </v-data-table>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
  import { ref } from 'vue'
  import { useSnackbar } from 'vuetify-use-dialog'
  import orderService from '@/services/order'

  const createSnackbar = useSnackbar()

  const orders = ref([])

  const headers = [
    { title: 'ID', key: '_id' },
    { title: '日期', key: 'createdAt', value: item => new Date(item.createdAt).toLocaleString() },
    { title: '使用者', key: 'user', value: item => item.user.account },
    { title: '商品', key: 'cart', sortable: false },
    {
      title: '總金額',
      key: 'totalPrice',
      value: item => item.cart.reduce((total, item) => total + item.product.price * item.quantity, 0),
    },
  ]

  const getOrders = async () => {
    try {
      const { data } = await orderService.getAll()
      orders.value = data.result
    } catch (error) {
      console.error('Error fetching orders:', error)
      createSnackbar({
        text: '無法載入訂單資料',
        snackbarProps: {
          color: 'red',
        },
      })
    }
  }
  getOrders()
</script>

<route lang="yaml">
  meta:
    layout: 'admin'
    title: '訂單管理'
    login: 'login-only'
    admin: true
</route>
