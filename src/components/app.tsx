import stringify from 'json-stringify-pretty-compact';
import {parse as parseJSONC} from 'jsonc-parser';
import * as React from 'react';
import {useCallback, useEffect} from 'react';
import {useParams} from 'react-router';
import {MessageData} from 'vega-embed';
import * as EditorActions from '../actions/editor';
import {LAYOUT, Mode} from '../constants/index';
import {NAME_TO_MODE, SIDEPANE, VEGA_LITE_START_SPEC, VEGA_START_SPEC} from '../constants/consts';
import {useAppSelector, useAppDispatch} from '../hooks';
import './app.css';
import './split.css';
import Header from './header';
import InputPanel from './input-panel';
import Sidebar from './sidebar/index.js';
import VizPane from './viz-pane/index.js';
import Split from 'react-split';

type Props = {
  showExample: boolean;
};

const App: React.FC<Props> = (props) => {
  const dispatch = useAppDispatch();
  const {editorRef, settings} = useAppSelector((state) => ({
    editorRef: state.editorRef,
    settings: state.settings,
    view: state.view,
  }));

  const params = useParams();

  const setExample = useCallback(
    async (parameter: {example_name: string; mode: string}) => {
      const name = parameter.example_name;
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
    [dispatch, editorRef],
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

    if (params?.mode) {
      const mode = params.mode.toLowerCase();
      if (mode === 'vega' || mode === 'vega-lite') {
        dispatch(EditorActions.setModeOnly(mode as Mode));
      }
    }
    setSpecInUrl(params);

    return () => {
      window.removeEventListener('message', handleMessage, false);
    };
  }, [params, dispatch, setSpecInUrl]);

  return (
    <div className="app-container">
      <Header showExample={props.showExample} />
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

export default App;
