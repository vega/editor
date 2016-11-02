export const UPDATE_VEGA_SPEC = 'UPDATE_VEGA_SPEC';
export const UPDATE_VEGA_LITE_SPEC = 'UPDATE_VEGA_LITE_SPEC';

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
