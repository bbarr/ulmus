# Ulmus
A minimal Elm-inspired state manager with zero dependencies.

## The big idea
There is a state. This state represents everything that needs to be represented in the application. Any side-effects must be triggered as an **effect**, or in a **reaction**, which is like an effect that can be triggered globally when any part of the state updates, ie: a new user logs in, respond by trashing the old list of todos and fetching the new user's list.

Ulmus takes the following view of application state:

1. There is a single object that acts as the state of your application.
2. In order to change this state, you must use a well-defined **action**.
3. This **action** will be syncronous, and always return a new state, as well as a possible **effect**
4. This **effect** will run asynchronously and can talk to the outside world. It is often given an **action** to then call when it is done, continuing the cycle.
5. For larger, cross-cutting dependencies to be defined on certain parts of the state, we can use **reactions** to watch a specific part of the state and run asynchronously when there is a change.
6. These **reactions** also must call actions to move the state along.
7. Thus, the "render" step of the process, where you render your React application, is simply a **reaction** to the root of the state.

## Example - Counter

```javascript

import createStore from 'ulmus'

const counter = createStore({

  init: () => 0,
  
  actions: {

    inc: ({ state }) => 
      state + 1,

    dec: ({ state, effects }) => 
      [ state - 1, effects.log('Wow, decremented!') ],

    set: n => _ => n
  },
  
  effects: {
    log: console.log
  },

  reactions: {

    '*': (newState, oldState, actions) => {
      console.log('was ', oldState, ', now ', newState)
    }
  }
})

console.log(counter.getState()) // => 0

counter.actions.set(5)
// LOGS: 'was 0, now 5'
counter.actions.inc()
// LOGS: 'was 5, now 6'
counter.actions.inc()
// LOGS: 'was 6, now 7'
counter.actions.dec()
// LOGS: 'Wow, decremented!'
// LOGS: 'was 7, now 6'

console.log(counter.getState()) // => 6

```

