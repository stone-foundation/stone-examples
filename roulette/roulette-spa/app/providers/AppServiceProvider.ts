import axios, { AxiosInstance } from 'axios'
import { AxiosClient } from '../clients/AxiosClient'
import { WebsocketClient } from '../clients/WebsocketClient'
import { IBlueprint, IContainer, IServiceProvider, Provider } from '@stone-js/core'

/**
 * App Service Provider
 */
@Provider()
export class AppServiceProvider implements IServiceProvider {
  /**
   * Create a new instance of AppServiceProvider
   *
   * @param options
   */
  constructor (private readonly container: IContainer) {}

  /**
   * Register services to the container
   */
  register (): void {
    this.container
      .instanceIf('axios', this.getAxiosInstance(this.container))
      .singletonIf(AxiosClient, (container) => {
        return new AxiosClient({
          axios: container.make('axios'),
          tokenService: container.make('tokenService')
        })
      })
      .alias(AxiosClient, ['axiosClient', 'httpClient'])
  }

  /**
   * Register the Websocket Client
   */
  boot (): void {
    this.bootWebsocketClient()
  }

  /**
   * Get Axios instance
   *
   * @param container - The container
   * @returns The Axios instance
   */
  private getAxiosInstance (container: IContainer): AxiosInstance {
    const baseURL = container.make<IBlueprint>('blueprint').get<string>('app.clients.baseURL', 'http://localhost:8080')
    return axios.create({ baseURL })
  }

  /**
   * Boot the Websocket Client
   */
  private bootWebsocketClient (): void {
    const websocketClient = this.container.make<WebsocketClient>('websocketClient')
    websocketClient.stop().start()
  }
}
