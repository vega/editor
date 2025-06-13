import {createSlice, PayloadAction} from '@reduxjs/toolkit';
import {Config} from 'vega-lite';
import stringify from 'json-stringify-pretty-compact';
import {parse as parseJSONC} from 'jsonc-parser';
import * as vega from 'vega';

interface ConfigState {
  config: Config;
  configEditorString: string;
}

const initialState: ConfigState = {
  config: {},
  configEditorString: '{}',
};

export const configSlice = createSlice({
  name: 'config',
  initialState,
  reducers: {
    setConfig: (state, action: PayloadAction<string>) => {
      state.configEditorString = action.payload;
      try {
        state.config = parseJSONC(action.payload);
      } catch (e) {
        console.warn('Invalid config JSON:', e);
      }
    },

    setConfigEditorString: (state, action: PayloadAction<string>) => {
      state.configEditorString = action.payload;
    },

    clearConfig: (state) => {
      state.config = {};
      state.configEditorString = '{}';
    },

    mergeConfigSpec: (state, action: PayloadAction<{spec: any; config: any}>) => {
      const {spec, config} = action.payload;
      try {
        const mergedSpec = {...spec};
        if (mergedSpec.config) {
          mergedSpec.config = vega.mergeConfig(config, mergedSpec.config);
        } else {
          mergedSpec.config = config;
        }

        state.config = {};
        state.configEditorString = '{}';

        return {
          ...state,
          mergedSpec: stringify(mergedSpec),
        };
      } catch (e) {
        console.warn('Error merging config with spec:', e);
      }
    },

    extractConfigSpec: (state, action: PayloadAction<{spec: any; config: any}>) => {
      const {spec, config} = action.payload;
      try {
        const extractedSpec = {...spec};
        let extractedConfig = {...config};

        if (extractedSpec.config) {
          extractedConfig = vega.mergeConfig(extractedConfig, extractedSpec.config);
          delete extractedSpec.config;
        }

        state.configEditorString = stringify(extractedConfig);
        state.config = extractedConfig;

        return {
          ...state,
          extractedSpec: stringify(extractedSpec),
        };
      } catch (e) {
        console.warn('Error extracting config from spec:', e);
      }
    },
  },
});

export const {setConfig, setConfigEditorString, clearConfig, mergeConfigSpec, extractConfigSpec} = configSlice.actions;
