import {getPublicPath} from '../utils/publicPath';

const VEGA_SPECS_URL = getPublicPath('/spec/vega/index.json');
const VEGA_LITE_SPECS_URL = getPublicPath('/spec/vega-lite/index.json');

let VEGA_SPECS: any = {};
let VEGA_LITE_SPECS: any = {};

const fetchSpecs = async () => {
  try {
    const vegaResponse = await fetch(VEGA_SPECS_URL);
    const vegaLiteResponse = await fetch(VEGA_LITE_SPECS_URL);

    VEGA_SPECS = await vegaResponse.json();
    VEGA_LITE_SPECS = await vegaLiteResponse.json();
  } catch (error) {
    console.error('Failed to load spec data:', error);
  }
};

fetchSpecs();

export {VEGA_SPECS, VEGA_LITE_SPECS};
