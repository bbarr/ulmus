
import Action from './action'
import Effect from './effect'
import Store from './store'

const createStore = Store.create

export { Action, Effect, createStore }

/*
const dispatch = createStore({

	init: () => ({ count: 0 }),

	update: (actions, effects) => ({
		Inc: state => [ { ...state, count: state.count + 1 }, effects.none() ],
		Dec: state => [ { ...state, count: state.count - 1 }, effects.none() ],
		Set: (n, state) => [ { ...state, count: n }, effects.none() ]
	}),

	actions: {
		Inc: Action('Inc'),
		Dec: Action('Dec'),
		Set: Action('Set', Number)
	}
}, (context) => {
	console.log('context:', context)
})

*/
