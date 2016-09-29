# sapling
A minimal Elm-inspired state manager with zero dependencies.

## The big idea
There is a state. This state represents everything that needs to be represented in the application.
There is only one way 

Ulmus takes the following view of application state:

1. There is a single object that acts as the state of your application.
2. In order to change this state, you must use a well-defined **action**.
3. This **action** will be syncronous, and always return a new state, as well as a possible **effect**
4. This **effect** will run asynchronously and can talk to the outside world. It is often given an **action** to then call when it is done, continuing the cycle.
5. For larger, cross-cutting dependencies to be defined on certain parts of the state, we can use **reactions** to watch a specific part of the state and run asynchronously when there is a change.
6. These **reactions** also must call actions to move the state along.
7. Thus, the "render" step of the process, where you render your React application, is simply a **reaction** to the root of the state.

## Example - Todos

```javascript

import React from 'react'
import ReactDom from 'react-dom'
import ulmus from 'ulmus'

import App from './app.jsx'

ulmus({

  init: () => 0,
  
  actions: {
    inc: ({ state }) => state + 1,
    dec: ({ state }) => state - 1,
  },

  reactions: {

    '*': (newState, oldState, actions) => {
      ReactDom.render(
        <App state={newState} actions={actions} />,
        document.body
      )
    }
  }
})

```

