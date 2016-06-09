
import Reaction from  './reaction'
import Effect from './effect'
import Action from './action'

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

	let state = init()

	const dispatch = action => {
			
		const [ newState, cmd ] = reduce(state, action)

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
		react(newState, state, actions)

		// update existing state
		state = newState
		
		onUpdate(context)
	}

	const effects = { ...(rawEffects || {}), none: Effect('none', () => true) }
	const actions = Action.arm(rawActions || {}, dispatch)
	const update = buildUpdate(actions, effects)
	const react = Reaction.fromObject(rawReactions || {})
	const reduce = Action.kase(update, actions)

	onUpdate({
		actions,
		state
	})

	return undefined
}

export default {
	create: createStore
}

