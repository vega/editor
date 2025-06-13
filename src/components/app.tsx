import stringify from 'json-stringify-pretty-compact';
import {parse as parseJSONC} from 'jsonc-parser';
import * as React from 'react';
import {connect} from 'react-redux';
import {useParams, useNavigate} from 'react-router';
import {bindActionCreators, Dispatch} from 'redux';
import {MessageData} from 'vega-embed';
import {hash} from 'vega-lite';
import * as EditorActions from '../actions/editor.js';
import {LAYOUT, Mode} from '../constants/index.js';
import {NAME_TO_MODE, SIDEPANE, VEGA_LITE_START_SPEC, VEGA_START_SPEC} from '../constants/consts.js';
import {State} from '../constants/default-state.js';
import './app.css';
import './split.css';
import Header from './header/index.js';
import InputPanel from './input-panel/index.js';
import Sidebar from './sidebar/index.js';
import VizPane from './viz-pane/index.js';
import Split from 'react-split';

type Props = {showExample: boolean};

type PropsType = ReturnType<typeof mapDispatchToProps> &
  ReturnType<typeof mapStateToProps> &
  Props & {
    params: Record<string, string>;
    navigate: (path: string) => void;
  };

class App extends React.PureComponent<PropsType> {
  public w = window.innerWidth;

  public componentDidMount() {
    window.addEventListener(
      'message',
      (evt) => {
        const data = evt.data as MessageData;
        if (!data.spec) {
          return;
        }
        // setting baseURL as event's origin
        this.props.setBaseUrl(evt.origin);
        console.info('[Vega-Editor] Received Message', evt.origin, data);

        if (data.config) {
          this.props.setConfig(stringify(data.config));
        }

        if (data.spec || data.file) {
          // FIXME: remove any
          (evt as any).source.postMessage(true, '*');
        }
        if (data.spec) {
          if (data.mode.toUpperCase() === 'VEGA') {
            this.props.updateVegaSpec(data.spec);
          } else if (data.mode.toUpperCase() === 'VEGA-LITE') {
            this.props.updateVegaLiteSpec(data.spec);
          }
        }
        if (data.renderer) {
          this.props.setRenderer(data.renderer);
        }
      },
      false,
    );

    const parameter = this.props.params;
    if (parameter.mode) {
      const mode = parameter.mode.toLowerCase();
      if (mode === 'vega' || mode === 'vega-lite') {
        this.props.setModeOnly(mode as Mode);
      }
    }
    this.setSpecInUrl(parameter);
  }

  public componentDidUpdate(prevProps) {
    if (hash(this.props.params) !== hash(prevProps.params)) {
      this.setSpecInUrl(this.props.params);
    }
  }

  public setSpecInUrl(parameter) {
    if (parameter) {
      if (parameter.example_name) {
        this.setExample(parameter);
      } else if (parameter.mode && !parameter.compressed) {
        this.setEmptySpec(NAME_TO_MODE[parameter.mode]);
      } else if (parameter.id) {
        this.setGist(parameter);
      }
    }
  }

  public async setExample(parameter: {example_name: string; mode: string}) {
    const name = parameter.example_name;
    this.props.setConfig(this.props.configEditorString);
    this.props.setSidePaneItem(SIDEPANE.Editor);
    this.props.editorRef?.focus();
    switch (parameter.mode) {
      case 'vega': {
        const r = await fetch(`./spec/vega/${name}.vg.json`);
        this.props.setVegaExample(name, await r.text());
        break;
      }
      case 'vega-lite': {
        const r = await fetch(`./spec/vega-lite/${name}.vl.json`);
        this.props.setVegaLiteExample(name, await r.text());
        break;
      }
      default:
        console.warn(`Unknown mode ${parameter.mode}`);
        break;
    }
  }

  public setEmptySpec(mode: Mode) {
    if (mode === Mode.Vega) {
      this.props.updateVegaSpec(VEGA_START_SPEC);
    } else if (mode === Mode.VegaLite) {
      this.props.updateVegaLiteSpec(VEGA_LITE_START_SPEC);
    }
  }

  public async setGist(parameter: {id: string; filename: string; revision?: string}) {
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
        this.props.setGistVegaLiteSpec('', content);
      } else {
        const mode = contentObj.$schema.split('/').slice(-2)[0];
        if (mode === Mode.Vega) {
          this.props.setGistVegaSpec('', content);
        } else if (mode === Mode.VegaLite) {
          this.props.setGistVegaLiteSpec('', content);
        }
      }
    } catch (error) {
      console.error('Error loading gist:', error);
    }
  }

  public render() {
    return (
      <div className="app-container">
        <Header showExample={this.props.showExample} />
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
          {this.props.settings && <Sidebar />}
        </div>
      </div>
    );
  }
}

function mapStateToProps(state: State, ownProps: Props) {
  return {
    configEditorString: state.configEditorString,
    editorRef: state.editorRef,
    settings: state.settings,
    view: state.view,
  };
}

function mapDispatchToProps(dispatch: Dispatch<EditorActions.Action>) {
  return bindActionCreators(
    {
      setBaseUrl: EditorActions.setBaseUrl,
      setConfig: EditorActions.setConfig,
      setGistVegaLiteSpec: EditorActions.setGistVegaLiteSpec,
      setGistVegaSpec: EditorActions.setGistVegaSpec,
      setModeOnly: EditorActions.setModeOnly,
      setRenderer: EditorActions.setRenderer,
      setSettingsState: EditorActions.setSettingsState,
      setSidePaneItem: EditorActions.setSidePaneItem,
      setVegaExample: EditorActions.setVegaExample,
      setVegaLiteExample: EditorActions.setVegaLiteExample,
      updateVegaLiteSpec: EditorActions.updateVegaLiteSpec,
      updateVegaSpec: EditorActions.updateVegaSpec,
    },
    dispatch,
  );
}

const AppWithRouter = (props: Omit<PropsType, 'params' | 'navigate'>) => {
  const params = useParams();
  const navigate = useNavigate();
  return <App {...props} params={params} navigate={navigate} />;
};

export default connect(mapStateToProps, mapDispatchToProps)(AppWithRouter);
