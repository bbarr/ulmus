"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var assoc = function assoc(key, val, obj) {
  return _extends({}, obj, _defineProperty({}, key, val));
};

var slice = function slice(arr, i) {
  return arr && arr.slice ? arr.slice(i) : [];
};

var assocPath = exports.assocPath = function assocPath(path, val, obj) {
  switch (path.length) {
    case 0:
      return val;
    case 1:
      return assoc(path[0], val, obj);
    default:
      return assoc(path[0], assocPath(slice(path, 1), val, Object(obj[path[0]])), obj);
  }
};

var path = exports.path = function path(nodes, obj) {
  if (!obj) return null;
  return nodes.reduce(function (current, node) {
    return current ? current[node] : null;
  }, obj);
};

var mapObject = exports.mapObject = function mapObject(mapper, object) {
  return Object.keys(object).reduce(function (mapped, key) {
    return _extends({}, mapped, _defineProperty({}, key, mapper(object[key], key)));
  }, {});
};