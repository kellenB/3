import React from 'react'
import { render } from '@testing-library/react'

import Settings from '../../components/Settings'

describe('Settings page', () => {
  it('Matches snapshot', () => {
    const component = render(<Settings onSubmit={jest.fn()} />)

    expect(component).toMatchSnapshot()
  })
})