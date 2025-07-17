import apiService from './api'

export default {
  create (data) {
    return apiService.api.post('/user', data)
  },
  login (data) {
    return apiService.api.post('/user/login', data)
  },
  profile () {
    return apiService.apiAuth.get('/user/profile')
  },
  refresh () {
    return apiService.apiAuth.patch('/user/refresh')
  },
  logout () {
    return apiService.apiAuth.delete('/user/logout')
  },
  cart (data) {
    return apiService.apiAuth.patch('/user/cart', data)
  },
  getCart () {
    return apiService.apiAuth.get('/user/cart')
  },
}
