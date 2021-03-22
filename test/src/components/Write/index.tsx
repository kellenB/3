/** Write Component
 * This component is the sole component responsible for writing and sending mail.
 * It takes no props.
 * It manages the state using draft-js, and is also able to save drafts.
 */
import React, { Component, ChangeEvent } from 'react'
import {
  Editor,
  EditorState,
  RichUtils,
  getDefaultKeyBinding,
  ContentState,
  convertToRaw
} from 'draft-js'
import { convertToHTML } from 'draft-convert'

import './styles.css'
import Button from '../ui/Button'
import LoadingBar from '../ui/LoadingBar'

type State = {
  markdownActive: boolean
  editorState: EditorState
  from: string
  to: string
  subject: string
  loading: boolean
}

export default class Write extends Component<{}, State> {
  state = {
    markdownActive: true,
    editorState: EditorState.createEmpty(),
    from: '',
    to: '',
    subject: '',
    loading: false
  }

  editorReference: any

  componentDidMount () {
    const from = this.getFromString()
    this.setState({ from })
  }

  getFromString = () => {
    const basicProfile = gapi.auth2.getAuthInstance().currentUser.get().getBasicProfile()
    return `${basicProfile.getGivenName()} ${basicProfile.getFamilyName()} <${basicProfile.getEmail()}>`
  }

  onEditorStateChange = (editorState: EditorState) => {
    this.setState({ editorState })
  }

  handleKeyCommand = (command: string, editorState: EditorState) => {
    const newState = RichUtils.handleKeyCommand(editorState, command);
    if (newState) {
      this.onEditorStateChange(newState);
      return 'handled';
    }
    return 'not-handled';
  }

  onInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    switch (event.target.name) {
      case 'to':
        this.setState({ to: event.target.value })
        break
      case 'subject':
        this.setState({ subject: event.target.value })
        break
    }
  }

  makeMime = () => {
    const currentContent = this.state.editorState.getCurrentContent()

    const blocks = convertToRaw(
      this.state.editorState.getCurrentContent()
    )
      .blocks
      .map(block => block.text)

    const content = blocks.join('\n')

    const html = convertToHTML({})(currentContent)

    let mime = `From: ${this.getFromString()}${this.state.to && '\nTo:'} ${this.state.to}${this.state.subject && '\nSubject:'} ${this.state.subject}
MIME-Version: 1.0
Content-Type: multipart/mixed; 
    boundary=gc0p4Jq0M2Yt08jU534c0p

${content}

--gc0p4Jq0M2Yt08jU534c0p
Content-Type: text/html;

${html}

--gc0p4Jq0M2Yt08jU534c0p--`

    return mime
  }

  saveDraft = () => {
    this.setState({
      loading: true
    })

    const mime = this.makeMime()

    console.log(mime)

    const response = (gapi.client as any)
      .gmail
      .users
      .drafts
      .create({
        userId: 'me',
        resource: {
          message: {
            raw: btoa(mime)
              .split('+').join('-')
              .split('/').join('_')
          }
        }
      })
    response.then(() => {
      this.setState({
        loading: false
      })
      alert(`Saved draft successfully.`)
    })
      .catch((error: Error) => console.error(error))
  }

  sendEmail = () => {
    this.setState({
      loading: true
    })

    const mime = this.makeMime()

    console.log(mime)

    const response = (gapi.client as any)
      .gmail
      .users
      .messages
      .send({
        userId: 'me',
        resource: {
          raw: btoa(mime)
            .split('+').join('-')
            .split('/').join('_')
        }
      })
    response.then(() => {
      this.setState({
        loading: false,
        editorState: EditorState.createEmpty(),
        to: '',
        subject: ''
      })
      alert(`Sent mail to ${this.state.to} successfully.`)
    })
    .catch((error: Error) => console.error(error))
  }

  render() {
    return (
      <div className="Write">
        <div>
          <div className="editor">
            <strong>From</strong>
            <div className="from">
              { this.state.from }
            </div>
            <strong>To</strong>
            <div className="to">
              <input type="text" name="to" value={this.state.to} onChange={this.onInputChange}/>
            </div>
            <strong>Subject</strong>
            <div className="subject">
              <input type="text" name="subject" value={this.state.subject} onChange={this.onInputChange}/>
            </div>
            <strong>Message</strong>
            <div className="editorToolbar">
              <i className={ 'material-icons' } onClick={() =>
                this.onEditorStateChange(EditorState.push(this.state.editorState, ContentState.createFromText(''), 'remove-range'))
              }>delete</i>
              <i className={ 'material-icons' + (this.state.editorState.getCurrentInlineStyle().contains('ITALIC') ? ' active' : '') } onClick={() =>
                this.onEditorStateChange(RichUtils.toggleInlineStyle(this.state.editorState, 'ITALIC'))
              }>format_italic</i>
              <i className={ 'material-icons' + (this.state.editorState.getCurrentInlineStyle().contains('BOLD') ? ' active' : '') } onClick={() =>
                this.onEditorStateChange(RichUtils.toggleInlineStyle(this.state.editorState, 'BOLD'))
              }>format_bold</i>
              <i className={ 'material-icons' + (this.state.editorState.getCurrentInlineStyle().contains('UNDERLINE') ? ' active' : '') } onClick={() =>
                this.onEditorStateChange(RichUtils.toggleInlineStyle(this.state.editorState, 'UNDERLINE'))
              }>format_underline</i>
            </div>
            <div className="textArea" onClick={() =>
              this.editorReference.focus()
            }>
              <Editor
                ref={ref => this.editorReference = ref}
                editorState={this.state.editorState}
                onChange={this.onEditorStateChange}
                handleKeyCommand={this.handleKeyCommand}
                keyBindingFn={getDefaultKeyBinding}
              />
            </div>
            <div className="actionButtons">
              <Button onClick={this.saveDraft}>Save Draft</Button>
              <Button onClick={this.sendEmail}>Send</Button>
            </div>
            <div style={{ height: '1rem' }}>
              { this.state.loading &&  <LoadingBar /> }
            </div>
          </div>
        </div>
      </div>
    )
  }
}
