/** Header Component
 * This component is the top bar, and contains nav links, a search bar and the user widget.
 */
import React from 'react'
import { Link, RouteComponentProps } from 'react-router-dom'

import './styles.css'

import SearchBar from './SearchBar'
import UserWidget from './UserWidget'

type Props = {
  isSignedIn : boolean
  queryString : string
  onQueryChange : any
}

const Header = (props : Props & RouteComponentProps) => {

  return (
    <div className="Header">
      <ul className="navigateItems">
        <Link to="/">
          <li className={props.location.pathname === '/' || props.location.pathname === '/search' ? 'selected' : undefined}>
            <i className="material-icons">view_module</i> Dashboard
          </li>
        </Link>
        <Link to="/mail/write">
          <li className={props.location.pathname === '/mail/write' ? 'selected' : undefined}>
            <i className="material-icons">edit</i> Write
          </li>
        </Link>
        <Link to="/mail/read">
          <li className={props.location.pathname === '/mail/read' ? 'selected' : undefined}>
            <i className="material-icons">email</i> Read
          </li>
        </Link>
        <Link to="/settings">
          <li className={props.location.pathname === '/settings' ? 'selected' : undefined}>
            <i className="material-icons">settings</i> Settings
          </li>
        </Link>
      </ul>
      <SearchBar {...props} queryString={props.queryString} onQueryChange={props.onQueryChange}/>
      <UserWidget isSignedIn={props.isSignedIn} />
    </div>
  )
}

export default Header