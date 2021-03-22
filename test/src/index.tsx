import React from 'react'
import ReactDOM from 'react-dom'
import './index.css'
import App from './App'
import * as serviceWorker from './serviceWorker'

import Cookie from 'universal-cookie'

import config from './config'

new Promise((resolve) => {
  gapi.load('client:auth2', resolve)
})
  .then(() => gapi.client.init(config.gapi.init))
  .finally(() => ReactDOM.render(<App />, document.getElementById('root')))
  .then(() => {
    const cookie = new Cookie()
    const fillColour = cookie.get('fillColour')
    if (fillColour) document.documentElement.style.setProperty("--fillColour", fillColour)
    
    const highlightColour = cookie.get('highlightColour')
    if (highlightColour) document.documentElement.style.setProperty("--highlightColour", highlightColour)

    const backgroundColour = cookie.get('backgroundColour')
    if (backgroundColour) document.documentElement.style.setProperty("--backgroundColour", backgroundColour)
  })

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister()
