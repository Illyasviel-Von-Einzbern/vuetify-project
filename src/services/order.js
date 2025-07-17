import apiService from './api'

export default {
  create () {
    return apiService.apiAuth.post('/order')
  },
  getMy () {
    return apiService.apiAuth.get('/order/my')
  },
  getAll () {
    return apiService.apiAuth.get('/order/all')
  },
}
