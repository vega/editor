import stringify from 'json-stringify-pretty-compact';
import * as React from 'react';
import * as vega from 'vega';
import * as vegaLite from 'vega-lite';
import {useCallback, useEffect} from 'react';
import {useParams} from 'react-router';
import {MessageData} from 'vega-embed';
import {mergeConfig} from 'vega';
import {Config} from 'vega-lite';
import {satisfies} from 'semver';
import schemaParser from 'vega-schema-url-parser';
import {LAYOUT, Mode} from '../constants';
import {NAME_TO_MODE, VEGA_LITE_START_SPEC, VEGA_START_SPEC} from '../constants/consts';
import {useAppContext} from '../context/app-context';
import {LocalLogger} from '../utils/logger';
import {parseJSONCOrThrow, parseJSONC} from '../utils/jsonc-parser';
import {validateVega, validateVegaLite} from '../utils/validate';
import './app.css';
import './split.css';
import Header from './header/renderer.js';
import InputPanel from './input-panel';
import Sidebar from './sidebar';
import VizPane from './viz-pane';
import Split from 'react-split';
import {DataflowProvider} from '../features/dataflow/DataflowContext';

type Props = {
  showExample: boolean;
};

const App: React.FC<Props> = (props) => {
  const appContext = useAppContext();
  const {state, setState} = appContext;
  const {editorRef, settings} = state;

  const params = useParams();

  const setExample = useCallback(
    async (parameter: {example_name: string; mode: string}) => {
      const name = parameter.example_name;
      editorRef?.focus();

      switch (parameter.mode) {
        case 'vega': {
          const r = await fetch(`./spec/vega/${name}.vg.json`);
          const specText = await r.text();
          setState((s) => ({
            ...s,
            editorString: specText,
            mode: Mode.Vega,
            selectedExample: name,
            parse: true,
            error: null,
          }));
          break;
        }
        case 'vega-lite': {
          const r = await fetch(`./spec/vega-lite/${name}.vl.json`);
          const specText = await r.text();
          setState((s) => ({
            ...s,
            editorString: specText,
            mode: Mode.VegaLite,
            selectedExample: name,
            parse: true,
            error: null,
          }));
          break;
        }
      }
    },
    [setState, editorRef],
  );

  const setEmptySpec = useCallback(
    (mode: Mode) => {
      if (mode === Mode.Vega) {
        setState((s) => ({
          ...s,
          editorString: VEGA_START_SPEC,
          mode: Mode.Vega,
          parse: true,
        }));
      } else if (mode === Mode.VegaLite) {
        setState((s) => ({
          ...s,
          editorString: VEGA_LITE_START_SPEC,
          mode: Mode.VegaLite,
          parse: true,
        }));
      }
    },
    [setState],
  );

  const setGist = useCallback(
    async (parameter: {id: string; filename: string; revision?: string}) => {
      try {
        const gistApiUrl = `https://api.github.com/gists/${parameter.id}${
          parameter.revision !== undefined ? `/${parameter.revision}` : ''
        }`;

        const headers: HeadersInit = {
          'Content-Type': 'application/json',
        };

        const githubToken = localStorage.getItem('vega_editor_github_token');
        if (githubToken) {
          headers['Authorization'] = `token ${githubToken}`;
        }

        const gistResponse = await fetch(gistApiUrl, {
          headers,
        });

        if (!gistResponse.ok) {
          throw new Error(`Failed to fetch gist: ${gistResponse.status}`);
        }

        const gistData = await gistResponse.json();

        if (!gistData.files[parameter.filename]) {
          throw new Error(`File ${parameter.filename} not found in gist`);
        }

        let content;

        if (gistData.files[parameter.filename].content) {
          content = gistData.files[parameter.filename].content;
        } else if (gistData.files[parameter.filename].truncated) {
          console.warn('File content truncated - using proxy approach');

          const contentResponse = await fetch(gistData.files[parameter.filename].raw_url, {
            headers,
          });

          if (!contentResponse.ok) {
            throw new Error(`Failed to fetch content: ${contentResponse.status}`);
          }

          content = await contentResponse.text();
        } else {
          throw new Error('Could not retrieve file content');
        }

        const contentObj = parseJSONC(content);

        let detectedMode = Mode.VegaLite;
        if ('$schema' in contentObj && typeof contentObj.$schema === 'string') {
          const schemaPath = contentObj.$schema.split('/');
          const mode = schemaPath[schemaPath.length - 2];
          if (mode === 'vega') {
            detectedMode = Mode.Vega;
          }
        }

        setState((s) => ({
          ...s,
          editorString: content,
          mode: detectedMode,
          parse: true,
          error: null,
        }));
      } catch (error) {
        console.error('Error loading gist:', error);
      }
    },
    [setState],
  );

  const setSpecInUrl = useCallback(
    (parameter: any) => {
      if (parameter) {
        if (parameter.example_name) {
          setExample(parameter);
        } else if (parameter.mode && !parameter.compressed) {
          setEmptySpec(NAME_TO_MODE[parameter.mode]);
        } else if (parameter.id) {
          setGist(parameter);
        }
      }
    },
    [setExample, setEmptySpec, setGist],
  );

  useEffect(() => {
    const handleMessage = (evt: MessageEvent) => {
      const data = evt.data as MessageData;
      if (!data.spec) {
        return;
      }
      setState((s) => ({...s, baseUrl: evt.origin}));
      console.info('[Vega-Editor] Received Message', evt.origin, data);

      if (data.config) {
        setState((s) => ({...s, configEditorString: stringify(data.config)}));
      }

      if (data.spec || data.file) {
        // FIXME: remove any
        (evt as any).source.postMessage(true, '*');
      }
      if (data.spec) {
        setState((s) => ({...s, editorString: data.spec}));
      }
      if (data.renderer) {
        setState((s) => ({...s, renderer: data.renderer}));
      }
    };

    window.addEventListener('message', handleMessage, false);

    if (params?.mode) {
      const mode = params.mode.toLowerCase();
      if (mode === 'vega' || mode === 'vega-lite') {
        setState((s) => ({...s, mode: mode as Mode}));
      }
    }
    setSpecInUrl(params);

    return () => {
      window.removeEventListener('message', handleMessage, false);
    };
  }, [params, setState, setSpecInUrl]);

  // Parse Logic
  useEffect(() => {
    if (state.manualParse) {
      if (!state.parse) {
        return;
      }
    } else {
      if (!state.editorString || state.editorString.trim() === '') {
        return;
      }
    }

    const currLogger = new LocalLogger();
    currLogger.level(state.logLevel);

    try {
      if (state.mode === Mode.VegaLite) {
        const vegaLiteSpec: vegaLite.TopLevelSpec = parseJSONCOrThrow(state.editorString);
        const config: Config = parseJSONCOrThrow(state.configEditorString);

        const options = {
          config,
          logger: currLogger,
        };
        if (vegaLiteSpec.$schema) {
          try {
            const parsed = schemaParser(vegaLiteSpec.$schema);
            if (!satisfies(vega.version, `^${parsed.version.slice(1)}`)) {
              currLogger.warn(
                `The specification expects Vega-Lite ${parsed.version} but the editor uses v${vega.version}.`,
              );
            }
          } catch (e) {
            throw new Error('Could not parse $schema url.');
          }
        }

        validateVegaLite(vegaLiteSpec, currLogger);

        const compileResult =
          state.editorString !== '{}' ? vegaLite.compile(vegaLiteSpec, options) : {spec: {}, normalized: {}};
        const normalizedSpec = compileResult.normalized;

        setState((s) => ({
          ...s,
          vegaLiteSpec: vegaLiteSpec,
          normalizedVegaLiteSpec: normalizedSpec,
          vegaSpec: compileResult.spec,
          parse: false,
          error: null,
          errors: currLogger.errors,
          warns: currLogger.warns,
          infos: currLogger.infos,
          debugs: currLogger.debugs,
        }));
      } else {
        const spec = parseJSONCOrThrow(state.editorString);
        if (spec.$schema) {
          try {
            const parsed = schemaParser(spec.$schema);
            if (!satisfies(vega.version, `^${parsed.version.slice(1)}`)) {
              currLogger.warn(`The specification expects Vega ${parsed.version} but the editor uses v${vega.version}.`);
            }
          } catch (e) {
            throw new Error('Could not parse $schema url.');
          }
        }
        validateVega(spec, currLogger);

        setState((s) => ({
          ...s,
          vegaSpec: spec,
          vegaLiteSpec: null,
          normalizedVegaLiteSpec: null,
          parse: false,
          error: null,
          errors: currLogger.errors,
          warns: currLogger.warns,
          infos: currLogger.infos,
          debugs: currLogger.debugs,
        }));
      }
    } catch (error) {
      setState((s) => ({
        ...s,
        error: {message: error.message},
        parse: false,
        errors: currLogger.errors,
        warns: currLogger.warns,
        infos: currLogger.infos,
        debugs: currLogger.debugs,
      }));
    }
  }, [state.editorString, state.mode, state.parse, state.config, state.logLevel, setState]);

  useEffect(() => {
    if (state.mergeConfigSpec) {
      try {
        const parsedSpec = parseJSONC(state.editorString);
        const parsedConfig = parseJSONC(state.configEditorString);

        const mergedSpec = {
          ...parsedSpec,
          config: mergeConfig({}, parsedConfig, parsedSpec.config || {}),
        };

        setState((s) => ({
          ...s,
          editorString: stringify(mergedSpec),
          configEditorString: '{}',
          mergeConfigSpec: false,
          parse: true,
          error: null,
          themeName: 'custom',
        }));
      } catch (error) {
        console.error('Merge config error:', error);
        setState((s) => ({
          ...s,
          mergeConfigSpec: false,
          error: {message: error.message},
        }));
      }
    }
  }, [state.mergeConfigSpec, state.editorString, state.configEditorString, setState]);

  useEffect(() => {
    if (state.extractConfigSpec) {
      try {
        const parsedSpec = parseJSONC(state.editorString);

        const extractedConfig = parsedSpec.config || {};
        const specWithoutConfig = {...parsedSpec};
        delete specWithoutConfig.config;

        setState((s) => ({
          ...s,
          editorString: stringify(specWithoutConfig),
          configEditorString: stringify(extractedConfig),
          extractConfigSpec: false,
          parse: true,
          error: null,
        }));
      } catch (error) {
        console.error('Extract config error:', error);
        setState((s) => ({
          ...s,
          extractConfigSpec: false,
          error: {message: error.message},
        }));
      }
    }
  }, [state.extractConfigSpec, state.editorString, state.configEditorString, setState]);

  useEffect(() => {
    if (state.extractConfig) {
      try {
        const parsedSpec = parseJSONC(state.editorString);

        const extractedConfig = parsedSpec.config || {};
        const specWithoutConfig = {...parsedSpec};
        delete specWithoutConfig.config;

        setState((s) => ({
          ...s,
          editorString: stringify(specWithoutConfig),
          configEditorString: stringify(extractedConfig),
          extractConfig: false,
          parse: true,
          error: null,
        }));
      } catch (error) {
        console.error('Extract config error:', error);
        setState((s) => ({
          ...s,
          extractConfig: false,
          error: {message: error.message},
        }));
      }
    }
  }, [state.extractConfig, state.editorString, state.configEditorString, setState]);

  // Handle scroll position updates
  useEffect(() => {
    if (state.lastPosition !== undefined && state.lastPosition > 0) {
      // This will be handled by the header component when examples modal is opened
      // The scroll position is stored in state.lastPosition and restored when needed
    }
  }, [state.lastPosition]);

  return (
    <div className="app-container">
      <Header showExample={props.showExample} />
      <div
        style={{
          height: `calc(100vh - ${LAYOUT.HeaderHeight}px)`,
        }}
        className="main-panel"
      >
        <div className="content-with-sidebar">
          <Split
            sizes={[40, 60]}
            minSize={300}
            expandToMin={false}
            gutterSize={3}
            gutterAlign="center"
            snapOffset={30}
            dragInterval={1}
            direction="horizontal"
            cursor="col-resize"
            className="main-pane"
          >
            <InputPanel />
            <DataflowProvider>
              <VizPane />
            </DataflowProvider>
          </Split>
          {settings && (
            <div className="right-sidebar">
              <Sidebar />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default App;
