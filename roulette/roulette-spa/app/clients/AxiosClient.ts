import { isEmpty } from '@stone-js/core'
import { TokenService } from '../services/TokenService'
import { ForbiddenError } from '../errors/ForbiddenError'
import { UnauthorizedError } from '../errors/UnauthorizedError'
import { Axios, AxiosRequestConfig, AxiosResponse } from 'axios'

/**
 * Axios Client Options
 */
export interface AxiosClientOptions {
  axios: Axios
  tokenService: TokenService
}

/**
 * Axios Client
 */
export class AxiosClient {
  private readonly axios: Axios
  private readonly tokenService: TokenService

  /**
   * Create a new Axios Client
   *
   * @param options - The options to create the Axios Client.
   */
  constructor ({ axios, tokenService }: AxiosClientOptions) {
    this.axios = axios
    this.tokenService = tokenService
  }

  /**
   * Make a request
   *
   * @param url - The URL to request
   * @param data - The data to send
   * @param options - The request options
   * @returns The response data
   * @throws NotAuthenticateError
   * @throws AxiosError
   */
  async request<T = any, R = AxiosResponse<T>, D = any>(url: string, payload?: D, options?: AxiosRequestConfig<D>, retried?: boolean): Promise<T> {
    try {
      const headers: any = options?.headers ?? {}
      const token = this.tokenService.getAccessToken()
      const validateStatus = (status: number): boolean => status >= 200 && status < 400

      headers.Accept ??= 'application/json'
      headers['Content-Type'] ??= 'application/json'
      headers.Authorization = isEmpty(token) ? '' : `Bearer ${token}`

      const response = await this.axios.request({ ...options, url, data: payload, headers, validateStatus })

      return response.data
    } catch (error: any) {
      if (error.status === 401) {
        if (retried === true) {
          const data: any = error.response?.data
          throw new UnauthorizedError(data?.errors?.message ?? error.message, { cause: error })
        } else {
          // Retry the request after refreshing the token
          await this.tokenService.refresh()
          return await this.request<T, R, D>(url, payload, options, true)
        }
      } else if (error.status === 403) {
        throw new ForbiddenError(error.message, { cause: error })
      } else {
        throw error
      }
    }
  }

  /**
   * Make a GET request
   *
   * @param url - The URL to request
   * @param options - The request options
   * @returns The response data
   */
  async get<T = any, R = AxiosResponse<T>, D = any>(url: string, options?: AxiosRequestConfig<D>): Promise<T> {
    return await this.request<T, R, D>(url, undefined, { ...options, method: 'GET' })
  }

  /**
   * Make a POST request
   *
   * @param url - The URL to request
   * @param data - The data to send
   * @param options - The request options
   * @returns The response data
   */
  async post<T = any, R = AxiosResponse<T>, D = any>(url: string, data?: D, options?: AxiosRequestConfig<D>): Promise<T> {
    return await this.request<T, R, D>(url, data, { ...options, method: 'POST' })
  }

  /**
   * Make a PUT request
   *
   * @param url - The URL to request
   * @param data - The data to send
   * @param options - The request options
   * @returns The response data
   */
  async put<T = any, R = AxiosResponse<T>, D = any>(url: string, data?: D, options?: AxiosRequestConfig<D>): Promise<T> {
    return await this.request<T, R, D>(url, data, { ...options, method: 'PUT' })
  }

  /**
   * Make a PATCH request
   *
   * @param url - The URL to request
   * @param data - The data to send
   * @param options - The request options
   * @returns The response data
   */
  async patch<T = any, R = AxiosResponse<T>, D = any>(url: string, data?: D, options?: AxiosRequestConfig<D>): Promise<T> {
    return await this.request<T, R, D>(url, data, { ...options, method: 'PATCH' })
  }

  /**
   * Make a DELETE request
   *
   * @param url - The URL to request
   * @param options - The request options
   * @returns The response data
   */
  async delete<T = any, R = AxiosResponse<T>, D = any>(url: string, options?: AxiosRequestConfig<D>): Promise<T> {
    return await this.request<T, R, D>(url, undefined, { ...options, method: 'DELETE' })
  }
}
