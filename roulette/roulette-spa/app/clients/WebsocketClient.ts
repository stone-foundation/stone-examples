import { NotificationEvent } from '../events/NotificationEvent'
import { EventEmitter, IBlueprint, Stone } from '@stone-js/core'

/**
 * Websocket Client Options
 */
export interface WebsocketClientOptions {
  blueprint: IBlueprint
  eventEmitter: EventEmitter
}

/**
 * Websocket Client
 */
@Stone({ alias: 'websocketClient' })
export class WebsocketClient {
  private readonly blueprint: IBlueprint
  private readonly eventEmitter: EventEmitter
  
  private client?: WebSocket
  public isConnected: boolean = false
  private subscribers: { type: string, listener: (data: any) => void }[]

  /**
   * Create a new Websocket Client
   *
   * @param options - The options to create the Websocket Client.
   */
  constructor ({ eventEmitter, blueprint }: WebsocketClientOptions) {
    this.subscribers = []
    this.blueprint = blueprint
    this.eventEmitter = eventEmitter
  }

  /**
   * Start the WebSocket connection
   */
  start(): void {
    this.client ??= new WebSocket(this.blueprint.get('app.clients.websocket.url', 'ws://localhost:3000/ws'))

    this.subscribe('open', () => {
      this.eventEmitter.emit(
        new NotificationEvent(
          NotificationEvent.WEBSOCKET_CONNECTED,
          { message: 'WebSocket connection established' }
        )
      )
      this.isConnected = true
    })

    this.subscribe('close', () => {
      this.eventEmitter.emit(
        new NotificationEvent(
          NotificationEvent.WEBSOCKET_DISCONNECTED,
          { message: 'WebSocket connection closed' }
        )
      )
      this.isConnected = false
    })

    this.subscribe('error', (error) => {
      this.eventEmitter.emit(
        new NotificationEvent(
          NotificationEvent.WEBSOCKET_ERROR,
          { message: 'WebSocket error occurred', error }
        )
      )
    })

    this.subscribe('message', (event) => {
      const data = JSON.parse(event.data)
      this.eventEmitter.emit(
        new NotificationEvent(data.event, data.payload)
      )
    })
  }

  /**
   * Stop the WebSocket connection
   */
  stop() {
    this.client?.close()
    this.isConnected = false
    this.subscribers.forEach((v) => this.unsubscribe(v.type, v.listener))
    this.subscribers = []
    this.client = undefined
    return this
  }

  /**
   * Subscribe to a specific event type
   */
  subscribe(type: string, listener: (data: any) => void): this {
    this.subscribers.push({ type, listener })
    this.client?.addEventListener(type, listener)
    return this
  }

  /**
   * Unsubscribe from a specific event type
   */
  unsubscribe(type: string, listener: (data: any) => void) {
    this.client?.removeEventListener(type, listener)
    this.subscribers = this.subscribers.filter(sub => sub.type !== type || sub.listener !== listener)
    return this
  }
}
