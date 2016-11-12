
// @flow

export type Key = string

export type Action = {
  type: string,
  expected: number
}

export type Effect = Function

export type ActionMap = { [key: string]: Action }
export type UpdateMap = { [key: string]: Updater }

export type State = any
export type Command = Array<any>

type UpdateResult = State | [ State, Command ]
export type Updater = (...args: Array<any>) => UpdateResult

type RawActionMap = { [key: Key]: number }
type RawEffectMap = { [key: Key]: Effect }
type RawUpdate = { [key: Key]: Updater }

export type InitConfig = {
  init: Updater,
  actions: RawActionMap,
  effects: RawEffectMap,
  reactions: Object,
  onChange: Function
}
