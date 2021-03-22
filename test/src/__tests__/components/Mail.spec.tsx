import React from 'react'
import { render, cleanup } from '@testing-library/react'

import Mail from '../../components/Mail'

describe('Mail component', () => {
  afterEach(cleanup)

  beforeEach(() => {
    (window as any).gapi = {
      load: jest.fn((type: string, callback: () => void) => {
        if (type === 'client:auth2') callback()
      }),
      client: {
        init: jest.fn((options: any) => Promise.resolve()),
        gmail: { users: { messages: {
          list: jest.fn((options: {userId: string}) => Promise.resolve({
            body: `{ "messages": [] }`
          })),
          get: (options: {
            userId: string,
            id:string
          }) => ({})
        }}},
        newBatch: () => ({
          add: (request: {}) => null,
          then: (callback: (response: any) => void) => {
            callback({ result: [] })
          }
        }),

      },
      auth2: {
        getAuthInstance: () => ({
          isSignedIn: {
            get: jest.fn(() => true),
            listen: jest.fn((callback: (isSignedIn: boolean) => void) => {
              setTimeout(() => callback(true), 20)
            })
          }
        })
      }
    }
    gapi = (window as any).gapi
  })

  test('should match snapshot', () => {
    const component = render(<Mail isSignedIn={true}/>)
    expect(component.container).toMatchSnapshot()
  })

})