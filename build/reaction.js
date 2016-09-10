'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _util = require('./util');

exports.default = {

	fromObject: function fromObject(reactions) {
		var keys = Object.keys(reactions);
		return function (newState, oldState, actions) {
			keys.forEach(function (key) {
				var newVal = (0, _util.path)(key.split('.'), newState);
				var oldVal = (0, _util.path)(key.split('.'), oldState);
				if (newVal !== oldVal) {
					reactions[key](newVal, oldVal, actions);
				}
			});
		};
	}
};