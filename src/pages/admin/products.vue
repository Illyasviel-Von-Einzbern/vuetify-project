<template>
  <v-container>
    <v-row>
      <v-col cols="12">
        <h1 class="text-center">商品管理</h1>
      </v-col>
      <v-divider />
      <v-col cols="12">
        <v-data-table
          :filter-keys="filterKeys"
          :headers="headers"
          :items="products"
          :search="search"
        >
          <template #top>
            <v-toolbar>
              <div class="px-4">
                <v-btn
                  variant="outlined"
                  @click="openDialog(null)"
                >
                  新增商品
                </v-btn>
              </div>
              <v-spacer />
              <div class="px-4">
                <v-text-field
                  v-model="search"
                  density="compact"
                  flat
                  hide-details
                  placeholder="搜尋商品"
                  prepend-inner-icon="mdi-magnify"
                  variant="solo"
                  width="400"
                />
              </div>
            </v-toolbar>
          </template>
          <template #[`item.image`]="{ value }">
            <v-img :src="value" width="75" />
          </template>
          <template #[`item.sell`]="{ value }">
            <v-icon v-if="value" icon="mdi-check" />
          </template>
          <template #[`item.action`]="{ item }">
            <v-btn
              icon="mdi-pencil"
              variant="text"
              @click="openDialog(item)"
            />
          </template>
        </v-data-table>
      </v-col>
    </v-row>
  </v-container>
  <!-- <v-dialog :model-value="true" persistent width="600"> -->
  <!-- 自動顯示表單 -->
  <v-dialog
    v-model="dialog.open"
    persistent
    width="600"
  >
    <v-form
      :disabled="isSubmitting"
      @submit.prevent="submit"
    >
      <v-card>
        <v-card-title>
          {{ dialog.id.length > 0 ? '編輯商品' : '新增商品' }}
        </v-card-title>
        <v-card-text>
          <v-text-field
            v-model="name.value.value"
            :error-messages="name.errorMessage.value"
            label="名稱"
          />
          <v-text-field
            v-model.number="price.value.value"
            :error-messages="price.errorMessage.value"
            label="價格"
            min="0"
            type="number"
          />
          <v-select
            v-model="category.value.value"
            :error-messages="category.errorMessage.value"
            :items="categoryOptions"
            label="分類"
          />
          <v-textarea
            v-model="description.value.value"
            :error-messages="description.errorMessage.value"
            label="描述"
          />
          <VueFileAgent
            ref="fileAgent"
            v-model="fileRecords"
            v-model:raw-model-value="rawFileRecords"
            accept="image/jpeg,image/png"
            deletable
            :error-text="{ type: '檔案格式不正確', size: '檔案大小不得超過 1MB' }"
            help-text="選擇或拖拽檔案"
            max-size="1MB"
          />
          <v-checkbox
            v-model="sell.value.value"
            :error-messages="sell.errorMessage.value"
            hide-details
            label="上架"
          />
        </v-card-text>
        <v-card-actions>
          <v-btn
            color="red"
            :disabled="isSubmitting"
            @click="closeDialog"
          >
            取消
          </v-btn>
          <v-btn
            color="green"
            :loading="isSubmitting"
            type="submit"
          >
            {{ dialog.id.length > 0 ? '編輯' : '新增' }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-form>
  </v-dialog>
</template>

<script setup>
  import { useField, useForm } from 'vee-validate'
  import { ref, useTemplateRef } from 'vue'
  import { useSnackbar } from 'vuetify-use-dialog'
  import * as yup from 'yup'
  import productService from '@/services/product'

  const createSnackbar = useSnackbar()

  const products = ref([])
  const search = ref('')

  // ************************
  // *       表格顯示        *
  // ************************
  const headers = [
    { title: 'ID', key: '_id' },
    { title: '圖片', key: 'image', sortable: false },
    { title: '名稱', key: 'name' },
    { title: '分類', key: 'category' },
    { title: '價格', key: 'price' },
    { title: '描述', key: 'description' },
    { title: '上架', key: 'sell' },
    { title: '建立日期', key: 'createdAt', value: item => new Date(item.createdAt).toLocaleString() },
    { title: '更新日期', key: 'updatedAt', value: item => new Date(item.updatedAt).toLocaleString() },
    { title: '操作', key: 'action', sortable: false },
  ]
  // ************************
  // *       表格顯示        *
  // ************************
  const filterKeys = ['_id', 'name', 'category', 'price', 'description', 'createdAt', 'updatedAt']

  const getProducts = async () => {
    try {
      const { data } = await productService.getAll()
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

  // ************************
  // *         表單         *
  // ************************
  const fileAgent = useTemplateRef('fileAgent')
  const dialog = ref({
    open: false,
    // 控制對話框開關
    id: '',
    // 當前操作的商品 ID
    // 如果是新增商品，則為空字串
    // 如果是編輯商品，則為該商品的 ID
  })
  const openDialog = item => {
    if (item) {
      // 如果是編輯，會傳入 item，表單欄位填入該商品的資料
      dialog.value.id = item._id
      name.value.value = item.name
      price.value.value = item.price
      category.value.value = item.category
      description.value.value = item.description
      sell.value.value = item.sell
    }
    dialog.value.open = true
    // 打開表單對話框
    // 如果是新增，不會有 item
  }

  const closeDialog = () => {
    dialog.value.open = false
    // 關閉表單對話框
    dialog.value.id = ''
    resetForm()
    // 重置表單欄位
    fileAgent.value.deleteFileRecord()
    // 刪除圖片欄位的檔案
  }
  const categoryOptions = ['遊戲', '電子產品', '服裝', '家居用品', '書籍', '玩具', '食品', '其他']

  const { handleSubmit, resetForm, isSubmitting } = useForm({
    validationSchema: yup
      .object({
        name: yup
          .string()
          .required('商品名稱必須填寫')
          .max(100, '商品名稱最多只能 100 個字元'),
        price: yup
          .number()
          .typeError('價格必須填寫')
          .required('價格必須填寫')
          .min(0, '價格不能是負數'),
        category: yup
          .string()
          .required('分類必須填寫')
          .oneOf(categoryOptions, '請選擇有效的分類'),
        description: yup
          .string()
          .max(500, '描述最多只能 500 個字元'),
        sell: yup
          .boolean()
          .required('是否上架必須填寫'),
      }),
    initialValues: {
      name: '',
      price: 0,
      category: '',
      description: '',
      sell: false,
    },
  })

  const name = useField('name')
  const price = useField('price')
  const category = useField('category')
  const description = useField('description')
  const sell = useField('sell')
  const fileRecords = ref([])
  const rawFileRecords = ref([])

  const submit = handleSubmit(async values => {
    // if (fileRecords.value.length === 0 || fileRecords.value[0]?.error) {
    // 如果沒有選圖片，或是圖片欄位有錯誤，不執行
    if (fileRecords.value[0]?.error) {
      // 如果圖片欄位有錯誤，不執行
      createSnackbar({
        text: '請選擇有效的圖片檔案',
        snackbarProps: {
          color: 'red',
        },
      })
      return
    }

    if (dialog.value.id.length === 0
      && fileRecords.value.length === 0) {
      // 新增商品必須有圖片
      // 編輯商品沒有圖片就是沿用舊的圖片
      createSnackbar({
        text: '請上傳商品圖片',
        snackbarProps: {
          color: 'red',
        },
      })
      return
    }

    try {
      // 送出
      const fd = new FormData()
      // 建立 FormData 格式資料
      fd.append('name', values.name)
      fd.append('price', values.price)
      fd.append('category', values.category)
      fd.append('description', values.description)
      fd.append('sell', values.sell)
      // fd.append('image', fileRecords.value[0].file)
      // fd.append(欄位名稱, 欄位值)
      // await productService.create(fd)

      if (fileRecords.value.length > 0) {
        fd.append('image', fileRecords.value[0].file)
      }
      // 有圖片才放圖片

      await (dialog.value.id.length === 0 ? productService.create(fd) : productService.update(dialog.value.id, fd))
      // 根據動作是新增還是編輯，呼叫不同的 API

      createSnackbar({
        text: '操作成功！',
        snackbarProps: {
          color: 'green',
        },
      })
      closeDialog()
      // 關閉對話框
      getProducts()
      // 重新載入商品列表
    } catch (error) {
      console.error(error)
      createSnackbar({
        text: error?.response?.data?.message || '操作失敗，請稍後再試！',
        snackbarProps: {
          color: 'red',
        },
      })
    }
  })
  // ************************
  // *         表單         *
  // ************************

</script>

<route lang="yaml">
  meta:
    layout: 'admin'
    title: '商品管理'
    # 標題
    login: 'login-only'
    # 只能在登入的情況下看
    admin: true
    # 只有管理員能看
</route>
