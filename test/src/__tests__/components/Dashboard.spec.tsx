import React from 'react'
import { render, cleanup, RenderResult } from '@testing-library/react'

import Dashboard from '../../components/Dashboard'

describe('Dashboard component', () => {
  let component: RenderResult

  beforeEach(() => {
    component = render(<Dashboard />)
    window.location.assign = jest.fn()
  })

  afterEach(cleanup)

  test('Matches the snapshot', () => {
    expect(component.container).toMatchSnapshot()
  })

  describe('Contains link to', () => {
    test('at least 3 places', () => {
      const anchors = component.container.querySelectorAll('a')
      expect(Object.keys(anchors).length).toBeGreaterThanOrEqual(3)
    })

    test('Google Search', () => {
      const anchors = component.container.querySelectorAll('a')
      expect(Object.values(anchors)
        .map(anchor => anchor.getAttribute('href'))
      )
        .toContain('https://google.com')
    })

    test('Google Docs', () => {
      const anchors = component.container.querySelectorAll('a')
      expect(Object.values(anchors)
        .map(anchor => anchor.getAttribute('href'))
      )
        .toContain('https://docs.google.com')
    })

    test('Google Drive', () => {
      const anchors = component.container.querySelectorAll('a')
      expect(Object.values(anchors)
        .map(anchor => anchor.getAttribute('href'))
      )
        .toContain('https://drive.google.com/drive/my-drive')
    })
  })
})
