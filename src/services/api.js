import axios from 'axios'
import userService from '@/services/user'
import { useUserStore } from '@/stores/user'

const api = axios.create({
  // axios.create 建立一個有自己預設設定的 axios
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:4000',
  // baseURL = http://localhost:4000
  // api.post('/user')
  // api.post('/user/login')

  // baseURL 如果沒寫，就要給詳細路徑(例如用 render)
  // axios.post('http://localhost:4000/user')
  // axios.post('http://localhost:4000/user/login')
})

const apiAuth = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:4000',
})

// axios 攔截器
// 1. axios.get() axios.post()
// 2. 請求攔截器 interceptors.request
// 3. 送出
// 4. 回應攔截器 interceptors.response
// 5. await / .then() .catch()

apiAuth.interceptors.request.use(config => {
  // 在每個請求前，加入 token
  const user = useUserStore()
  config.headers.Authorization = `Bearer ${user.token}`
  // config = 請求設定值，路徑、資料等等
  return config
})

apiAuth.interceptors.response.use(res => res, async error => {
  // .use(成功處理, 失敗處理)
  if (error.response
    && error.response.status === 400
    && error.response.data.message === 'token 已過期'
    && error.config.url !== '/user/refresh'
  ) {
    // 如果錯誤有回應，沒網路的話不會回應
    // 而且是 400 錯誤碼，而且是 token 過期錯誤，而且請求不是更新
    const user = useUserStore()
    try {
      const { data } = await userService.refresh()
      // 傳送更新請求
      user.token = data.token
      // 更新使用者資料
      error.config.headers.Authorization = `Bearer ${data.token}`
      // 修改發生錯誤的請求設定，換成新的 token
      return axios(error.config)
      // 重新發送原本請求
    } catch {
      user.logout()
      // 如果發送失敗，清除 pinia 存的使用者 token 和資料
    }
  }
  throw error
  // 如果沒有回應，或是其他錯誤，就回傳原本錯誤
})

export default { api, apiAuth }
