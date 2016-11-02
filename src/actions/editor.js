export const UPDATE_VEGA_SPEC = 'UPDATE_VEGA_SPEC';
export const UPDATE_VEGA_LITE_SPEC = 'UPDATE_VEGA_LITE_SPEC';
export const TOGGLE_DEBUG = 'TOGGLE_DEBUG';
export const CYCLE_RENDERER = 'CYCLE_RENDERER';

export function updateVegaSpec (spec) {
  return {
    type: UPDATE_VEGA_SPEC,
    spec: spec
  };
};

export function updateVegaLiteSpec (spec) {
  return {
    type: UPDATE_VEGA_LITE_SPEC,
    spec: spec
  };
};


export function toggleDebug () {
  return {
    type: TOGGLE_DEBUG
  };
};

export function cycleRenderer () {
  return {
    type: CYCLE_RENDERER
  };
};
