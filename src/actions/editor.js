export const UPDATE_VEGA_SPEC = 'UPDATE_VEGA_SPEC';

export function updateVegaSpec (spec) {
  return {
    type: UPDATE_VEGA_SPEC,
    spec: spec
  };
};
