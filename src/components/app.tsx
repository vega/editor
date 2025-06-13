import stringify from 'json-stringify-pretty-compact';
import {parse as parseJSONC} from 'jsonc-parser';
import * as React from 'react';
import {useCallback, useEffect} from 'react';
import {useParams, useNavigate, useLocation} from 'react-router';
import {MessageData} from 'vega-embed';
import {hash} from 'vega-lite';
import * as EditorActions from '../actions/editor.js';
import {LAYOUT, Mode} from '../constants/index.js';
import {NAME_TO_MODE, SIDEPANE, VEGA_LITE_START_SPEC, VEGA_START_SPEC} from '../constants/consts.js';
import {useAppSelector, useAppDispatch} from '../hooks.js';
import './app.css';
import './split.css';
import Header from './header/index.js';
import InputPanel from './input-panel/index.js';
import Sidebar from './sidebar/index.js';
import VizPane from './viz-pane/index.js';
import Split from 'react-split';

type Props = {
  showExample: boolean;
  params?: Record<string, string>;
};

const App: React.FC<Props> = (props) => {
  const dispatch = useAppDispatch();
  const {configEditorString, editorRef, settings} = useAppSelector((state) => ({
    configEditorString: state.configEditorString,
    editorRef: state.editorRef,
    settings: state.settings,
    view: state.view,
  }));

  const params = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const setExample = useCallback(
    async (parameter: {example_name: string; mode: string}) => {
      const name = parameter.example_name;
      dispatch(EditorActions.setConfig(configEditorString));
      dispatch(EditorActions.setSidePaneItem(SIDEPANE.Editor));
      editorRef?.focus();
      switch (parameter.mode) {
        case 'vega': {
          const r = await fetch(`./spec/vega/${name}.vg.json`);
          dispatch(EditorActions.setVegaExample(name, await r.text()));
          break;
        }
        case 'vega-lite': {
          const r = await fetch(`./spec/vega-lite/${name}.vl.json`);
          dispatch(EditorActions.setVegaLiteExample(name, await r.text()));
          break;
        }
        default:
          console.warn(`Unknown mode ${parameter.mode}`);
          break;
      }
    },
    [dispatch, configEditorString, editorRef],
  );

  const setEmptySpec = useCallback(
    (mode: Mode) => {
      if (mode === Mode.Vega) {
        dispatch(EditorActions.updateVegaSpec(VEGA_START_SPEC));
      } else if (mode === Mode.VegaLite) {
        dispatch(EditorActions.updateVegaLiteSpec(VEGA_LITE_START_SPEC));
      }
    },
    [dispatch],
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

        if (!('$schema' in contentObj)) {
          dispatch(EditorActions.setGistVegaLiteSpec('', content));
        } else {
          const mode = contentObj.$schema.split('/').slice(-2)[0];
          if (mode === Mode.Vega) {
            dispatch(EditorActions.setGistVegaSpec('', content));
          } else if (mode === Mode.VegaLite) {
            dispatch(EditorActions.setGistVegaLiteSpec('', content));
          }
        }
      } catch (error) {
        console.error('Error loading gist:', error);
      }
    },
    [dispatch],
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
      dispatch(EditorActions.setBaseUrl(evt.origin));
      console.info('[Vega-Editor] Received Message', evt.origin, data);

      if (data.config) {
        dispatch(EditorActions.setConfig(stringify(data.config)));
      }

      if (data.spec || data.file) {
        // FIXME: remove any
        (evt as any).source.postMessage(true, '*');
      }
      if (data.spec) {
        if (data.mode.toUpperCase() === 'VEGA') {
          dispatch(EditorActions.updateVegaSpec(data.spec));
        } else if (data.mode.toUpperCase() === 'VEGA-LITE') {
          dispatch(EditorActions.updateVegaLiteSpec(data.spec));
        }
      }
      if (data.renderer) {
        dispatch(EditorActions.setRenderer(data.renderer));
      }
    };

    window.addEventListener('message', handleMessage, false);

    const parameter = params;
    if (parameter?.mode) {
      const mode = parameter.mode.toLowerCase();
      if (mode === 'vega' || mode === 'vega-lite') {
        dispatch(EditorActions.setModeOnly(mode as Mode));
      }
    }
    setSpecInUrl(parameter);

    return () => {
      window.removeEventListener('message', handleMessage, false);
    };
  }, [params, dispatch, setSpecInUrl]);

  useEffect(() => {
    setSpecInUrl(params);
  }, [params && hash(params), setSpecInUrl]);

  // Create router props to pass to Header
  const routerProps = {
    match: {params},
    history: {push: navigate},
    location,
    staticContext: undefined,
  };

  return (
    <div className="app-container">
      <Header showExample={props.showExample} {...routerProps} />
      <div
        style={{
          height: `calc(100vh - ${LAYOUT.HeaderHeight}px)`,
        }}
        className="main-panel"
      >
        <Split
          sizes={[40, 60]}
          minSize={300}
          expandToMin={false}
          gutterSize={10}
          gutterAlign="center"
          snapOffset={30}
          dragInterval={1}
          direction="horizontal"
          cursor="col-resize"
          className="main-pane"
        >
          <InputPanel />
          <VizPane />
        </Split>
        {settings && <Sidebar />}
      </div>
    </div>
  );
};

const AppWithRouter: React.FC<{showExample: boolean}> = (props) => {
  return <App {...props} />;
};

export default AppWithRouter;
