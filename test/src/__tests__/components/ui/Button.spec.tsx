import React from 'react'
import { render, fireEvent } from '@testing-library/react'

import Button from '../../../components/ui/Button'

describe('Button component', () => {
  describe('Matches the snapshot', () => {
    test('With just content', () => {
      const component = render(<Button>Button Content</Button>)
      expect(component.container).toMatchSnapshot()
    })

    test('With just onClick', () => {
      const component = render(<Button onClick={jest.fn()}>Button Content</Button>)
      expect(component.container).toMatchSnapshot()
    })

    test('When disabled=true', () => {
      const component = render(<Button disabled>Button Content</Button>)
      expect(component.container).toMatchSnapshot()
    })

    test('With one className', () => {
      const component = render(<Button className="oneClassName">Button Content</Button>)
      expect(component.container).toMatchSnapshot()
    })

    test('With two classNames', () => {
      const component = render(<Button className="oneClassName twoClassName">Button Content</Button>)
      expect(component.container).toMatchSnapshot()
    })

    test('With two elements as children', () => {
      const component = render(<Button><div><span>x</span></div></Button>)
      expect(component.container).toMatchSnapshot()
    })
  })

  test('Calls callback on click', () => {
    const callback = jest.fn()
    const component = render(<Button onClick={callback}>Button Content</Button>)

    fireEvent.click(component.getByText('Button Content'))

    expect(callback).toBeCalled()
  })
})
