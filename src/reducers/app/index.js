import defaultVegaSpec from '../../../spec/vega/arc.json';

export default (state = {
  editorString: JSON.stringify(defaultVegaSpec, null, 2),
  vegaSpec: defaultVegaSpec,
  vegaLiteSpec: null,
  mode: 'vega',
  renderTarget: 'svg'
}, action) => {
  switch (action.type) {
    default:
      return state;
  }
}
