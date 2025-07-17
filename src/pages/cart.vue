<template>
  <v-container>
    <v-row>
      <v-col cols="12">
        <h1 class="text-center">購物車</h1>
      </v-col>
      <v-divider />
      <v-col cols="12">
        <v-list lines="two">
          <!-- eslint-disable -->
          <template
            v-for="(item, i) in cart"
            :key="item._id"
          >
          <!-- eslint-enable -->
            <v-list-item :active="!item.product.sell" color="red">
              <template #prepend>
                <!-- <v-img cover height="40" :src="item.product.image" width="40" /> -->
                <v-avatar class="cursor-pointer" rounded="0" @click="$router.push('/product/' + item.product._id)">
                  <v-img :src="item.product.image" />
                </v-avatar>
              </template>
              <v-list-item-title>
                <router-link class="text-decoration-none text-primary" :to="'/product/' + item.product._id">
                  {{ item.product.name }}
                </router-link>
              </v-list-item-title>
              <v-list-item-subtitle>
                價格： {{ item.product.price }} 元
              </v-list-item-subtitle>
              <template #append>
                <v-number-input
                  control-variant="split"
                  :min="0"
                  :model-value="item.quantity"
                  variant="outlined"
                  width="150px"
                  @update:model-value="updateCart($event, item, index)"
                />
              </template>
            </v-list-item>
            <v-divider v-if="i < cart.length - 1" />
          </template>
        </v-list>
      </v-col>
      <v-col cols="12">
        <p class="text-center">總金額： {{ totalPrice }}</p>
        <v-btn color="primary" :disabled="checkoutDisable" @click="checkout">結帳</v-btn>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
  import { computed, ref } from 'vue'
  import { useRouter } from 'vue-router'
  import { useSnackbar } from 'vuetify-use-dialog'
  import orderService from '@/services/order'
  import userService from '@/services/user'
  import { useUserStore } from '@/stores/user'

  const createSnackbar = useSnackbar()
  const user = useUserStore()
  const router = useRouter()

  const cart = ref([])

  const getCart = async () => {
    try {
      const { data } = await userService.getCart()
      cart.value = data.result
    } catch (error) {
      console.error(error)
      createSnackbar({
        text: '無法獲取購物車資料',
        snackbarProps: {
          color: 'red',
        },
      })
    }
  }
  getCart()

  const updateCart = async (newValue, item, index) => {
    try {
      const { data } = await userService.cart({
        product: item.product._id,
        quantity: newValue - item.quantity,
      })
      item.quantity = newValue
      if (newValue <= 0) {
        cart.value.splice(index, 1)
      }
      user.cartTotal = data.result
    } catch (error) {
      console.error(error)
      createSnackbar({
        text: '更新購物車失敗',
        snackbarProps: {
          color: 'red',
        },
      })
    }
  }

  const totalPrice = computed(() => {
    return cart.value.reduce((total, item) => total + item.product.price * item.quantity, 0)
  })

  const checkoutDisable = computed(() => {
    return cart.value.length === 0 || cart.value.some(item => !item.product.sell)
  })

  const checkout = async () => {
    try {
      await orderService.create()
      user.cartTotal = 0
      router.push('/orders')
    } catch (error) {
      console.error(error)
      createSnackbar({
        text: '結帳失敗',
        snackbarProps: {
          color: 'red',
        },
      })
    }
  }
</script>

<route lang="yaml">
  meta:
    title: '購物車'
    login: 'login-only'
    admin: false
</route>
