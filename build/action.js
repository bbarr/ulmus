'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _util = require('./util');

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

var Action = function Action(type) {
	for (var _len = arguments.length, expected = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
		expected[_key - 1] = arguments[_key];
	}

	return (0, _util.curryN)(expected.length, function () {
		for (var _len2 = arguments.length, args = Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
			args[_key2] = arguments[_key2];
		}

		return { type: type, expected: expected, args: args };
	});
};

Action.kase = function (obj, actions) {
	var defaultVal = arguments.length <= 2 || arguments[2] === undefined ? {} : arguments[2];


	var diff1 = (0, _util.difference)(Object.keys(actions), Object.keys(obj));
	var diff2 = (0, _util.difference)(Object.keys(obj), Object.keys(actions));

	if (diff1.length) throw new Error('Must include all possible actions in update object, ' + JSON.stringify(diff1) + ' are unaccounted for');

	if (diff2.length) throw new Error('Must include all possible actions from update in actions object, ' + JSON.stringify(diff2) + ' are unaccounted for');

	return function () {
		var state = arguments.length <= 0 || arguments[0] === undefined ? defaultVal : arguments[0];
		var action = arguments[1];

		var updater = obj[action.type];
		if (!updater) return state;
		return updater.apply(undefined, [].concat(_toConsumableArray(action.args), [state]));
	};
};

Action.fromObject = function (obj) {
	return Object.keys(obj).reduce(function (actions, key) {
		return _extends({}, actions, _defineProperty({}, key, Action.apply(undefined, [key].concat(_toConsumableArray(obj[key])))));
	}, {});
};

Action.arm = function (actions, dispatch) {
	return Object.keys(actions).reduce(function (armed, key) {
		return _extends({}, armed, _defineProperty({}, key, function () {
			return dispatch(actions[key].apply(actions, arguments));
		}));
	}, {});
};

exports.default = Action;