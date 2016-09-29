
// @flow

export const path = (nodes: Array<any>, obj: any): any => {
	return nodes.reduce((current, node) => {
		return current[node]
	}, obj)
}

export const mapObject = (mapper: Function, object: Object) => {
  return Object.keys(object).reduce((mapped, key) => {
    return { ...mapped, [key]: mapper(object[key], key) }
  }, {})
}
