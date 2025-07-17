<template>
  <v-container>
    <v-row>
      <v-col cols="12">
        <h1 class="text-center">登入</h1>
      </v-col>
      <v-divider />
      <v-col cols="12">
        <v-form :disabled="form.isSubmitting.value" @submit.prevent="submit">
          <v-text-field
            v-model="account.value.value"
            :error-messages="account.errorMessage.value"
            label="帳號或信箱"
            required
          />
          <v-text-field
            v-model="password.value.value"
            counter
            :error-messages="password.errorMessage.value"
            label="密碼"
            maxlength="20"
            minlength="4"
            required
            type="password"
          />
          <v-btn :loading="form.isSubmitting.value" type="submit">登入</v-btn>
        </v-form>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
  // import validator from 'validator'
  import { useField, useForm } from 'vee-validate'
  import { useRouter } from 'vue-router'
  import { useSnackbar } from 'vuetify-use-dialog'
  import * as yup from 'yup'
  import userService from '@/services/user'
  import { useUserStore } from '@/stores/user'

  const createSnackbar = useSnackbar()
  const router = useRouter()
  const user = useUserStore()

  // 建立 vee-validate 的表單
  const form = useForm({
    // 用 yup 定義表單驗證格式
    // https://github.com/jquense/yup
    validationSchema: yup.object({
      account: yup
        // 資料型態是文字
        .string()
        .required('帳號或電子郵件是必填的'),
      password: yup
        .string()
        .required('密碼是必填的')
        .min(4, '密碼至少需要 4 個字元')
        .max(20, '密碼最多只能有 20 個字元'),
    }),
  })
  const account = useField('account')
  const password = useField('password')
  // 建立 vee-validate 的表單欄位
  // 一定要在 useForm 後面
  // useField(欄位名稱)

  // 送出 vee-validate 的表單
  const submit = form.handleSubmit(async values => {
    // handleSubmit(處理function)
    // values 表單所有欄位的值
    try {
      const { data } = await userService.login({
        account: values.account,
        password: values.password,
      })
      user.login(data.user)
      createSnackbar({
        text: '登入成功！',
        snackbarProps: {
          color: 'green',
        },
      })
      router.push('/')
      // 登入成功後，導向到首頁
    } catch (error) {
      console.error(error)
      createSnackbar({
        text: error?.response?.data?.message || '登入失敗，請稍後再試！',
        snackbarProps: {
          color: 'red',
        },
      })
    }
  })
</script>

<route lang="yaml">
  meta:
    title: '登入'
    # 標題
    login: 'no-login-only'
    # 只能在沒登入的情況下看
    admin: false
    # 不是管理員也能看
</route>
