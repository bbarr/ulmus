
import { 
  Action, 
  Updater,
  Command,
  Effect,
  Key,
  InitConfig
} from './types'

import { path, mapObject } from './util'

export const createCommand = (key: Key): Command => 
  (...args) => [ key, ...args ]

export const buildCommands = obj => {
  return Object.keys(obj).reduce((mapped, key) => {
    return { ...mapped, [key]: createCommand(key) }
  }, { none: () => [] })
}

const swapForArmedActions = (list, armedActions) => {
  return list.map(item => {
    if (typeof item === 'function') {
      return armedActions[item.key]
    }
    return item
  })
}

export const buildDispatch = (
  getState, 
  setState, 
  actions, 
  commands, 
  effects, 
  armedReactions,
  getArmedActions
) => {

  let isDispatching = false

  const dispatch = (action, ...args) => {

    if (isDispatching) 
      throw new Error('Dispatch already running. Make sure effects and reactions are calling subsequent actions asynchronously! ' + JSON.stringify(action, args))
    isDispatching = true

    // curry
    console.log('should we curry?', args, action)
    if (args.length + 1 < action.expected) 
      return dispatch.bind(null, action, ...args)

    const result = actions[action.key](
      ...args,
      { actions, commands, state: getState() }
    )
 
    const hasCommand = Array.isArray(result)
    const newState = hasCommand ? result[0] : result 
    const newCmd = hasCommand ? result[1] : commands.none()

    const oldState = getState()
    
    setState(newState)

    // side-effect
    newCmd.length && effects[newCmd[0]](...swapForArmedActions(newCmd.slice(1), getArmedActions()))

    // side-effect
    armedReactions(newState, oldState, getArmedActions())

    isDispatching = false
  }

  return dispatch
}

const armAction = (dispatch: Function, update: Function, key: Key): Function => {
  return dispatch.bind(null, { expected: update.length, key })
}

export const armActions = (actions, dispatch) => 
  mapObject(armAction.bind(null, dispatch), actions)

const armReactions = reactions => {
  const keys = Object.keys(reactions)
  return (newState, oldState, actions) => {
    keys.forEach(key => {
      console.log('in reactions', key, newState, oldState)
      if (key === '*' && newState !== oldState) {
        return reactions[key](newState, oldState, actions)
      }
      let newVal = path(key.split('.'), newState)   
      let oldVal = path(key.split('.'), oldState)   
      if (newVal !== oldVal)
        return reactions[key](newVal, oldVal, actions)
    })
  }
}

const INIT_ACTION_KEY = '__INIT_ACTION_KEY__'

export default ({ init, actions, effects, reactions }: InitConfig): any => {

  let state = null

  const getState = () => state
  const setState = newState => state = newState

  const commands = buildCommands(effects)
  const armedReactions = armReactions(reactions)
  const getArmedActions = () => armedActions

  const completeActions = { ...actions, [INIT_ACTION_KEY]: init }

  const dispatch = buildDispatch(
    getState,
    setState,
    completeActions,
    commands,
    effects,
    armedReactions,
    getArmedActions
  )

  const armedActions = armActions(completeActions, dispatch)

  // initialize!
  armedActions[INIT_ACTION_KEY]({ actions: completeActions, effects })

  return {
    getState,
    actions: armedActions
  }
}
