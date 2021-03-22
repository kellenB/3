import React, { FormEvent, useState, useMemo } from 'react'
import Cookie from 'universal-cookie'

import './styles.css'

import Button from '../ui/Button'

const Settings: React.FC<{
  onSubmit: () => void
}> = (props) => {

  const cookie = useMemo(() => new Cookie(), [])
  
  // No email time
  const [emailTimeStart, setemailTimeStart] = useState(cookie.get('emailTimeStart') || '00:00')
  const [emailTimeEnd, setemailTimeEnd] = useState(cookie.get('emailTimeEnd') || '00:00')

  // Colors
  const fillColourDefault = '#57a5af'
  const [fillColour, setFillColour] = useState(cookie.get('fillColour') || fillColourDefault)

  const highlightColourDefault = '#5eb685'
  const [highlightColour, setHighlightColour] = useState(cookie.get('highlightColour') || highlightColourDefault)

  const backgroundColourDefault = '#efefef'
  const [backgroundColour, setBackgroundColour] = useState(cookie.get('backgroundColour') || backgroundColourDefault)

  const onSubmit = (event: FormEvent) => {
    event.preventDefault()

    // No email time
    cookie.set('emailTimeStart', emailTimeStart)
    cookie.set('emailTimeEnd', emailTimeEnd)

    // Color cookies
    cookie.set('fillColour', fillColour)
    cookie.set('highlightColour', highlightColour)
    cookie.set('backgroundColour', backgroundColour)

    // Color CSS variables
    document.documentElement.style.setProperty("--fillColour", fillColour);
    document.documentElement.style.setProperty("--highlightColour", highlightColour);
    document.documentElement.style.setProperty("--backgroundColour", backgroundColour);

    props.onSubmit()
  }

  return <div className="Settings">
    <form onSubmit={onSubmit} >
      <h1>Settings</h1>

      <h2>Email time</h2>

      <label>Start time</label>
      <input
        type="time"
        value={emailTimeStart}
        max={emailTimeEnd}
        onChange={event => setemailTimeStart(event.target.value)}
      />

      <label>End time</label>
      <input
        type="time"
        value={emailTimeEnd}
        min={emailTimeStart}
        onChange={event => setemailTimeEnd(event.target.value)}
      />

      <h2>Colours</h2>

      <label>Fill Color</label>
      <span>
        <input
          type="color"
          value={fillColour}
          onChange={event => setFillColour(event.target.value)}
        />
        <i className="material-icons" onClick={() => setFillColour(fillColourDefault)}>clear</i>
      </span>

      <label>Highlight Color</label>
      <span>
        <input
          type="color"
          value={highlightColour}
          onChange={event => setHighlightColour(event.target.value)}
        />
        <i className="material-icons" onClick={() => setHighlightColour(highlightColourDefault)}>clear</i>
      </span>

      <label>Background Color</label>
      <span>
        <input
          type="color"
          value={backgroundColour}
          onChange={event => setBackgroundColour(event.target.value)}
        />
        <i className="material-icons" onClick={() => setBackgroundColour(backgroundColourDefault)}>clear</i>
      </span>

      <Button type="submit">Save Settings</Button>
    </form>
  </div>
}

export default Settings
