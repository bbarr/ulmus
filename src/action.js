
import { curryN, difference } from './util'

const Action = (type, ...expected) => 
	curryN(expected.length, (...args) => ({ type, expected, args }))

Action.kase = (obj, actions, defaultVal={}) => {

	const diff1 = difference(Object.keys(actions), Object.keys(obj))
	const diff2 = difference(Object.keys(obj), Object.keys(actions))

	if (diff1.length)
		throw new Error(`Must include all possible actions in update object, ${JSON.stringify(diff1)} are unaccounted for`)

	if (diff2.length)
		throw new Error(`Must include all possible actions from update in actions object, ${JSON.stringify(diff2)} are unaccounted for`)

	return (state=defaultVal, action) => {
		const updater = obj[action.type]
		if (!updater) return state
		return updater(...[ ...action.args, state ])
	}
}

Action.fromObject = obj => {
	return Object.keys(obj).reduce((actions, key) => {
		return { ...actions, [key]: Action(...[ key, ...obj[key] ]) }
	}, {})
}

Action.arm = (actions, dispatch) => {
	return Object.keys(actions).reduce((armed, key) => {
		return { ...armed, [key]: (...args) => dispatch(actions[key](...args)) }
	}, {})
}

export default Action
