import request from "@/utils/request"
// 刷新token
export const refreshToken = async () => {
  return await request.post('/user/refresh_token')
}

/** 获取产品列表 GET */
export async function listUser(
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
  return request<{meta:{total: number}, success:boolean, data:TypeUserList}>('/users', {
    method: 'GET',
    params: {
      ...params,
    },
    ...(options || {}),
  });
}

/** 获取产品的描述 */
// export async function getUserDescription(id:string) {
//   return request<{data: string}>('/users/description/'+id, {
//     method: 'GET'
//   });
// }
/** 获取产品的副图 */
// export async function getUserPics(id:string) {
//   return request<{data: picT[]}>('/users/pics/'+id, {
//     method: 'GET'
//   });
// }

/** 修改产品 PATCH */
export async function updateUser(id:string, data:{}) {
  return request<API.RuleListItem>('/users/'+id, {
    method: 'PATCH',
    data
  });
}

/** 新建产品 POST */
export async function createUser(data: { [key: string]: any }) {
  return request<API.RuleListItem>('/users', {
    method: 'POST',
    data
  });
}

/** 删除产品 DELETE */
export async function removeUser(id: string) {
  return request<Record<string, any>>('/users/'+id, {
    method: 'DELETE'
  });
}

export async function batchRemoveUser(ids: string[]) {
  return request<Record<string, any>>('/users/batch_destroy', {
    method: 'DELETE',
    data:{ids}
  });
}

// 批量设置状态
export const batchStatus = async(status: number, ids: string[]) => {
  return request.patch('/users/batch_status', {data:{status, ids}})
}

// user相关的ts定义

export type TypeUser = {
  id?: string;
  name?: string;
  nickname?: string;
  phone?: string;
  gender?: string;
  age?: number;
  openid?: string;
  updated_at?: string;
  created_at?: string;
}

export type TypeUserList = TypeUser[]