
import { path } from './util'

export default {

	fromObject: reactions => {
		const keys = Object.keys(reactions)
		return (newState, oldState, actions) => {
			keys.forEach(key => {
				let newVal = path(key.split('.'), newState)   
				let oldVal = path(key.split('.'), oldState)   
				if (newVal !== oldVal) {
					reactions[key](newVal, oldVal, actions)
				}
			})
		}
	}
}
