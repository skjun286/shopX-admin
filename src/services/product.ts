import request from "@/utils/request"

export const list = async (params = {}) => {
  return await request('/products', { params })
}

export const store = (data = {}) => {
  return request.post('/products', { data })
}

export const update = (id: string, data = {}) => {
  return request.patch('/products/' + id, { data })
}