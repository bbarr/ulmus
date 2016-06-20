
import Reaction from  './reaction'
import Effect from './effect'
import Action from './action'

import { isArray } from './util'

const assert = (condition, errorMsg) => {
	if (!condition) throw new Error(errorMsg)
}

const createStore = ({
	actions: rawActions, 
	update: buildUpdate, 
	reactions: rawReactions, 
	effects: rawEffects, 
	validate, 
	init 
}, onUpdate) => {

	assert(typeof init === 'function', '1st argument: Must provide an `init` function as part of object')
	assert(typeof buildUpdate === 'function', '1st argument: Must provide an `update` function as part of object')
	assert(typeof onUpdate === 'function', '2nd argument: must be a function')

	let state = {}
	let isDispatching = false

	const dispatch = action => {

		assert(!isDispatching, 'Cannot call action synchronously during dispatch/render cycle')
		isDispatching = true
			
		const reduced = reduce(state, action)
		const [ newState, cmd ] = isArray(reduced) ? reduced : [ reduced, effects.none() ]

		const errors = validate && validate(newState)
		assert(!errors, 'Invalid state: ' + JSON.stringify(errors))

		const [ cmdName, ...cmdArgs ] = cmd

		const effect = effects[cmdName]
		assert(effect, `Missing effect: ${cmdName}`)

		// side effect!
		effect.run(...cmdArgs)

		const context = {
			actions,
			state: newState
		}

		// possible action call
		setTimeout(() => react(newState, state, actions), 0)

		// update existing state
		state = newState
		
		onUpdate(context)

		isDispatching = false
	}

	const effects = { ...Effect.fromObject(rawEffects || {}), none: Effect('none', () => true) }
	const actions = Action.arm(Action.fromObject(rawActions || {}), dispatch)
	const update = buildUpdate(actions, effects)
	const react = Reaction.fromObject(rawReactions || {})
	const reduce = Action.kase(update, actions)

	// INITIALIZATION (needs work)
	//
	const initial = init(actions, effects)
	const [ initState, initCmd ] = isArray(initial) ? initial : [ initial, effects.none() ]

	// update existing state
	state = initState

	const [ cmdName, ...cmdArgs ] = initCmd

	const effect = effects[cmdName]
	assert(effect, `Missing effect: ${cmdName}`)

	// side effect!
	effect.run(...cmdArgs)

	onUpdate({
		actions,
		state
	})

	return undefined
}

export default {
	create: createStore
}

