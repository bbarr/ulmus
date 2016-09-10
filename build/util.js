"use strict";

Object.defineProperty(exports, "__esModule", {
	value: true
});

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

var path = exports.path = function path(nodes, obj) {
	return nodes.reduce(function (current, node) {
		return current[node];
	}, obj);
};

var curryN = exports.curryN = function curryN(n, fn) {
	var call = function call(args) {
		for (var _len = arguments.length, newArgs = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
			newArgs[_key - 1] = arguments[_key];
		}

		var allArgs = args.concat(newArgs).slice(0, n);
		if (allArgs.length === n) return fn.apply(undefined, _toConsumableArray(allArgs));
		return call.bind(null, allArgs);
	};
	return call.bind(null, []);
};

var difference = exports.difference = function difference(arr1, arr2) {
	return arr1.reduce(function (diff, item, i) {
		return arr2.indexOf(item) === -1 ? [].concat(_toConsumableArray(diff), [item]) : diff;
	}, []);
};

var isArray = exports.isArray = function isArray(x) {
	return x instanceof Array;
};