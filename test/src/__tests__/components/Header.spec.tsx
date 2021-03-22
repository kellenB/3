import React from 'react'
import { render, cleanup, fireEvent } from '@testing-library/react'
import { createMemoryHistory } from 'history'

import { Router, Route } from 'react-router-dom'

import Header from '../../components/Header'

describe('Header component', () => {
  afterEach(cleanup)

  // Note that this snapshot must be updated when the user-widget (#12) is implemented
  test('Matches the snapshot', () => {
    const component = render(
      <Router history={createMemoryHistory()}>
        <Route path="/" component={Header} />
      </Router>
    )
    expect(component.container).toMatchSnapshot()
  })

  test('Navigates to Write', () => {
    const history = createMemoryHistory()
    const component = render(
      <Router history={history}>
        <Route path="/" component={Header} />
      </Router>
    )
    const navButton = component.getByText('Write')
    fireEvent.click(navButton)
    expect(history.location.pathname).toBe('/mail/write')
  })

  test('Navigates to Read', () => {
    const history = createMemoryHistory()
    const component = render(
      <Router history={history}>
        <Route path="/" component={Header} />
      </Router>
    )
    const navButton = component.getByText('Read')
    fireEvent.click(navButton)
    expect(history.location.pathname).toBe('/mail/read')
  })

  // TODO: issue #12
  test.skip('Contains a user information section', () => {
    const history = createMemoryHistory()
    const component = render(
      <Router history={history}>
        <Route path="/" component={Header} />
      </Router>
    )
    expect(component.getByTestId('user-widget')).toBeTruthy()
  })
})
