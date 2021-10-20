 import { extend } from 'umi-request'
 import { notification } from 'antd'
 import { getItem, setItem, removeItem } from './storage'
 import { refreshToken } from '@/services/user'
 import { history } from 'umi'
 import { stringify } from 'querystring'
import { apiBase } from '@/config'

 const codeMessage = {
   200: '服务器成功返回请求的数据。',
   201: '新建或修改数据成功。',
   202: '一个请求已经进入后台排队（异步任务）。',
   204: '删除数据成功。',
   400: '发出的请求有错误，服务器没有进行新建或修改数据的操作。',
   401: '用户没有权限（令牌、用户名、密码错误）。',
   403: '用户得到授权，但是访问是被禁止的。',
   404: '发出的请求针对的是不存在的记录，服务器没有进行操作。',
   406: '请求的格式不可得。',
   410: '请求的资源被永久删除，且不会再得到的。',
   419: '登录失败，用户名和密码错误。',
   422: '填写的数据格式错误',
   500: '服务器发生错误，请检查服务器。',
   502: '网关错误。',
   503: '服务不可用，服务器暂时过载或维护。',
   504: '网关超时。',
 }
 
 /**
  * 异常处理程序
  */
 const errorHandler = (error: { response: Response }): Response => {
   const { response } = error
   if (response && response.status) {
     const errorText = codeMessage[response.status] || response.statusText
     const { status, url } = response
 
     notification.error({
       message: `请求错误 ${status}: ${url}`,
       description: errorText,
     })
   } else if (!response) {
     notification.error({
       description: '网络发生异常，无法连接服务器',
       message: '网络异常',
     })
   }
   return response
 }
 
 const resquestHandler = (url: string, options = {}) => {
   const token = <null | Token>getItem('token')
 
   if (token) {
     const headers = {
       Authorization: `Bearer ${token.bearer}`
     }
     options = { ...options, headers }
   }
 
   return { url, options }
 }
 
 // token刷新失败时删除token并跳转到登陆页面并
 const loginOut = () => {
   removeItem('token')
   const { query = {}, pathname } = history.location
   const { redirect } = query
   // Note: There may be security issues, please note
   if (window.location.pathname !== '/user/login' && !redirect) {
     history.replace({
       pathname: '/user/login',
       search: stringify({
         redirect: pathname,
       }),
     })
   }
 }
 
 
 let isRefreshing = false // 是否正在刷新
 const subscribers: any[] = [] // 重试队列，每一项将是一个待执行的函数形式
 
 const addSubscriber = (listener: any) => subscribers.push(listener)
 
 // 执行被缓存等待的接口事件
 const notifySubscriber = (newToken = '') => {
   subscribers.forEach(callback => callback(newToken))
   subscribers.length = 0
 }
 
 // 刷新 token 请求
 const refreshTokenRequst = async () => {
   try {
     const res = await refreshToken()
     setItem('token', res.data)
     notifySubscriber(res.data.bearer)
   } catch (e) {
     console.error('请求刷新 token 失败')
   }
   isRefreshing = false
 }
 
 // 判断如何响应
 function checkStatus(response: {url: string}, options:{}) {
   const { url } = response
   if (!isRefreshing) {
     isRefreshing = true
     refreshTokenRequst()
   }
 
   // 正在刷新 token，返回一个未执行 resolve 的 promise
   return new Promise(resolve => {
     // 将resolve放进队列，用一个函数形式来保存，等token刷新后直接执行
     addSubscriber((newToken: string) => {
       const newOptions = {
         ...options,
         prefix: '',
         params: {},
         headers: {
           Authorization: 'Bearer ' + newToken
         }
       }
       resolve(request(url, newOptions))
     })
   })
 }
 
 const responseHandler = async (response: any, options: any) => {
   // 克隆响应对象做解析处理
   const res = await response.clone().json()
   if (res.code === 2001) {
     return checkStatus(response, options)
   } else if (res.code === 2002) {
     loginOut()
   }
   return response
 }
 
 // 通过 extend 新建一个 umi-request 实例
 const request = extend({
   prefix: apiBase,
   timeout: 5000,
   errorHandler // 提前对响应做异常处理
 })
 
 request.interceptors.request.use(resquestHandler)
 request.interceptors.response.use(responseHandler)
 
 export default request
