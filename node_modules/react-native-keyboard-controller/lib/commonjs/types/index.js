"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
var _hooks = require("./hooks");
Object.keys(_hooks).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  if (key in exports && exports[key] === _hooks[key]) return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function () {
      return _hooks[key];
    }
  });
});
var _views = require("./views");
Object.keys(_views).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  if (key in exports && exports[key] === _views[key]) return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function () {
      return _views[key];
    }
  });
});
var _module = require("./module");
Object.keys(_module).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  if (key in exports && exports[key] === _module[key]) return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function () {
      return _module[key];
    }
  });
});
var _internal = require("./internal");
Object.keys(_internal).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  if (key in exports && exports[key] === _internal[key]) return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function () {
      return _internal[key];
    }
  });
});
var _provider = require("./provider");
Object.keys(_provider).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  if (key in exports && exports[key] === _provider[key]) return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function () {
      return _provider[key];
    }
  });
});
//# sourceMappingURL=index.js.map