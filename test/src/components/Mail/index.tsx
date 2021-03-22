import React from 'react'
import {RouteComponentProps} from 'react-router-dom'

import MessageType from '../../@types/MessageType'
import Label from '../../@types/Label'
import './styles.css'
import LoadingBar from '../ui/LoadingBar'
import Button from '../ui/Button'
import Message from './Message'

type Thread = {
  id : string,
  historyID: string,
  messages: [],
  snippet: string,
  isExpanded: boolean
}

type Props = {
  isSignedIn: boolean,
  queryString: string
}

type State = {
  messages: {
    [key: string]: MessageType,
  },
  threads : {
    [key: string]: Thread,
  }
  isLoading: boolean,
  expandedMessageId?: string,
  errorMessage?: string,
  showRead: boolean,
  importantOnly: boolean,
  trash:boolean,
  drafts: boolean,
  isCategoryExpanded: {
    [key: string]: boolean,
    'Promotion': boolean,
    'Forums': boolean,
    'Social': boolean,
    'Updates': boolean
  },
  labels: {
    [id: string]: Label
  },
  queryFailed : boolean,
  isLoadThreads : boolean
}

class Mail extends React.Component<Props & RouteComponentProps, State> {
  constructor(props: Props & RouteComponentProps) {
    super(props)

    this.state = {
      messages: {},
      threads: {},
      isLoading: false,
      showRead: false,
      trash: false,
      drafts: false,
      importantOnly: false,
      labels: {},
      isCategoryExpanded: {
        'Promotion': false,
        'Forums': false,
        'Social': false,
        'Updates': false,
      },
      queryFailed : false,
      isLoadThreads : false
    }
  }

  componentDidMount () {
    this.loadLabels()
    if (!this.state.isLoading && this.state.messages !== {}) this.loadMessages()
  }

  componentDidUpdate (prevProps : Props & RouteComponentProps) {
    if (prevProps.queryString !== this.props.queryString) {
      this.loadMessages()
    }
  }

  loadLabels = () => {
    const client = gapi.client as any
    client
      .gmail
      .users
      .labels
      .list({
        userId: 'me'
      })
      .then((response: {body: string}) => {
        const labels = Object.fromEntries(
          JSON.parse(response.body).labels
          .map((label: Label) => ([label.id, label]))
        )
        this.setState({ labels })
      })
  }

  loadMessages = () => {
    this.setState({
      isLoading: true,
      trash :false,
      drafts:false
    })
    const client = gapi.client as any
    client
      .gmail
      .users
      .messages
      .list({
        userId: 'me',
        q : this.props.queryString
      })
      .then((response: { body: string }) => {
        if(JSON.parse(response.body).messages === undefined) {
          this.setState({messages : {}, isLoading : false, queryFailed : true})
          return
        }
        const messages = JSON.parse(response.body).messages
          .reduce((acc: any, cur: any) => {
            return { ...acc, [cur.id]: cur }
          }, {})
        const gapiBatch = gapi.client.newBatch()
        Object.values(messages).forEach((message: any) => {
          const request = (gapi.client as any).gmail.users.messages.get({
            'userId': 'me',
            'id': message.id,
          })
          gapiBatch.add(request)
        })
        gapiBatch.then((batchResponse: any) => {
          Object.values(batchResponse.result).forEach((requestResponse: any) => {
            const mail = JSON.parse(requestResponse.body)
            messages[mail.id] = mail
          })
          this.setState({ messages, isLoading: false, queryFailed: false, isLoadThreads: false})
        })
      })
      .catch((error: Error) => {
        console.error(error)
        this.setState({
          isLoading: false,
          errorMessage: error.message || JSON.parse((error as any).body).error.message
        })
      })
  }

  // function for loading threads
  loadThreads = () => {
    this.setState({
      isLoading: true,
      trash: false
    })

    const client = gapi.client as any
    client.gmail.users.threads
      .list({
        userId: 'me',
        q : this.props.queryString
      })
      .then( async (response: { body: string }) => {

        const threads = JSON.parse(response.body).threads
          .reduce((acc: any, cur: any) => {
            return { ...acc, [cur.id]: cur }
          }, {})

        await Promise.all(
          Object.values(threads).map((thread: any) => {
            const client = gapi.client as any
            return client.gmail.users.threads
              .get({
                userId : 'me',
                id : thread.id
              })
              .then((response: { body: string }) => {
                const thread_data = JSON.parse(response.body)
                let threadt : Thread = {
                  id : thread_data.id,
                  historyID : thread_data.historyId,
                  messages: thread_data.messages,
                  snippet: thread.snippet,
                  isExpanded: false
                }
                threads[thread.id] = threadt
              })
          })
        )

        this.setState({ threads, isLoading: false, isLoadThreads: true})
      })
  }

  loadTrash = () => {
    this.setState({
      isLoading: true,
      trash :true,
      drafts:false
    })
    const client = gapi.client as any
    client
      .gmail
      .users
      .messages
      .list({
        userId: 'me',
        'labelIds' : 'TRASH'
      })
      .then((response: { body: string }) => {
        const messages = JSON.parse(response.body).messages
          .reduce((acc: any, cur: any) => {
            return { ...acc, [cur.id]: cur }
          }, {})

        const gapiBatch = gapi.client.newBatch()
        Object.values(messages).forEach((message: any) => {
          const request = (gapi.client as any).gmail.users.messages.get({
            'userId': 'me',
            'id': message.id,
          })
          gapiBatch.add(request)
        })
        gapiBatch.then((batchResponse: any) => {
          Object.values(batchResponse.result).forEach((requestResponse: any) => {
            const mail = JSON.parse(requestResponse.body)
            messages[mail.id] = mail
          })
          this.setState({ messages, isLoading: false, isLoadThreads: false })
        })
      })
  }

  loadDrafts = () => {
    this.loadMessages()
    this.setState({
      drafts:true
    })

  }

  setExpanded = (messageId: string) => {
    this.setState({
      expandedMessageId: messageId === this.state.expandedMessageId ? undefined : messageId
    })
    setTimeout(() => {
      const element = document.getElementById(messageId)
      if (!element) return
      element.scrollIntoView()
    }, 10)
  }

  oneUpdateLabel = (updatedLabel: Label) => {
    const labels = { ...this.state.labels }
    if (!labels) return
    const request = (gapi.client as any).gmail.users.labels.get({
      'userId': 'me',
      'id': updatedLabel.id
    })
    request.execute((fetchedLabel: Label) => {
      labels[updatedLabel.id] = fetchedLabel
      console.log(labels)
      console.log(updatedLabel)
      this.setState({ labels })
    })

  }

  oneUpdateMessage = (updatedMessage: MessageType) => {
    const messages = { ...this.state.messages }
    if (!messages || !messages[updatedMessage.id]) return
    const request = (gapi.client as any).gmail.users.messages.get({
      'userId': 'me',
      'id': updatedMessage.id
    })

    request.execute((fetchedMessage: MessageType) => {
      messages[updatedMessage.id] = fetchedMessage
      console.log(messages)
      console.log(updatedMessage)
      this.setState({ messages })
    })
}

  filterMessages = () => {

    return Object.values(this.state.messages)
      .filter(message => this.state.showRead || this.state.drafts || message.labelIds.includes('UNREAD'))
      .filter(message => !this.state.drafts ||  message.labelIds.includes('DRAFT'))
      .filter(message => !this.state.importantOnly || message.labelIds.includes('IMPORTANT'))
      .filter(message => !this.state.trash || message.labelIds.includes('TRASH'))
      .filter(message => this.state.trash || !message.labelIds.includes('TRASH'))
  }

  expandThread = (id : string, event : any) => {
    const threads = this.state.threads
    threads[id].isExpanded = ! threads[id].isExpanded
    this.setState({threads})
  }

  // This function is called whenever the props change or this.setState is called
  render() {
    const messages = this.filterMessages()

    const nonCategoryMessages = messages
      .filter(message => !message.labelIds.includes('CATEGORY_PROMOTIONS'))
      .filter(message => !message.labelIds.includes('CATEGORY_UPDATES'))
      .filter(message => !message.labelIds.includes('CATEGORY_SOCIAL'))
      .filter(message => !message.labelIds.includes('CATEGORY_FORUMS')
      )

    const categories = {
      'Promotions': messages
        .filter(message => message.labelIds.includes('CATEGORY_PROMOTIONS')),
      'Updates': messages
        .filter(message => message.labelIds.includes('CATEGORY_UPDATES')),
      'Social': messages
        .filter(message => message.labelIds.includes('CATEGORY_SOCIAL')),
      'Forums': messages
        .filter(message => message.labelIds.includes('CATEGORY_FORUMS'))

    }

    return (<div className="Mail">
      <Button onClick={this.loadMessages} disabled={this.state.isLoading || !this.props.isSignedIn}>Load Messages</Button>
      <Button onClick={this.loadThreads} disabled={this.state.isLoading || !this.props.isSignedIn}>Load Threads</Button>
      <Button onClick={this.loadTrash} disabled={this.state.isLoading || !this.props.isSignedIn}>Bin</Button>
      <Button onClick={this.loadDrafts} disabled={this.state.isLoading || !this.props.isSignedIn}>Draft</Button>
      {this.state.errorMessage && <p style={{ color: 'red', textAlign: 'center' }}>{this.state.errorMessage}</p>}
      { Object.keys(this.state.messages).length > 0 && !this.state.isLoadThreads && <>
        <div><input type="checkbox" checked={this.state.showRead} onChange={(event) => this.setState({ showRead: event.target.checked })} /> Show Read</div>
        <div><input type="checkbox" checked={this.state.importantOnly} onChange={(event) => this.setState({ importantOnly: event.target.checked })} /> Only Important</div>
      </> }
      { (this.state.isLoading) && <LoadingBar /> }
      { this.state.queryFailed &&
        <p style={{ color: 'red', textAlign: 'center' }}>No messages matched your search.</p>
      }
      { !!gapi && !!this.state.messages && !!this.state.labels && !this.state.isLoadThreads && <>
        {this.props.isSignedIn && (<>
          <div className="mailGroup">
            {nonCategoryMessages
              .map(message =>
              <Message key={message.id} updateLabel={this.oneUpdateLabel}  updateMessage={this.oneUpdateMessage} message={message} labels={this.state.labels!} trash={this.state.trash} isExpanded={this.state.expandedMessageId === message.id} onClick={() => this.setExpanded(message.id)}/>
            )}
          </div>
          { Object.entries(categories)
            .map(([category, categoryMessages]) =>
              categoryMessages
              .length > 0 &&
              <div className="mailGroup">
                <div className="categoryLabel">
                  <h3>{ category } ({categoryMessages.length})</h3>
                  <span style={{ color: 'var(--fillColour)' }} onClick={() => this.setState({
                      isCategoryExpanded: {
                        ...this.state.isCategoryExpanded,
                        [category]: !this.state.isCategoryExpanded[category]
                      }
                    })}>
                    {(this.state.isCategoryExpanded[category]) ? 'Minimise Promotions' : 'Expand promotions'}
                  </span>
                </div>
                {this.state.isCategoryExpanded[category] && categoryMessages
                  .map(message =>
                    <Message key={message.id} updateLabel={this.oneUpdateLabel}  updateMessage={this.oneUpdateMessage} message={message} labels={this.state.labels!} trash={this.state.trash} isExpanded={this.state.expandedMessageId === message.id} onClick={() => this.setExpanded(message.id)}/>
                  )}
              </div>
            )
          }

          {/* {Object.values(this.state.messages).length !== 0 && <p style={{ textAlign: 'center' }}>There are more messages, but we haven't made a way to load them yet, sorry.</p>} */}
        </>)}

      </>}
      {/* -------------------- threads -------------------------*/}
      { !!gapi && !!this.state.threads && !!this.state.labels && !!this.state.isLoadThreads && this.props.isSignedIn && <>
        <div className="mailGroup">
          {Object.values(this.state.threads)
            .map((thread : Thread) =>
            <div>
              <div className="mailItem">
                <div className="threadHeader" onClick={(e) => this.expandThread(thread.id, e)}>
                  <p className="snippet">{thread.snippet}</p></div>
              </div>
              {!!thread.messages && !!thread.isExpanded &&
                thread.messages
                  .map((message : any) =>
                    <Message key={message.id} updateLabel={this.oneUpdateLabel}  updateMessage={this.oneUpdateMessage} message={message} labels={this.state.labels!} trash={this.state.trash} isExpanded={this.state.expandedMessageId === message.id} onClick={() => this.setExpanded(message.id)}/>
              )}
            </div>
          )}
        </div>
      </>}
    </div>)
  }
}

export default Mail
