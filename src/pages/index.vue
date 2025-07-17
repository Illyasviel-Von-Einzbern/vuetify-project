<template>
  <v-container>
    <v-row justify="center">
      <v-col cols="12">
        <v-text-field
          v-model="search"
          flat
          hide-details
          placeholder="搜尋商品"
          prepend-inner-icon="mdi-magnify"
          variant="solo"
        />
        <v-chip-group v-model="selectedCategory" mandatory>
          <v-chip
            filter
            text="全部"
            :value="''"
            variant="outlined"
          />
          <v-chip
            v-for="option in categoryOptions"
            :key="option"
            filter
            :text="option"
            :value="option"
            variant="outlined"
          />
          <v-spacer />
          <v-menu>
            <template #activator="{ props }">
              <v-btn
                v-bind="props"
                append-icon="mdi-chevron-down"
                :ripple="false"
                variant="text"
              >
                排序
              </v-btn>
            </template>
            <v-list>
              <v-list-item v-for="(option, i) in sortOptions" :key="option.text" @click="selectedSort = i; page = 1">
                {{ option.text }}
              </v-list-item>
            </v-list>
          </v-menu>
        </v-chip-group>
      </v-col>
      <v-col
        v-for="product in currentPageProducts"
        :key="product._id"
        cols="12"
        lg="4"
        md="6"
      >
        <ProductCard v-bind="product" />
      </v-col>
      <v-col cols="12">
        <v-pagination
          v-model="page"
          circle
          :length="totalPages"
          :total-visible="5"
        />
      </v-col></v-row>
  </v-container>
</template>
<!-- eslint-disable-next-line -->

<script setup>
  import { ref } from 'vue'
  import { useSnackbar } from 'vuetify-use-dialog'
  import productService from '@/services/product'

  const createSnackbar = useSnackbar()

  const products = ref([])
  const filteredProducts = computed(() => {
    return products.value.filter(product => {
      const matchesSearch = product.name.toLowerCase().includes(search.value.toLowerCase())
      const matchesCategory = selectedCategory.value ? product.category === selectedCategory.value : true
      return matchesSearch && matchesCategory
    }).sort((a, b) => {
      // .sort()
      // return 0 順序不變
      // return < 0     a 在前
      // return > 0     b 在前
      // return a - b   正序
      // return b - a   倒序
      // 根據選擇的排序選項進行排序
      // sortOptions[selectedSort.value] 會是選到的排序選項
      // { text: '名稱', key: 'name', direction: 1 }
      const sortOption = sortOptions[selectedSort.value]
      // 如果是日期的排序
      if (sortOption.key === 'createdAt' || sortOption.key === 'updatedAt') {
        // 使用 new Date() 轉換日期字串為日期物件，然後進行比較
        return sortOption.direction * (new Date(a[sortOption.key]) - new Date(b[sortOption.key]))
      }
      return sortOption.direction * (a[sortOption.key] > b[sortOption.key] ? 1 : -1)
    })
  })

  const ITEMS_PER_PAGE = 2
  const page = ref(1)
  const totalPages = computed(() => {
    return Math.ceil(filteredProducts.value.length / ITEMS_PER_PAGE)
  })
  const currentPageProducts = computed(() => {
    return filteredProducts.value.slice((page.value - 1) * ITEMS_PER_PAGE, page.value * ITEMS_PER_PAGE)
    // .slice(開始索引, 結束索引)
    // 從開始索引取到結束索引，不包含結束
    // 一頁 12 筆(ITEMS_PER_PAGE)
    // 第一頁 = 0 ~ 11 = .slice(0, 12)
    // 第二頁 = 12 ~ 23 = .slice(12, 24)
    // 第三頁 = 24 ~ 35 = .slice(24, 36)
  })

  const search = ref('')

  const selectedCategory = ref('')
  const categoryOptions = ['遊戲', '電子產品', '服裝', '家居用品', '書籍', '玩具', '食品', '其他']

  const selectedSort = ref(0)
  // 選擇的排序選項索引
  const sortOptions = [
    { text: '名稱', key: 'name', direction: 1 },
    { text: '價格：低到高', key: 'price', direction: 1 },
    { text: '價格：高到低', key: 'price', direction: -1 },
    { text: '最新商品', key: 'createdAt', direction: -1 },
    { text: '最舊商品', key: 'createdAt', direction: 1 },
  ]
  // 排序選項
  // text: 顯示的文字
  // key: 排序的鍵
  // direction: 排序方向，1 為升序，-1 為降序
  // 使用 key 和 direction 來排序 products

  const getProducts = async () => {
    try {
      const { data } = await productService.get()
      products.value = data.products
    } catch (error) {
      console.error('Error fetching products:', error)
      createSnackbar({
        text: '無法載入商品資料',
        snackbarProps: {
          color: 'red',
        },
      })
    }
  }
  getProducts()
</script>

<route lang="yaml">
  meta:
    title: '首頁'
    # 標題
    login: ''
    # 有沒有登入都能看
    admin: false
    # 不是管理員也能看
</route>
