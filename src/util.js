
export const path = (nodes, obj) => {
	return nodes.reduce((current, node) => {
		return current[node]
	}, obj)
}

export const curryN = (n, fn) => {
	const call = (args, ...newArgs) => {
		const allArgs = args.concat(newArgs)
		if (allArgs.length === n) return fn(...allArgs)
		return call.bind(null, allArgs)
	}
	return call.bind(null, [])
}

export const difference = (arr1, arr2) => {
	return arr1.reduce((diff, item, i) => {
		return arr2.indexOf(item) === -1 ?
			[ ...diff, item ] : diff
	}, [])
}
