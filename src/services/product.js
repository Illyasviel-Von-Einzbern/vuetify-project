import apiService from './api'

export default {
  create (data) {
    return apiService.apiAuth.post('/product', data)
  },
  getAll () {
    return apiService.apiAuth.get('/product/all')
  },
  get () {
    return apiService.api.get('/product')
  },
  getId (id) {
    return apiService.api.get('/product/' + id)
  },
  update (id, data) {
    return apiService.apiAuth.patch(`/product/${id}`, data)
  },
}
