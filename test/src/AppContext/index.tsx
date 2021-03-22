/** AppContext
 * The App Context contains all of the context objects for the project.
 * Having a root object means we perform uneccessary re-renders more often (but not commits),
 * but we only have to provide one context object at the root of the application.
 * 
 * I chose to do it this way, rather than having potentially multiple contexts, in order
 * to simplify the project for newer developers, so they don't have to worry about providing
 * contexts to their components.
 */
import React from 'react'
import TimerContext from './TimerContext'

export interface AppContextType {
  timerContext: TimerContext
}

const AppContext = React.createContext<AppContextType | undefined>(undefined)

export default AppContext
