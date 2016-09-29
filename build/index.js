'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.armActions = exports.buildDispatch = exports.buildCommands = exports.createCommand = undefined;

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _types = require('./types');

var _util = require('./util');

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
  }, { none: function none() {
      return [];
    } });
};

var swapForArmedActions = function swapForArmedActions(list, armedActions) {
  return list.map(function (item) {
    if (typeof item === 'function') {
      return armedActions[item.key];
    }
    return item;
  });
};

var buildDispatch = exports.buildDispatch = function buildDispatch(getState, setState, actions, commands, effects, armedReactions, getArmedActions) {

  var isDispatching = false;

  var dispatch = function dispatch(action) {
    for (var _len2 = arguments.length, args = Array(_len2 > 1 ? _len2 - 1 : 0), _key2 = 1; _key2 < _len2; _key2++) {
      args[_key2 - 1] = arguments[_key2];
    }

    if (isDispatching) throw new Error('Dispatch already running. Make sure effects and reactions are calling subsequent actions asynchronously! ' + JSON.stringify(action, args));
    isDispatching = true;

    // curry
    console.log('should we curry?', args, action);
    if (args.length + 1 < action.expected) return dispatch.bind.apply(dispatch, [null, action].concat(args));

    var result = actions[action.key].apply(actions, args.concat([{ actions: actions, commands: commands, state: getState() }]));

    var hasCommand = Array.isArray(result);
    var newState = hasCommand ? result[0] : result;
    var newCmd = hasCommand ? result[1] : commands.none();

    var oldState = getState();

    setState(newState);

    // side-effect
    newCmd.length && effects[newCmd[0]].apply(effects, _toConsumableArray(swapForArmedActions(newCmd.slice(1), getArmedActions())));

    // side-effect
    armedReactions(newState, oldState, getArmedActions());

    isDispatching = false;
  };

  return dispatch;
};

var armAction = function armAction(dispatch, update, key) {
  return dispatch.bind(null, { expected: update.length, key: key });
};

var armActions = exports.armActions = function armActions(actions, dispatch) {
  return (0, _util.mapObject)(armAction.bind(null, dispatch), actions);
};

var armReactions = function armReactions(reactions) {
  var keys = Object.keys(reactions);
  return function (newState, oldState, actions) {
    keys.forEach(function (key) {
      console.log('in reactions', key, newState, oldState);
      if (key === '*' && newState !== oldState) {
        return reactions[key](newState, oldState, actions);
      }
      var newVal = (0, _util.path)(key.split('.'), newState);
      var oldVal = (0, _util.path)(key.split('.'), oldState);
      if (newVal !== oldVal) return reactions[key](newVal, oldVal, actions);
    });
  };
};

var INIT_ACTION_KEY = '__INIT_ACTION_KEY__';

exports.default = function (_ref) {
  var init = _ref.init;
  var actions = _ref.actions;
  var effects = _ref.effects;
  var reactions = _ref.reactions;


  var state = null;

  var getState = function getState() {
    return state;
  };
  var setState = function setState(newState) {
    return state = newState;
  };

  var commands = buildCommands(effects);
  var armedReactions = armReactions(reactions);
  var getArmedActions = function getArmedActions() {
    return armedActions;
  };

  var completeActions = _extends({}, actions, _defineProperty({}, INIT_ACTION_KEY, init));

  var dispatch = buildDispatch(getState, setState, completeActions, commands, effects, armedReactions, getArmedActions);

  var armedActions = armActions(completeActions, dispatch);

  // initialize!
  armedActions[INIT_ACTION_KEY]({ actions: completeActions, effects: effects });

  return {
    getState: getState,
    actions: armedActions
  };
};