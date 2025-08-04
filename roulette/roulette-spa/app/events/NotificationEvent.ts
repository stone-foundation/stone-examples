import { Event } from '@stone-js/core'
import { Notification } from '../models/Notification'

/**
 * Notification Event
 */
export class NotificationEvent extends Event {
  /**
   * Notification Event name, fired when websocket connection is established.
   * 
   * @event NotificationEvent#WEBSOCKET_CONNECTED
   */
  static readonly WEBSOCKET_CONNECTED: string = 'notification.connected'

  /**
   * Notification Event name, fired when websocket connection is closed.
   * 
   * @event NotificationEvent#WEBSOCKET_DISCONNECTED
   */
  static readonly WEBSOCKET_DISCONNECTED: string = 'notification.disconnected'

  /**
   * Notification Event name, fired when there is an error in the websocket connection.
   * 
   * @event NotificationEvent#WEBSOCKET_ERROR
   */
  static readonly WEBSOCKET_ERROR: string = 'notification.error'

  /**
   * Notification Event name, fired when request to stop all audio is made.
   * 
   * @event NotificationEvent#STOP_ALL_AUDIO
   */
  static readonly STOP_ALL_AUDIO: string = 'notification.stop.all.audio'

  /**
   * Notification Event name, fired when a notification is posted.
   * 
   * @event NotificationEvent#POST
   */
  static readonly POST: string = 'notification.post'

  /**
   * Notification Event name, fired when a badge notification is posted.
   * 
   * @event NotificationEvent#BADGE
   */
  static readonly BADGE: string = 'notification.badge'

  /**
   * Notification Event name, fired when a notification is related to activity.
   * 
   * @event NotificationEvent#ACTIVITY
   */
  static readonly ACTIVITY: string = 'notification.activity'

  /**
   * Notification Event name, fired when a chat message is received.
   * 
   * @event NotificationEvent#CHAT_MESSAGE
   */
  static readonly CHAT_MESSAGE: string = 'notification.chat.message'

  /**
   * Notification Event name, fired when a chat typing event is received.
   * 
   * @event NotificationEvent#CHAT_TYPING
   */
  static readonly CHAT_TYPING: string = 'notification.chat.typing'

  /**
   * Notification Event name, fired when a notification is related to team.
   * 
   * @event NotificationEvent#TEAM
   */
  static readonly TEAM: string = 'notification.team'

  /**
   * Notification Event name, fired when a notification is related to user.
   * 
   * @event NotificationEvent#USER
   */
  static readonly USER: string = 'notification.user'

  /**
   * Notification Event name, fired when a notification is related to mission.
   * 
   * @event NotificationEvent#MISSION
   */
  static readonly MISSION: string = 'notification.mission'

  /**
   * Notification Event name, fired when a notification is related to members.
   * 
   * @event NotificationEvent#MEMBERS
   */
  static readonly MEMBERS: string = 'notification.members'

  /**
   * Create a new NotificationEvent
   *
   * @param type - The type of the event
   * @param notification - The notification that was made
   */
  constructor (type: string, public readonly notification: Notification) {
    super({ type })
  }
}
