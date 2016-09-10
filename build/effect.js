"use strict";

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var Effect = function Effect(name, run) {
	var fn = function fn() {
		for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
			args[_key] = arguments[_key];
		}

		return [name].concat(args);
	};
	fn.run = run;
	return fn;
};

Effect.fromObject = function (obj) {
	return Object.keys(obj).reduce(function (effects, key) {
		return _extends({}, effects, _defineProperty({}, key, Effect(key, obj[key])));
	}, {});
};

exports.default = Effect;