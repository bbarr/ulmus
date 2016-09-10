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


	var diff = (0, _util.difference)(Object.keys(actions), Object.keys(obj));
	if (diff.length) throw new Error('Must include all possible actions in update object, ' + JSON.stringify(diff) + ' are unaccounted for');

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
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.createStore = exports.Effect = exports.Action = undefined;

var _action = require('./action');

var _action2 = _interopRequireDefault(_action);

var _effect = require('./effect');

var _effect2 = _interopRequireDefault(_effect);

var _store = require('./store');

var _store2 = _interopRequireDefault(_store);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.Action = _action2.default;
exports.Effect = _effect2.default;
exports.createStore = _store2.default;


console.log(createStore);
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
'use strict';

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

var _reaction = require('./reaction');

var _reaction2 = _interopRequireDefault(_reaction);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

function _toArray(arr) { return Array.isArray(arr) ? arr : Array.from(arr); }

var assert = function assert(condition, errorMsg) {
	if (!condition) throw new Error(errorMsg);
};

var createStore = function createStore(_ref, onUpdate) {
	var rawActions = _ref.actions;
	var buildupdate = _ref.update;
	var rawReactions = _ref.reactions;
	var rawEffects = _ref.effects;
	var validate = _ref.validate;
	var init = _ref.init;

	assert(typeof init === 'function', '1st argument: Must provide an `init` function as part of object');
	assert(typeof onUpdate === 'function', '2nd argument: must be a function');

	var state = init();

	var dispatch = function dispatch(action) {
		var _reduce = reduce(state, action);

		var _reduce2 = _slicedToArray(_reduce, 2);

		var newState = _reduce2[0];
		var cmd = _reduce2[1];


		var errors = validate && validate(newState);
		assert(errors, 'Invalid state: ' + JSON.stringify(errors));

		var _cmd = _toArray(cmd);

		var cmdName = _cmd[0];

		var cmdArgs = _cmd.slice(1);

		var effect = effects[cmdName];
		assert(effect, 'Missing effect: ' + cmdName);

		// side effect!
		effect.run.apply(effect, _toConsumableArray(cmdArgs));

		var context = {
			actions: actions,
			state: newState
		};

		// possible action call
		react(newState, currentState, actions);

		// update existing state
		currentState = newState;

		onUpdate(context);
	};

	var effects = _extends({}, rawEffects || {}, { none: Effect('none', function () {
			return true;
		}) });
	var actions = armActions(rawActions || {}, dispatch);
	var update = buildUpdate(armedActions, effects);
	var react = _reaction2.default.fromObject(rawReactions || {});
	var reduce = Action.kase(update, armedActions);

	return dispatch;
};
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

		var allArgs = args.concat(newArgs);
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
