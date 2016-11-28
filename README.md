# Ulmus
A minimal Elm-inspired state manager with zero dependencies.

Let's start simple:

```javascript

import { createStore } from 'ulmus'

const counter = createStore({
  init: () => 0
})

counter.getState() // => always 0
```

Pretty boring. So let's add an `action` that will allow us to change the state, perhaps by incrementing it by 1:

```javascript
import { createStore } from 'ulmus'

const counter = createStore({

  init: () => 0,

  actions: {
    increment: () => ({ state }) => state + 1
  }
})

counter.getState() // => 0

counter.actions.increment()

counter.getState() // => 1
```

Note how an action is defined as a function that simply returns another function. The first function
is what you call from you application code, and can take as many arguments as you need. 
The function that is returned takes a `context` object containing, 
among other things, the current state. Whatever this function returns is the new state, 
so for `increment`, we return the current state plus 1. Notice how we only have to call `increment`, but not the the returned function. This is because Ulmus stores are given a bound set of actions that will handle "dispatching" for you, and pass actions this `context` internally.

Now let's say we want to set the counter to a specific value:

```javascript
import { createStore } from 'ulmus'

const counter = createStore({

  init: () => 0,

  actions: {
    increment: () => ({ state }) => state + 1,
    set: n => _ => n
  }
})

counter.getState() // => 0

counter.actions.set(5)

counter.getState() // => 5
```

Now we call the action with an argument, which is received in the first function in our action definition, and 
then returned from the second function. We assign the `context` object to `_` as a placeholder to signal that while we are aware of the `context` being given to us, we have no use for it and will ignore it.

### Them's the basics.

Using the above knowledge, you can effectively write synchronous actions to your heart's content, and this will take you a fair way into any application.

#### Now for the good stuff.

And by good stuff, we mean mainly, async actions. Let's say we have an HTTP endpoint that will serve a random number to GET requests.
The key is, we don't want to introduce asynchronous anything into our actions. Whenever an action is triggered, we must have a meaningful synchronous return value, because this is way simpler to reason about and test.

Let's look at how it will look first, then I will explain:

```javascript
import createStore from 'ulmus'
import axios from 'axios' // <- HTTP client

const counter = createStore({

  init: () => ({ n: 0 }),
    
  effects: {
    get(url, yay, boo) { axios.get(url).then(yay, boo) }
  },
  
  actions: {
    inc: () => ({ state }) => ({ n: state.n + 1 }),
    set: n => _ => ({ n }),
    rand: () => ({ state, commands, actions }) => {
      return [
        state, 
        commands.get(
          'http://my.api/random-number', 
          actions.randSuccess, 
          actions.randFailure
        )
      ]
    },
    randSuccess: n => _ => ({ n }),
    randFailure: error => ({ state }) => ({ ...state, error })
  }
})

counter.subscribe(() => {
  console.log(counter.getState())
})

counter.actions.set(10)

// logs 10

counter.actions.inc()

// logs 11

counter.actions.rand()

// eventually logs some random number, or the previous number and an error message

```

A few new things here: 

1. We made our state an object and put the number for our counter as property `n`. This enables us to attach the `error` message if a call to our API fails.

2. there is now a call to `subscribe` with a callback function that will be executed every time after an action is triggered.

3. Most importantly, actions can return a tuple of [ newState, aCommand ]. Commands are how we trigger side-effects, eventually. When we created our store, we gave it an `effects` object containing a property `get` that fired an HTTP request. This is exposed to our actions in the `commands` property on `context`. The important thing to note is: calling a command does NOT execute a side-effect. It simply returns a piece of data that Ulmus will match to the correct effect and execute asynchronously. This means, again, that commands return data. Our actions are STILL synchronous, and deal with data.

The last point is probably the most important difference between Ulmus and Redux. Your actions remain synchronous, and only modify data. They are referentially transparent. 

Let's say we only want to set our counter to a positive number. If `set` is given a negative number, it should just grab a random number, which let's say will always be positive.

```javascript
set: n => ctx => {
  if (n > 0) return { n }
  const [ newState, randCmd ] = ctx.actions.rand(ctx)
  return [ newState, randCmd ]
}
```

`rand` returns its state and command, and we return it as our own. Simple composition, no side-effects, no magic.

