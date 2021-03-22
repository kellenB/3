/** SearchBar
 * This component will allow the user to input a text string and it will
 * redirect to the specified search page on Docs, Sheets, etc.
 * It is designed to be placed within the Header.
 */
import React from 'react'
import { RouteComponentProps } from 'react-router-dom'

import './styles.css'

enum SearchType {
  Mail = "Search Mail",
  Google = "Search Google",
  Drive = "Search Drive",
  Gmail = "Search Gmail",
  Docs = "Search Docs",
  Sheets = "Search Sheets",
  Slides = "Search Slides"
}

type Props = {
  queryString : string
  onQueryChange : any
}

type State = {
  value : string
  searchType : SearchType
  displayStyle : any
}

class SearchBar extends React.Component<Props & RouteComponentProps, State> {


  constructor(props : Props & RouteComponentProps) {
    super(props)

    this.state = {
      value : "",
      searchType : SearchType.Mail,
      displayStyle : { display: "none" }
    }

    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.handleDropdown = this.handleDropdown.bind(this);
  }

  handleDropdown(event : any) {
    if(this.state.displayStyle.display === "none") {
      this.setState({ displayStyle : {display: "block"} });
    }
    else {
      this.setState({ displayStyle : {display: "none"} });
    }
  }

  handleChange(event : any) {
    this.setState({value: event.target.value});
  }

  handleSubmit(event : any) {
    event.preventDefault();
    if(this.state.searchType === SearchType.Mail) {
      this.props.onQueryChange(this.state.value)
      this.props.history.push('/mail/read')
    }
    if(this.state.searchType === SearchType.Google) {
      window.location.assign("https://www.google.com/search?q=" + this.state.value);
    }
    if(this.state.searchType === SearchType.Drive) {
      window.location.assign("https://drive.google.com/drive/search?q=" + this.state.value);
    }
    if(this.state.searchType === SearchType.Gmail) {
      window.location.assign("https://mail.google.com/mail/u/0/#search/" + this.state.value);
    }
    if(this.state.searchType === SearchType.Docs) {
      window.location.assign("https://docs.google.com/document/u/0/?q=" + this.state.value);
    }
    if(this.state.searchType === SearchType.Sheets) {
      window.location.assign("https://docs.google.com/spreadsheets/u/0/?q=" + this.state.value);
    }
    if(this.state.searchType === SearchType.Slides) {
      window.location.assign("https://docs.google.com/presentation/u/0/?q=" + this.state.value);
    }
  }

  handleTypeChange(type : SearchType, event : any) {
    this.setState({searchType : type});
    if(this.state.displayStyle.display === "none") {
      this.setState({ displayStyle : {display: "block"} });
    }
    else {
      this.setState({ displayStyle : {display: "none"} });
    }
  }

  render() {
    return(
      <div className="SearchBar">
        <div className="dropdownArrow">
          <button onClick={this.handleDropdown}>
            <svg viewBox="0 0 24 24"><path d="M7.41 8.59L12 13.17l4.59-4.58L18 10l-6 6-6-6 1.41-1.41z"/><path fill="none" d="M0 0h24v24H0V0z"/></svg>
          </button>
        </div>
        <div className="searchBarInput">
          <form onSubmit={this.handleSubmit}>
            <input type="text" placeholder={this.state.searchType} value={this.state.value} onChange={this.handleChange}/>
            <button type="submit"><svg><path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/><path d="M0 0h24v24H0z" fill="none"/></svg></button>
          </form>
        </div>
        <div className="dropdownMenu" style={this.state.displayStyle}>
          <p onClick={(e : any) => this.handleTypeChange(SearchType.Mail, e)}>Search Mail</p>
          <p onClick={(e : any) => this.handleTypeChange(SearchType.Google, e)}>Search Google</p>
          <p onClick={(e : any) => this.handleTypeChange(SearchType.Drive, e)}>Search Drive</p>
          <p onClick={(e : any) => this.handleTypeChange(SearchType.Gmail, e)}>Search Gmail</p>
          <p onClick={(e : any) => this.handleTypeChange(SearchType.Docs, e)}>Search Docs</p>
          <p onClick={(e : any) => this.handleTypeChange(SearchType.Sheets, e)}>Search Sheets</p>
          <p onClick={(e : any) => this.handleTypeChange(SearchType.Slides, e)}>Search Slides</p>
        </div>
      </div>
    )
  }
}

export default SearchBar