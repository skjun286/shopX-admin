import request from "@/utils/request"

/** 获取产品列表 GET */
export async function listProduct(
  params: {
    // query
    /** 当前的页码 */
    current_page?: number;
    /** 页面的容量 */
    per_page?: number;
    include?: string;
  },
  options?: { [key: string]: any },
) {
  return request<{meta:{total: number}, success:boolean, data:TypeProductList}>('/products', {
    method: 'GET',
    params: {
      ...params,
    },
    ...(options || {}),
  });
}

export type picT = {
  id: string;
  path: string;
  is_poster: number;
}
/** 获取产品的描述 */
export async function getProductDescription(id:string) {
  return request<{data: string}>('/products/description/'+id, {
    method: 'GET'
  });
}
/** 获取产品的副图 */
export async function getProductPics(id:string) {
  return request<{data: picT[]}>('/products/pics/'+id, {
    method: 'GET'
  });
}

/** 修改产品 PATCH */
export async function updateProduct(id:string, data:{}) {
  return request<API.RuleListItem>('/products/'+id, {
    method: 'PATCH',
    data
  });
}

/** 新建产品 POST */
export async function createProduct(data: { [key: string]: any }) {
  return request<API.RuleListItem>('/products', {
    method: 'POST',
    data
  });
}

/** 删除产品 DELETE */
export async function removeProduct(id: string) {
  return request<Record<string, any>>('/products/'+id, {
    method: 'DELETE'
  });
}

export async function batchRemoveProduct(ids: string[]) {
  return request<Record<string, any>>('/products/batch_destroy', {
    method: 'DELETE',
    data:{ids}
  });
}

// 批量设置状态
export const batchStatus = async(status: number, ids: string[]) => {
  return request.patch('/products/batch_status', {data:{status, ids}})
}

// product相关的ts定义

export type TypeProduct = {
  id?: string;
  name?: string;
  price?: number;
  poster?: string;
  category_id?: number;
  special_price?: number;
  is_special?: number;
  is_featured?: number;
  is_enabled?: number;
  order?: number;
  updated_at?: string;
  created_at?: string;
  category?: {name: string};
}

export type TypeProductList = TypeProduct[]