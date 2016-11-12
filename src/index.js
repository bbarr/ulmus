
import { Action, Updater, Command, Effect, Key, InitConfig } from './types'

import { assocPath, path, mapObject } from './util'

export const createCommand = (key: Key): Command => 
  (...args) => [ key, ...args ]

export const buildCommands = obj => {
  return Object.keys(obj).reduce((mapped, key) => {
    return { ...mapped, [key]: createCommand(key) }
  }, {})
}

export const buildDispatch = (
  getState, 
  setState, 
  actions, 
  commands, 
  effects, 
  armedReactions,
  getArmedActions,
  getSubscriptions
) => {

  let isDispatching = false

  const dispatch = (action, ...args) => {

    if (isDispatching)
      throw new Error('Dispatch already running. Make sure effects and reactions are calling subsequent actions asynchronously! ' + JSON.stringify(action, args))
    isDispatching = true

    const result = path(action.nest, actions)[action.key](
      ...args
    )(
      { 
        actions: path(action.nest, getArmedActions()), 
        state: path(action.nest, getState()),
        commands
      }
    )
 
    const hasCommand = Array.isArray(result)
    const newState = hasCommand ? result[0] : result 
    const newCmd = hasCommand ? result[1] : commands.none()

    const oldRootState = getState()
    const oldState = path(action.nest, getState())

    const newRootState = assocPath(action.nest, newState, getState())

    setState(newRootState)

    // side-effect - async
    setImmediate(() => newCmd.length && effects[newCmd[0]](...newCmd.slice(1)))

    // side-effect - async
    setImmediate(() => armedReactions(newRootState, oldRootState, getArmedActions()))

    // side-effect - sync (for rendering)
    getSubscriptions().forEach(s => s())

    isDispatching = false
  }

  return dispatch
}

const armAction = (dispatch: Function, update: Function, key: Key, nest: string[]): Function => {
  const armed = dispatch.bind(null, { key, nest })
  armed.raw = update
  return armed
}

export const armActions = (actions, dispatch, nest=[]) => 
  mapObject((fn, key) => {
    if (typeof fn === 'function') 
      return armAction(dispatch, fn, key, nest)
    else
      return armActions(fn, dispatch, nest.concat(key))
  }, actions)

const armReactions = reactions => {
  const keys = Object.keys(reactions)
  return (newState, oldState, actions, getState) => {
    keys.forEach(key => {
      let newVal = key === '*' ? newState : path(key.split('.'), newState)
      let oldVal = key === '*' ? oldState : path(key.split('.'), oldState) 
      if (newVal !== oldVal)
        return reactions[key](newVal, oldVal, actions, newState)
    })
  }
}

const INIT_ACTION_KEY = '__INIT_ACTION_KEY__'

export const createStore = ({ init, actions, effects, reactions, onChange }: InitConfig): any => {

  let state = null
  let subscriptions = []

  const getState = () => state
  const setState = newState => state = newState

  const effectsWithDefaults = {
    ...effects,
    none: () => true, 
    batch: (...cmds) => {
      cmds.forEach(([ name, ...args ]) => {
        effectsWithDefaults[name](...args)
      })
    }
  }

  const commands = buildCommands(effectsWithDefaults)
  const armedReactions = armReactions(reactions)
  const getArmedActions = () => armedActions
  const getSubscriptions = () => subscriptions
  const subscribe = fn => {
    subscriptions.push(fn)
    const i = subscriptions.length
    return () => subscriptions.splice(i, 1)
  }

  const completeActions = { ...actions, [INIT_ACTION_KEY]: () => init }

  const dispatch = buildDispatch(
    getState,
    setState,
    completeActions,
    commands,
    effectsWithDefaults,
    armedReactions,
    getArmedActions,
    getSubscriptions
  )

  const armedActions = armActions(completeActions, dispatch)

  // initialize!
  armedActions[INIT_ACTION_KEY]({ actions: armedActions, commands })

  return {
    getState,
    subscribe,
    actions: armedActions
  }
}
