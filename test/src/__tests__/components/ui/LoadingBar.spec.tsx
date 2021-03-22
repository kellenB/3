import React from 'react'
import { render } from '@testing-library/react'

import LoadingBar from '../../../components/ui/LoadingBar'

describe('LoadingBar component', () => {
  test('Matches the snapshot', () => {
    const loadingBar = render(<LoadingBar />)
    expect(loadingBar.container).toMatchSnapshot()
  })
})
