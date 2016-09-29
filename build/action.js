'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});
exports.arm = exports.fromObject = exports.kase = undefined;

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _util = require('./util');

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var kase = exports.kase = function kase(obj, actions) {
	var defaultVal = arguments.length <= 2 || arguments[2] === undefined ? {} : arguments[2];


	var diff1 = (0, _util.difference)(Object.keys(actions), Object.keys(obj));
	var diff2 = (0, _util.difference)(Object.keys(obj), Object.keys(actions));

	if (diff1.length) throw new Error('Must include all possible actions in update object, ' + JSON.stringify(diff1) + ' are unaccounted for');

	if (diff2.length) throw new Error('Must include all possible actions from update in actions object, ' + JSON.stringify(diff2) + ' are unaccounted for');

	return function (action) {
		var state = arguments.length <= 1 || arguments[1] === undefined ? defaultVal : arguments[1];

		var updater = obj[action.type];
		if (!updater) return state;
		return updater(state);
	};
};

var fromObject = exports.fromObject = function fromObject(obj) {
	return Object.keys(obj).reduce(function (actions, key) {
		return _extends({}, actions, _defineProperty({}, key, action(key, obj[key])));
	}, {});
};

var arm = exports.arm = function arm(actions, dispatch) {

	return Object.keys(actions).reduce(function (armed, key) {
		return _extends({}, armed, _defineProperty({}, key, (0, _util.curryN)(actions[key].expected, function () {
			for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
				args[_key] = arguments[_key];
			}

			dispatch(_extends({}, actions[key], { args: args }));
			return true;
		})));
	}, {});
};

exports.default = action;