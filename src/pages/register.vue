<template>
  <v-container>
    <v-row>
      <v-col cols="12">
        <h1 class="text-center">註冊</h1>
      </v-col>
      <v-divider />
      <v-col cols="12">
        <v-form :disabled="form.isSubmitting.value" @submit.prevent="submit">
          <v-text-field
            v-model="account.value.value"
            counter
            :error-messages="account.errorMessage.value"
            label="帳號"
            maxlength="20"
            minlength="4"
            required
          />
          <v-text-field
            v-model="email.value.value"
            :error-messages="email.errorMessage.value"
            label="信箱"
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
          <v-text-field
            v-model="confirmPassword.value.value"
            counter
            :error-messages="confirmPassword.errorMessage.value"
            label="確認密碼"
            maxlength="20"
            minlength="4"
            required
            type="password"
          />
          <v-btn :loading="form.isSubmitting.value" type="submit">註冊</v-btn>
        </v-form>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
  import validator from 'validator'
  import { useField, useForm } from 'vee-validate'
  import { useRouter } from 'vue-router'
  import { useSnackbar } from 'vuetify-use-dialog'
  import * as yup from 'yup'
  import userService from '@/services/user'

  // https://uvr.esm.is/guide/extending-routes.html#definepage
  // definePage({
  //   meta: {
  //     title: '註冊',
  //   },
  // })

  const createSnackbar = useSnackbar()
  const router = useRouter()

  // 建立 vee-validate 的表單
  const form = useForm({
    validationSchema: yup.object({
      // 用 yup 定義表單驗證格式
      // https://github.com/jquense/yup
      account: yup
        .string()
        // 資料型態是文字
        .required('帳號必須填寫')
        .min(4, '帳號至少需要 4 個字元')
        .max(20, '帳號最多只能 20 個字元')
        .test('isAlphanumeric', '帳號只能包含英文字母和數字', value => {
          // 自訂驗證(驗證名稱, 錯誤訊息, 驗證function)
          return validator.isAlphanumeric(value)
        }),
      email: yup
        .string()
        .required('電子郵件必須填寫')
        .test('isEmail', '請輸入有效的電子郵件地址', value => {
          return validator.isEmail(value)
        }),
      password: yup
        .string()
        .required('密碼必須填寫')
        .min(4, '密碼至少需要 4 個字元')
        .max(20, '密碼最多只能 20 個字元'),
      confirmPassword: yup
        .string()
        .required('確認密碼必須填寫')
        .oneOf([yup.ref('password')], '密碼和確認密碼必須相同'),
        // .oneOf(陣列, 訊息)   欄位的值必須是陣列內的其中一個
        // .ref(欄位)          取得欄位的值
        // .ref(password)     password 欄位的值
    }),
    // 根據 後端(back)>models>user.js 來設計
  })

  const account = useField('account')
  const email = useField('email')
  const password = useField('password')
  const confirmPassword = useField('confirmPassword')
  // 建立 vee-validate 的表單欄位
  // 一定要在 useForm 後面
  // useField(欄位名稱)

  // 送出 vee-validate 的表單
  const submit = form.handleSubmit(async values => {
    // handleSubmit(處理function)
    // values 表單所有欄位的值
    try {
      await userService.create({
        account: values.account,
        email: values.email,
        password: values.password,
      })
      createSnackbar({
        text: '註冊成功！',
        snackbarProps: {
          color: 'green',
        },
      })
      router.push('/login')
      // 註冊成功後，導向到登入頁面
    } catch (error) {
      console.error(error)
      createSnackbar({
        text: error?.response?.data?.message || '註冊失敗，請稍後再試！',
        snackbarProps: {
          color: 'red',
        },
      })
    }
  })
</script>

<!-- https://uvr.esm.is/guide/extending-routes.html#sfc-route-custom-block -->
<route lang="yaml">
  meta:
    title: '註冊'
    # 標題
    login: 'no-login-only'
    # 只能在沒登入的情況下看
    admin: false
    # 不是管理員也能看
</route>

<!--
<route>
{
  "meta": {
    "title": "註冊",
    "login": "no-login-only",
    "admin": false
  }
}
</route>
-->
