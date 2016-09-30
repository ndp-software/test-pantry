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
/******/ 	return __webpack_require__(__webpack_require__.s = 1);
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

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

function Pantry() {

  var pantry = function pantry() {
    for (var _len = arguments.length, names = Array(_len), _key = 0; _key < _len; _key++) {
      names[_key] = arguments[_key];
    }

    var count = 0;
    if (typeof names[0] == 'number') {
      count = names[0];
      names.shift();
    }

    names.forEach(function (name) {
      if (!recipeFn(name) && (typeof name === 'undefined' ? 'undefined' : _typeof(name)) !== 'object') {
        throw 'Unknown factory/trait \'' + name + '\'';
      }
    });
    names.forEach(function (name) {
      if (typeof recipeFn(name) !== 'function' && (typeof name === 'undefined' ? 'undefined' : _typeof(name)) !== 'object') {
        throw 'Factory/trait \'' + name + '\' not a function';
      }
    });

    if (count == 0) {
      return cook(names);
    } else {
      return [].concat(_toConsumableArray(Array(count))).map(function () {
        return cook(names);
      });
    }
  };

  function cook(names) {
    return names.reduce(function (acc, name) {
      return (typeof name === 'undefined' ? 'undefined' : _typeof(name)) == 'object' ? Object.assign({}, acc, name) : buildMergeFn(recipeFn(name))(acc);
    }, {});
  }

  function isEmptyObject(o) {
    return (typeof o === 'undefined' ? 'undefined' : _typeof(o)) == 'object' && Object.keys(o).length == 0;
  }

  function buildMergeFn(fn) {
    if (fn.length === 0) {
      return function (input) {
        var values = fn.call(this);
        if ((typeof values === 'undefined' ? 'undefined' : _typeof(values)) !== 'object') {
          if (!isEmptyObject(input)) {
            throw 'Unable to combine \'' + (typeof values === 'undefined' ? 'undefined' : _typeof(values)) + '\' with input \'' + JSON.stringify(input) + '\'';
          }
          return values;
        }
        return Object.assign({}, input, values);
      };
    } else {
      return fn;
    }
  }

  function callPropertyFns(o) {
    var _this = this;

    return Object.keys(o).reduce(function (result, k) {
      var v = o[k];
      result[k] = typeof v == 'function' ? v.call(_this) : v;
      //console.log(v, typeof v, v.toString(), result[k])
      return result;
    }, {});
  }

  function buildObject(initialValues, values) {
    return Object.assign({}, initialValues, callPropertyFns.call(this, values));
  }

  function buildObjectFn(values) {
    return function (initialValues) {
      return buildObject.call(this, initialValues, values);
    };
  }

  function buildFn(valOrFn) {
    return typeof valOrFn == 'function' ? valOrFn : buildObjectFn(valOrFn);
  }

  pantry.recipeFor = function (name) {
    for (var _len2 = arguments.length, objOrFns = Array(_len2 > 1 ? _len2 - 1 : 0), _key2 = 1; _key2 < _len2; _key2++) {
      objOrFns[_key2 - 1] = arguments[_key2];
    }

    var count = 0;
    var fns = objOrFns.map(function (objOrFn) {
      var type = typeof objOrFn === 'undefined' ? 'undefined' : _typeof(objOrFn);
      //console.log(type, objOrFn)
      if (type === 'object') {
        return buildObjectFn(objOrFn);
      } else if (type === 'function') {
        return buildMergeFn(objOrFn);
      }
    });

    recipeFn(name, function () {
      var initialValues = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

      count++;
      var context = { count: count };
      return fns.reduce(function (vals, fn) {
        return fn.call(context, vals);
      }, initialValues);
    });

    // And return a fn that calls `pantry()` with the right arguments
    return pantry[name] = function () {
      for (var _len3 = arguments.length, args = Array(_len3), _key3 = 0; _key3 < _len3; _key3++) {
        args[_key3] = arguments[_key3];
      }

      if (typeof args[0] == 'number') {
        var _count = args.shift();
        return pantry.apply(undefined, [_count, name].concat(args));
      } else {
        return pantry.apply(undefined, [name].concat(args));
      }
    };
  };

  function recipeFn(name, fn) {
    if (fn) {
      pantry['__' + name] = fn;
    }
    return pantry['__' + name];
  }

  return pantry;
}
module.exports = exports['default'];

/***/ },
/* 1 */
/***/ function(module, exports, __webpack_require__) {

__webpack_require__(0);
(function webpackMissingModule() { throw new Error("Cannot find module \"build\""); }());


/***/ }
/******/ ])
});
;
//# sourceMappingURL=test-pantry.js.map