'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

var _reaction = require('./reaction');

var _reaction2 = _interopRequireDefault(_reaction);

var _effect = require('./effect');

var _effect2 = _interopRequireDefault(_effect);

var _action = require('./action');

var _action2 = _interopRequireDefault(_action);

var _util = require('./util');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

function _toArray(arr) { return Array.isArray(arr) ? arr : Array.from(arr); }

var assert = function assert(condition, errorMsg) {
	if (!condition) throw new Error(errorMsg);
};

var createStore = function createStore(_ref, onUpdate) {
	var rawActions = _ref.actions;
	var buildUpdate = _ref.update;
	var rawReactions = _ref.reactions;
	var rawEffects = _ref.effects;
	var validate = _ref.validate;
	var init = _ref.init;


	assert(typeof init === 'function', '1st argument: Must provide an `init` function as part of object');
	assert(typeof buildUpdate === 'function', '1st argument: Must provide an `update` function as part of object');
	assert(typeof onUpdate === 'function', '2nd argument: must be a function');

	var state = {};
	var isDispatching = false;

	var dispatch = function dispatch(action) {

		assert(!isDispatching, 'Cannot call action synchronously during dispatch/render cycle');
		isDispatching = true;

		var reduced = reduce(state, action);

		var _ref2 = (0, _util.isArray)(reduced) ? reduced : [reduced, effects.none()];

		var _ref3 = _slicedToArray(_ref2, 2);

		var newState = _ref3[0];
		var cmd = _ref3[1];


		var errors = validate && validate(newState);
		assert(!errors, 'Invalid state: ' + JSON.stringify(errors));

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

		react(newState, state, actions);

		// update existing state
		state = newState;

		onUpdate(context);

		isDispatching = false;
	};

	var effects = _extends({}, _effect2.default.fromObject(rawEffects || {}), { none: (0, _effect2.default)('none', function () {
			return true;
		}) });
	var actions = _action2.default.arm(_action2.default.fromObject(rawActions || {}), dispatch);
	var update = buildUpdate(actions, effects);
	var react = _reaction2.default.fromObject(rawReactions || {});
	var reduce = _action2.default.kase(update, actions);

	// INITIALIZATION (needs work)
	//
	var initial = init(actions, effects);

	var _ref4 = (0, _util.isArray)(initial) ? initial : [initial, effects.none()];

	var _ref5 = _slicedToArray(_ref4, 2);

	var initState = _ref5[0];
	var initCmd = _ref5[1];

	// update existing state

	state = initState;

	var _initCmd = _toArray(initCmd);

	var cmdName = _initCmd[0];

	var cmdArgs = _initCmd.slice(1);

	var effect = effects[cmdName];
	assert(effect, 'Missing effect: ' + cmdName);

	// side effect!
	effect.run.apply(effect, _toConsumableArray(cmdArgs));

	onUpdate({
		actions: actions,
		state: state
	});

	return undefined;
};

exports.default = {
	create: createStore
};