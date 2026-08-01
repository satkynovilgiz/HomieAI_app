"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.scrollDistanceWithRespectToSnapPoints = exports.debounce = void 0;
const debounce = (worklet, wait = 0) => {
  "worklet";

  const value = {
    time: 0
  };
  return (...args) => {
    "worklet";

    const t = Date.now();
    const now = t - value.time;
    if (now < wait) {
      value.time = t;
      return;
    }
    value.time = t;
    return worklet(...args);
  };
};
exports.debounce = debounce;
const scrollDistanceWithRespectToSnapPoints = (defaultScrollValue, snapPoints) => {
  "worklet";

  let snapPoint;
  if (snapPoints) {
    snapPoint = snapPoints.find(offset => offset >= defaultScrollValue);
  }
  return snapPoint ?? defaultScrollValue;
};
exports.scrollDistanceWithRespectToSnapPoints = scrollDistanceWithRespectToSnapPoints;
//# sourceMappingURL=utils.js.map