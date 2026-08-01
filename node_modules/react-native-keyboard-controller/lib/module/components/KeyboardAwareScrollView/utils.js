export const debounce = (worklet, wait = 0) => {
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
export const scrollDistanceWithRespectToSnapPoints = (defaultScrollValue, snapPoints) => {
  "worklet";

  let snapPoint;
  if (snapPoints) {
    snapPoint = snapPoints.find(offset => offset >= defaultScrollValue);
  }
  return snapPoint ?? defaultScrollValue;
};
//# sourceMappingURL=utils.js.map