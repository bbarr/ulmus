
// @flow

const assoc = (key, val, obj) => {
  return { ...obj, [key]: val }
}

const slice = (arr, i) => {
  return arr && arr.slice ? arr.slice(i) : []
}

export const assocPath = (path: any[], val: any, obj: Object): any => {
  switch (path.length) {
    case 0:
      return val;
    case 1:
      return assoc(path[0], val, obj);
    default:
      return assoc(path[0], assocPath(slice(path, 1), val, Object(obj[path[0]])), obj);
  }
}

export const path = (nodes: Array<any>, obj: any): any => {
  if (!obj) return null
	return nodes.reduce((current, node) => {
		return current ? current[node] : null
	}, obj)
}

export const mapObject = (mapper: Function, object: Object) => {
  return Object.keys(object).reduce((mapped, key) => {
    return { ...mapped, [key]: mapper(object[key], key) }
  }, {})
}
