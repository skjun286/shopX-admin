import request from "@/utils/request"

/** 获取横幅列表 GET */
export async function listBanner(
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
  return request<{meta:{total: number}, success:boolean, data:BannerT[]}>('/banners', {
    method: 'GET',
    params: {
      ...params,
    },
    ...(options || {}),
  });
}

export type pageParamsT = {
  current: number;
  pageSize: number;
}

/** 修改横幅 PATCH */
export async function updateBanner(id:string, data:{}) {
  return request<API.RuleListItem>('/banners/'+id, {
    method: 'PATCH',
    data
  });
}

/** 新建横幅 POST */
export async function createBanner(data: any) {
  return request<API.RuleListItem>('/banners', {
    method: 'POST',
    requestType: 'form',
    // headers: {
    //     "Content-Type": "multipart/form-data"
    // },
    // contentType: false,
    // processData: false,
    data
  });
}

/** 删除横幅 DELETE */
export async function removeBanner(id: string) {
  return request<Record<string, any>>('/banners/'+id, {
    method: 'DELETE'
  });
}

export async function batchRemoveBanner(ids: string[]) {
  return request<Record<string, any>>('/banners/batch_destroy', {
    method: 'DELETE',
    data:{ids}
  });
}

// 批量设置状态
export const batchStatus = async(status: number, ids: string[]) => {
  return request.patch('/banners/batch_status', {data:{status, ids}})
}

// banner相关的ts定义

export type BannerT = {
  id?: string;
  path: string;
  product_id?: number;
  is_enabled?: number;
  order?: number;
  updated_at?: string;
  created_at?: string;
  product?: {name: string};
}