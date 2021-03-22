export default interface Label {
  id: string
  name: string
  messageListVisibility?: string
  labelListVisibility?: string
  type: string
  messagesTotal?: number
  messagesUnread?: number
  threadsTotal?: number
  threadsUnread?: number
  color?: {
    textColor: string
    backgroundColor: string
  }
}
