'use client'

import { useMemo } from 'react'
import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios'
import Cookies from 'universal-cookie'

export const useApi = () => {
  const api = useMemo(() => {
    const instance = axios.create({
      baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api',
      timeout: 10000,
    })

    instance.interceptors.request.use((config) => {
      const cookies = new Cookies()
      const token = cookies.get('auth_token')

      if (token) {
        config.headers.Authorization = `Bearer ${token}`
      }

      return config
    })

    return instance
  }, [])

  return {
    get: <T = any>(route: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> =>
      api.get<T>(route, config),

    post: <T = any>(route: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> =>
      api.post<T>(route, data, config),

    put: <T = any>(route: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> =>
      api.put<T>(route, data, config),

    patch: <T = any>(route: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> =>
      api.patch<T>(route, data, config),

    delete: <T = any>(route: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> =>
      api.delete<T>(route, config),
  }
}

export default useApi
