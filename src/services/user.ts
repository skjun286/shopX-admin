import request from "@/utils/request"

export const refreshToken = async () => {
  return await request.post('/user/refresh_token')
}
