
const Effect = (name, run) => {
	const fn = (...args) => ([ name, ...args ])
	fn.run = run
	return fn
}

Effect.fromObject = obj => {
	return Object.keys(obj).reduce((effects, key) => {
		return { ...effects, [key]: Effect(key, obj[key]) }
	}, {})
}

export default Effect
