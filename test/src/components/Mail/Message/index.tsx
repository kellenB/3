/** Message Component
 * This component will display a single email/message.
 * A message is given as a prop, and attachments are downloaded on mount.
 * This component also provides callbacks for changing labels and deleting/restoring messages.
 */
import React from 'react'
import MessageType from '../../../@types/MessageType'
import Label from '../../../@types/Label'
import AppContext, { AppContextType } from '../../../AppContext'

type Props = {
  message: MessageType,
  isExpanded: boolean,
  trash: boolean,
  onClick: () => void,
  updateMessage: (updatedMessage: MessageType) => void,
  updateLabel: (updatedLabel: Label) => void,
  labels: {
    [id: string]: Label
  }
}

type State = {
  attachments: {
    filename: string,
    mimeType: string,
    attachment: string
  }[]
  content?: any,
  displayMenu: boolean,
  labeled: boolean,
  hasDownloadedAttachments: boolean

}

class Message extends React.Component<Props, State> {
  static contextType = AppContext
  context!: AppContextType

  constructor(props: Props) {
    super(props)

    this.state = {

      displayMenu: false,
      attachments: [],
      labeled: false,
      hasDownloadedAttachments: false

    }

    this.showDropdownMenu = this.showDropdownMenu.bind(this);
    this.hideDropdownMenu = this.hideDropdownMenu.bind(this);
  }

  showDropdownMenu(event: any) {
    event.preventDefault();
    this.setState({ displayMenu: true }, () => {
      document.addEventListener('click', this.hideDropdownMenu);
    });
  }

  hideDropdownMenu() {
    this.setState({ displayMenu: false }, () => {
      document.removeEventListener('click', this.hideDropdownMenu);
    });
  }

  componentWillUnmount() {
    this.context.timerContext.isTimerRunning(this.props.message.id) &&
      this.context.timerContext.removeTimer(this.props.message.id)
  }

  async componentDidUpdate(oldProps: Props) {
    if (!this.props.isExpanded && oldProps.isExpanded) {
      if (this.context.timerContext.isTimerRunning(this.props.message.id)) {
        this.context.timerContext.removeTimer(this.props.message.id)
      }
    }

    if (this.props.isExpanded && !oldProps.isExpanded) {

      if (this.context.timerContext.isTimerRunning(this.props.message.id)) {
        this.context.timerContext.setTimerToTime(this.props.message.id, 60000)
      } else {
        this.context.timerContext.addTimer(this.props.message.id, () => alert('You\'ve been on that mail for a while'), 60000)
      }

      if (!this.props.message.payload.parts) {
        const blob = this.props.message.payload.body.data.split('-').join('+').split('_').join('/')
        return this.setState({
          content: `data:text/html;base64,${blob}`
        })
      }

      let part = this.props.message.payload.parts
        .find(part => part.mimeType === 'text/html' || part.mimeType === 'multipart/alternative')
      if (!part) return
      if (part.mimeType === 'multipart/alternative') {
        part = (part as any).parts.find((p: any) => p.mimeType === 'text/html')
      }

      const blob = part && part.body.data
        .split('-').join('+')
        .split('_').join('/')

      const content = `data:${part!.mimeType};base64,${blob}`

      this.setState({
        content
      })


      if (!this.state.hasDownloadedAttachments) this.downloadAttachments()
    }
  }

  downloadAttachments = async () => {
    const parts = this.props.message.payload.parts;
    const attachments = this.state.attachments

    if (!parts) return

    await Promise.all(parts.map(async part => {
      if (part.filename && part.filename.length > 0) {
        const attachId: string = part.body.attachmentId

        const gmail = (gapi.client as any).gmail
        return gmail
          .users
          .messages
          .attachments
          .get({
            'id': attachId,
            'messageId': this.props.message.id,
            'userId': 'me'
          })
          .then((response: any) => {
            attachments.push({
              mimeType: part.mimeType,
              filename: part.filename as string,
              attachment: response.result.data
                .split('-').join('+')
                .split('_').join('/')
            });
          })
      }
    }))
    this.setState({
      attachments,
      hasDownloadedAttachments: true
    })
  }

  untrash = (message: any) => {
    const request = (gapi.client as any).gmail.users.messages.untrash({
      'userId': 'me',
      'id': message.id
    })
    request.execute((updatedMessage: MessageType) => {
      this.props.updateMessage && this.props.updateMessage(updatedMessage)
    })
  }

  deleteMessage = (message: any) => {
    const request = (gapi.client as any).gmail.users.messages.trash({
      'userId': 'me',
      'id': message.id
    })
    request.execute((updatedMessage: MessageType) => {
      this.props.updateMessage && this.props.updateMessage(updatedMessage)
    })
  }

  modifyMessage = (message: any, label: Label, labeled: Boolean) => {
    if (labeled) {
      const request =
        (gapi.client as any)
          .gmail
          .users
          .messages
          .modify({
            'userId': 'me',
            'id': message.id,
            'removeLabelIds': [label.id]
          })
      request.execute((updatedMessage: MessageType) => {
        this.props.updateMessage && this.props.updateMessage(updatedMessage)
      })
    } else {
      const request =
        (gapi.client as any)
          .gmail
          .users
          .messages
          .modify({
            'userId': 'me',
            'id': message.id,
            'addLabelIds': [label.id]
          })
      request.execute((updatedMessage: MessageType) => {
        this.props.updateMessage && this.props.updateMessage(updatedMessage)
      })
    }
  }

  newLabel = (newLabelName: string) => {
    const request = (gapi.client as any).gmail.users.labels.create({
      'userId': 'me',
      'name': [newLabelName],
      'labelListVisibility': ['labelShow'],
      'messageListVisibility': ['show']
    })
    request.execute((updatedLabel: Label) => {
      if (!updatedLabel.id) {
        alert("The label name you have chosen already exists. Please try another name");
        return
      }
      this.props.updateLabel && this.props.updateLabel(updatedLabel)
      this.modifyMessage(this.props.message, updatedLabel, false)
    })
  }

  handleDroupMenuClick = (e: any) => {
    e.stopPropagation()
    this.showDropdownMenu(e)
  }

  handleClick = (e: any) => {
    e.stopPropagation()
  }

  handleCreateClick = (e: any) => {
    e.stopPropagation()
    const newLabel = prompt("Please enter a new label name:");
    newLabel && this.newLabel(newLabel)
  }

  render() {
    const from = this.props.message.payload.headers.find((header: any) => header.name === 'From')
    return <div id={this.props.message.id} onClick={() => this.props.onClick()} className={`mailItem ${this.props.message.labelIds.includes('UNREAD') ? 'unread' : ''}`}>
      <div className="mailItemHeader">
        <span>{from && from.value}</span>
        <div className="droupDownMenu">
          <button className="material-icons" style={{ color: 'black', float: 'right' }} onClick={this.handleDroupMenuClick}>label</button>
          {this.state.displayMenu
            ? (
              <ul>
                {Object.keys(this.props.labels)
                  .filter(id => this.props.labels[id].type !== 'system')
                  .map(id =>
                    <li>
                      <input type="checkbox" checked={this.props.message.labelIds.includes(this.props.labels[id].id)}
                        onClick={e => {
                          this.modifyMessage(this.props.message, this.props.labels[id], this.props.message.labelIds.includes(this.props.labels[id].id));
                          this.handleClick(e);
                        }} />
                      {this.props.labels[id].name}
                    </li>
                  )}
                <button className="create-NewLabel" onClick={this.handleCreateClick}>Create new</button>
              </ul>
            )
            : null
          }
        </div>
        {!this.props.trash &&
          <button className="material-icons" style={{ color: 'black', float: 'right' }} onClick={(e) => { this.deleteMessage(this.props.message); this.handleClick(e) }}>delete</button>
        }
        {this.props.trash &&
          <button className="material-icons" style={{ color: 'black', float: 'right' }} onClick={(e) => { this.untrash(this.props.message); this.handleClick(e) }}>delete_outline</button>
        }
        <br />
        <p className="snippet">{this.props.message.snippet}</p>
        {this.props.message.labelIds
          .filter(id => this.props.labels[id])
          .filter(id => this.props.labels[id].type !== 'system')
          .map(id =>
            <span key={id} className="chip" style={this.props.labels[id].color ? {
              backgroundColor: this.props.labels[id].color!.backgroundColor,
              color: this.props.labels[id].color!.textColor
            } : undefined}>{this.props.labels[id].name}</span>
          )}
      </div>
      {this.props.isExpanded && (<div className="mailItemContent">
        {this.state.attachments.map(attachment => {
          return <div key={attachment.filename} style={{ textAlign: 'center' }}>
            <a key={attachment.filename} download={attachment.filename} href={"data:" + attachment.mimeType + ';base64,' + attachment.attachment} onClick={e => e.stopPropagation()}>
              {attachment.filename}
            </a>
            &nbsp;
            </div>
        })}
        <div className="iframeContainer">
          <iframe title={this.props.message.id} src={this.state.content} frameBorder="0" seamless ></iframe>
        </div>
      </div>)}
    </div>
  }
}

export default Message
