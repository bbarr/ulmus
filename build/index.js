'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.createStore = exports.armActions = exports.buildDispatch = exports.buildCommands = exports.createCommand = undefined;

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _types = require('./types');

var _util = require('./util');

function _toArray(arr) { return Array.isArray(arr) ? arr : Array.from(arr); }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var createCommand = exports.createCommand = function createCommand(key) {
  return function () {
    for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    return [key].concat(args);
  };
};

var buildCommands = exports.buildCommands = function buildCommands(obj) {
  return Object.keys(obj).reduce(function (mapped, key) {
    return _extends({}, mapped, _defineProperty({}, key, createCommand(key)));
  }, {});
};

var buildDispatch = exports.buildDispatch = function buildDispatch(getState, setState, actions, commands, effects, armedReactions, getArmedActions, getSubscriptions) {

  var isDispatching = false;

  var dispatch = function dispatch(action) {
    var _path;

    for (var _len2 = arguments.length, args = Array(_len2 > 1 ? _len2 - 1 : 0), _key2 = 1; _key2 < _len2; _key2++) {
      args[_key2 - 1] = arguments[_key2];
    }

    if (isDispatching) throw new Error('Dispatch already running. Make sure effects and reactions are calling subsequent actions asynchronously! ' + JSON.stringify(action, args));
    isDispatching = true;

    var result = (_path = (0, _util.path)(action.nest, actions))[action.key].apply(_path, args)({
      actions: (0, _util.path)(action.nest, getArmedActions()),
      state: (0, _util.path)(action.nest, getState()),
      commands: commands
    });

    var hasCommand = Array.isArray(result);
    var newState = hasCommand ? result[0] : result;
    var newCmd = hasCommand ? result[1] : commands.none();

    var oldRootState = getState();
    var oldState = (0, _util.path)(action.nest, getState());

    var newRootState = (0, _util.assocPath)(action.nest, newState, getState());

    setState(newRootState);

    // side-effect - async
    setImmediate(function () {
      return newCmd.length && effects[newCmd[0]].apply(effects, _toConsumableArray(newCmd.slice(1)));
    });

    // side-effect - async
    setImmediate(function () {
      return armedReactions(newRootState, oldRootState, getArmedActions());
    });

    // side-effect - sync (for rendering)
    getSubscriptions().forEach(function (s) {
      return s();
    });

    isDispatching = false;
  };

  return dispatch;
};

var armAction = function armAction(dispatch, update, key, nest) {
  var armed = dispatch.bind(null, { key: key, nest: nest });
  armed.raw = update;
  return armed;
};

var armActions = exports.armActions = function armActions(actions, dispatch) {
  var nest = arguments.length <= 2 || arguments[2] === undefined ? [] : arguments[2];
  return (0, _util.mapObject)(function (fn, key) {
    if (typeof fn === 'function') return armAction(dispatch, fn, key, nest);else return armActions(fn, dispatch, nest.concat(key));
  }, actions);
};

var armReactions = function armReactions(reactions) {
  var keys = Object.keys(reactions);
  return function (newState, oldState, actions, getState) {
    keys.forEach(function (key) {
      var newVal = key === '*' ? newState : (0, _util.path)(key.split('.'), newState);
      var oldVal = key === '*' ? oldState : (0, _util.path)(key.split('.'), oldState);
      if (newVal !== oldVal) return reactions[key](newVal, oldVal, actions, newState);
    });
  };
};

var INIT_ACTION_KEY = '__INIT_ACTION_KEY__';

var createStore = exports.createStore = function createStore(_ref) {
  var init = _ref.init;
  var actions = _ref.actions;
  var effects = _ref.effects;
  var reactions = _ref.reactions;
  var onChange = _ref.onChange;


  var state = null;
  var subscriptions = [];

  var getState = function getState() {
    return state;
  };
  var setState = function setState(newState) {
    return state = newState;
  };

  var effectsWithDefaults = _extends({}, effects, {
    none: function none() {
      return true;
    },
    batch: function batch() {
      for (var _len3 = arguments.length, cmds = Array(_len3), _key3 = 0; _key3 < _len3; _key3++) {
        cmds[_key3] = arguments[_key3];
      }

      cmds.forEach(function (_ref2) {
        var _ref3 = _toArray(_ref2);

        var name = _ref3[0];

        var args = _ref3.slice(1);

        effectsWithDefaults[name].apply(effectsWithDefaults, _toConsumableArray(args));
      });
    }
  });

  var commands = buildCommands(effectsWithDefaults);
  var armedReactions = armReactions(reactions);
  var getArmedActions = function getArmedActions() {
    return armedActions;
  };
  var getSubscriptions = function getSubscriptions() {
    return subscriptions;
  };
  var subscribe = function subscribe(fn) {
    subscriptions.push(fn);
    var i = subscriptions.length;
    return function () {
      return subscriptions.splice(i, 1);
    };
  };

  var completeActions = _extends({}, actions, _defineProperty({}, INIT_ACTION_KEY, function () {
    return init;
  }));

  var dispatch = buildDispatch(getState, setState, completeActions, commands, effectsWithDefaults, armedReactions, getArmedActions, getSubscriptions);

  var armedActions = armActions(completeActions, dispatch);

  // initialize!
  armedActions[INIT_ACTION_KEY]({ actions: armedActions, commands: commands });

  return {
    getState: getState,
    subscribe: subscribe,
    actions: armedActions
  };
};