export default interface Message {
  id: string,
  threadId: string,
  snippet ?: string,
  labelIds: string[],
  payload: {
    body: {
      data: string,
      mimeType: string
    },
    headers: {
      name: string,
      value: string,
    } [],
    parts?: {
      mimeType: string,
      partId: string,
      filename: {
        length: number,
      },
      body: {
        attachmentId: string,
        data: string,
        size: number,
      },
      headers: {
        name: string,
        value: string,
      } []
    } []
  }
}