import request from "@/utils/request"

/** 获取优惠券列表 GET */
export async function listCoupon(
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
  return request<{meta:{total: number}, success:boolean, data:CouponT[]}>('/coupons', {
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

/** 修改优惠券 PATCH */
export async function updateCoupon(id:string, data:{}) {
  return request<API.RuleListItem>('/coupons/'+id, {
    method: 'PATCH',
    data
  });
}
export async function changeEnabled(id:string, status: number) {
  return request<API.RuleListItem>('/coupons/'+id, {
    method: 'PATCH',
    data: {is_enabled: status}
  });
}

/** 新建优惠券 POST */
export async function createCoupon(data: any) {
  return request<API.RuleListItem>('/coupons', {
    method: 'POST',
    data
  });
}

// 批量设置状态
export const batchEnabled = async(status: number, ids: string[]) => {
  return request.patch('/coupons/batch_status', {data:{status, ids}})
}

// coupon相关的ts定义

export type CouponT = {
  id?: string;
  code: string;
  type: number;
  order_total: number;
  amount: number;
  per_user: number;
  max: number;
  used?: number;
  available_from: string;
  available_to: string;
  is_enabled: number;
  updated_at?: string;
  created_at?: string;
}