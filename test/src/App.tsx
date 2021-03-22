/** App Component
 * This is the primary entry point of the application.
 * It contains a router to handle pages, and the Header component.
 * Contexts are injected here to be provided to children classes.
 */
import React from 'react'
import { BrowserRouter as Router, Route } from "react-router-dom"
import Cookie from 'universal-cookie'

import config from './config'

import './index.css'

import Header from './components/Header'
import Dashboard from './components/Dashboard'
import Mail from './components/Mail'
import Write from './components/Write'
import Button from './components/ui/Button'
import AppContext from './AppContext'
import TimerContext from './AppContext/TimerContext'
import Settings from './components/Settings'

type State = {
  isSignedIn: boolean
  timerContext: TimerContext
  showTimelockModal: boolean
  timelockCountdown: number
  queryString: string
}

class App extends React.Component<{}, State> {
  timelockCountdownInterval: any

  constructor (props: {}) {
    super(props)

    this.state = {
      isSignedIn: gapi.auth2.getAuthInstance().isSignedIn.get(),
      timerContext: new TimerContext(),
      showTimelockModal: false,
      timelockCountdown: 0,
      queryString: ""
    }

    this.handleQueryChange = this.handleQueryChange.bind(this)
  }

  componentDidMount () {
    this.setState({
      isSignedIn: gapi.auth2.getAuthInstance().isSignedIn.get()
    })
    gapi.auth2.getAuthInstance().isSignedIn.listen(isSignedIn => {
      this.setState({ isSignedIn })
      if (isSignedIn) this.checkTimelock()
    })

    if (gapi.auth2.getAuthInstance().isSignedIn.get()) this.checkTimelock()
  }

  checkTimelock = () => {
    const cookie = new Cookie()
    const emailTimeStart = cookie.get('emailTimeStart')
    const emailTimeEnd = cookie.get('emailTimeEnd')
    const currentTime = new Date()
    if (currentTime.toTimeString() < emailTimeStart || currentTime.toTimeString() > emailTimeEnd) {
      console.log('Outside of email time')
      this.setState({
        showTimelockModal: true,
      })
    }
  }

  componentWillUnmount () {
    if (this.timelockCountdownInterval) {
      clearInterval(this.timelockCountdownInterval)
    }
  }

  handleQueryChange (query : string) {
    this.setState({queryString : query})
  }

  render () {

    const cookie = new Cookie()

    return <AppContext.Provider value={{
      timerContext: this.state.timerContext
    }}>
        <Router basename={config.basename}>
        <div className="App">
          <Route path="/" render={props => <Header {...props} queryString={this.state.queryString} onQueryChange={this.handleQueryChange} isSignedIn={this.state.isSignedIn} /> } />
          <Route exact path="/" component={Dashboard} />
          <Route path="/mail/read" render={props => <Mail {...props} queryString={this.state.queryString} isSignedIn={this.state.isSignedIn} />} />
          <Route path="/mail/write" component={Write} />
          <Route path="/settings" render={props => <Settings {...props} onSubmit={this.checkTimelock} />} />
          { this.state.showTimelockModal && <div className="timelockModal">
            <div>
              Hey there. You've told us to limit your email time to between { cookie.get('emailTimeStart') } and { cookie.get('emailTimeEnd') }.
              <br />
              <Button
                className="BreakTheFence"
                disabled={this.state.timelockCountdown > 0}
                onClick={() => this.setState({showTimelockModal: false})}>
                  This is important.
                </Button>
            </div>
          </div>}
        </div>
      </Router>
    </AppContext.Provider>
  }
}

export default App
