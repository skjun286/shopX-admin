import request from "@/utils/request"

/** 获取分类列表 GET /api/rule */
export async function listCategory(
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
  return request<CategoryList>('/categories', {
    method: 'GET',
    params: {
      ...params,
    },
    ...(options || {}),
  });
}

/** 修改分类 PATCH /api/rule */
export async function updateCategory(id:string, data:{}) {
  return request<API.RuleListItem>('/categories/'+id, {
    method: 'PATCH',
    data
  });
}

/** 新建分类 POST /api/rule */
export async function createCategory(data: { [key: string]: any }) {
  return request<API.RuleListItem>('/categories', {
    method: 'POST',
    data
  });
}

/** 删除分类 DELETE /api/rule */
export async function removeCategory(id: string) {
  return request<Record<string, any>>('/categories/'+id, {
    method: 'DELETE'
  });
}

export async function batchRemoveCategory(ids: string[]) {
  return request<Record<string, any>>('/categories/batch_destroy', {
    method: 'DELETE',
    data:{ids}
  });
}
// 获取根分类
export const rootCategories = async() => {
  return request.get<{data: TypeCategoryOption[]}>('/categories/root_list')
}
// 批量设置状态
export const batchStatus = async(status: number, ids: string[]) => {
  return request.patch('/categories/batch_status', {data:{status, ids}})
}

// category相关的ts定义

export type TypeCategory = {
  id?: string;
  name?: string;
  parent_id?: string;
  is_enabled?: number;
  order?: number;
  updated_at?: string;
  created_at?: string;
  parent?: {name: string};
}

export type TypeCategoryOption = {
  label: string;
  value: string;
}