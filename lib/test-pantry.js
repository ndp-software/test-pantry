(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory();
	else if(typeof define === 'function' && define.amd)
		define("test-pantry", [], factory);
	else if(typeof exports === 'object')
		exports["test-pantry"] = factory();
	else
		root["test-pantry"] = factory();
})(this, function() {
return /******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;
/******/
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// identity function for calling harmory imports with the correct context
/******/ 	__webpack_require__.i = function(value) { return value; };
/******/
/******/ 	// define getter function for harmory exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		Object.defineProperty(exports, name, {
/******/ 			configurable: false,
/******/ 			enumerable: true,
/******/ 			get: getter
/******/ 		});
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports) {

"use strict";
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj; };

exports.default = Pantry;
function Pantry() {

  function buildMergeFn(fn) {
    if (fn.arity === 0) {
      return function (initialValues) {
        return Object.assign({}, initialValues, fn());
      };
    } else {
      return fn;
    }
  }

  var pantry = function pantry() {
    for (var _len = arguments.length, names = Array(_len), _key = 0; _key < _len; _key++) {
      names[_key] = arguments[_key];
    }

    names.forEach(function (name) {
      if (!pantry[name] && (typeof name === 'undefined' ? 'undefined' : _typeof(name)) !== 'object') {
        throw 'Unknown factory/trait \'' + name + '\'';
      }
    });
    names.forEach(function (name) {
      if (typeof pantry[name] !== 'function' && (typeof name === 'undefined' ? 'undefined' : _typeof(name)) !== 'object') {
        throw 'Factory/trait \'' + name + '\' not a function';
      }
    });
    return names.reduce(function (acc, name) {
      return (typeof name === 'undefined' ? 'undefined' : _typeof(name)) == 'object' ? Object.assign({}, acc, name) : buildMergeFn(pantry[name])(acc);
    }, {});
  };

  function buildObject(initialValues, values) {
    var _this = this;

    var result = initialValues;
    Object.keys(values).forEach(function (k) {
      var v = values[k];
      result[k] = typeof v == 'function' ? v.apply(_this) : v;
    });
    return result;
  }

  function buildObjectFn(values) {
    return function (initialValues) {
      return buildObject.call(this, initialValues, values);
    };
  }

  function buildFn(valOrFn) {
    return typeof valOrFn == 'function' ? valOrFn : buildObjectFn(valOrFn);
  }

  pantry.createRecipe = function (name, valOrFn, afterCreateFn) {
    var count = 0;
    var f = function f() {
      var initialValues = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

      count++;
      var context = { count: count },
          fn = buildFn(valOrFn).bind(context),
          result = fn(initialValues);
      return afterCreateFn ? afterCreateFn.call(context, result) : result;
    };
    f.arity = typeof valOrFn == 'function' && valOrFn.length;
    return pantry[name] = f;
  };

  return pantry;
}
module.exports = exports['default'];

/***/ }
/******/ ])
});
;
//# sourceMappingURL=test-pantry.js.map