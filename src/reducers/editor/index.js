import defaultVegaSpec from '../../../spec/vega/arc.json';

export default (state = {
  vegaSpec: defaultVegaSpec
}, action) => {
  switch (action.type) {
    default:
      return state;
  }
}
