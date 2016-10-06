import defaultVegaSpec from '../../../spec/vega/arc.json';

export default (state = {
  vegaSpec: JSON.stringify(defaultVegaSpec, null, 2)
}, action) => {
  switch (action.type) {
    default:
      return state;
  }
}
