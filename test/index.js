
// @flow

import assert from 'assert'
import sinon from 'sinon'

import createStore, { 
  buildCommands,
  buildDispatch,
  armActions,
  armReactions
} from '../src/index'

import type {
  Command
} from '../src/types'

declare function describe(desc: string, fn: Function): void
declare function xdescribe(desc: string, fn: Function): void
declare function it(desc: string, fn: Function): void

describe('createCommand', () => {

  it ('should create command', () => {

    const spy = sinon.spy()
    const command = buildCommands({ logging: spy })

    assert.deepEqual(
      command.logging('hi', 'there'),
      [ 'logging', 'hi', 'there' ]
    )
  })
})

describe('createStore', () => {

  it ('should work', (cb) => {

    const spy = sinon.spy.create()

    const store = createStore({

      init: () => 0,

      actions: {
        inc: ({ state, actions, commands }) => state + 1,
        dec: ({ state, commands }) => state - 1,
        set: (val, { state, commands }) => {
          spy(val)
          return val
        }
      },

      effects: {},

      reactions: {}
    })

    setTimeout(() => {
      store.actions.set(5)
      assert.deepEqual(spy.lastCall.args, [ 5 ])
      cb()
    }, 0)
  })
})

describe('arm()', () => {

  it ('should yield a function', () => {
    assert.equal(
      typeof armActions({ Inc: 0 }, function() {}).Inc, 
      'function'
    )
  })

  describe('armed action', () => {

    it ('should call wrapped dispatch', () => {
      const dispatchSpy = sinon.spy()
      const actions = armActions({ Inc: 0 }, dispatchSpy)
      actions.Inc()
      assert(dispatchSpy.called)
    })

  })
})

xdescribe('buildDispatch()', () => {

  it ('should curry 1', () => {

    const dispatchSpy = sinon.spy()
    const actions = armActions({ Inc: 2 }, dispatchSpy)

    const r1 = actions.Inc()
    assert.equal(dispatchSpy.called, false)
    assert.equal(typeof r1, 'function')
  })

  it ('should curry 2', () => {

    const dispatchSpy = sinon.spy()
    const actions = armActions({ Inc: 2 }, dispatchSpy)

    const r = actions.Inc('hi')
    assert.equal(dispatchSpy.called, false)
    assert.equal(typeof r, 'function')
  })

  it ('should curry 3', () => {

    const dispatchSpy = sinon.spy()
    const actions = armActions({ Inc: 2 }, dispatchSpy)

    const r = actions.Inc('hi')('There')
    assert.equal(dispatchSpy.called, true)
    assert.equal(r, true)
  })
})
