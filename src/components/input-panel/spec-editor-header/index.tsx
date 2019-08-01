import stringify from 'json-stringify-pretty-compact';
import * as React from 'react';
import { ArrowDownCircle, ArrowUpCircle } from 'react-feather';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import ReactTooltip from 'react-tooltip';
import { bindActionCreators, Dispatch } from 'redux';
import { mergeDeep } from 'vega-lite/build/src/util';
import * as EditorActions from '../../../actions/editor';
import { SIDEPANE } from '../../../constants';
import ConfigEditorHeader from '../../config-editor/config-editor-header';

const toggleStyle = {
  cursor: 'pointer',
};

type Props = ReturnType<typeof mapStateToProps> & ReturnType<typeof mapDispatchToProps> & { history: any };

class SpecEditorHeader extends React.PureComponent<Props> {
  public handleMergeConfig(e) {
    e.stopPropagation();

    const confirmation = confirm('The spec will be formatted on merge.');
    if (!confirmation) {
      return;
    }

    if (this.props.configEditorString === '{}') {
      this.props.parseSpec(true);
      return;
    }

    try {
      const spec = JSON.parse(this.props.editorString);
      const config = JSON.parse(this.props.configEditorString);
      if (spec.config) {
        spec.config = mergeDeep(config, spec.config);
      } else {
        spec.config = config;
      }
      this.props.updateEditorString(stringify(spec));

      this.props.clearConfig();
    } catch (e) {
      console.warn(e);
    }

    this.props.parseSpec(true);
  }

  public handleExtractConfig() {
    const confirmation = confirm('The spec and config will be formatted.');
    if (!confirmation) {
      return;
    }

    try {
      const spec = JSON.parse(this.props.editorString);
      let config = JSON.parse(this.props.configEditorString);
      if (spec.config) {
        config = mergeDeep(config, spec.config);
        delete spec.config;
        this.props.updateEditorString(stringify(spec));
        this.props.setConfigEditorString(stringify(config));
      }
    } catch (e) {
      console.warn(e);
    }
    this.props.parseSpec(true);
  }

  public render() {
    const toggleStyleUp = Object.assign({}, toggleStyle, {
      position: 'static',
    });
    return (
      <div className="editor-header pane-header" onClick={e => this.props.toggleCompiledVegaSpec()}>
        <ul className="tabs-nav">
          <li
            className={this.props.sidePaneItem === SIDEPANE.Editor ? 'active-tab' : undefined}
            onClick={e => {
              if (this.props.sidePaneItem === SIDEPANE.Editor) {
                e.stopPropagation();
              }
              e.stopPropagation();
              this.props.setSidePaneItem(SIDEPANE.Editor);
            }}
          >
            {this.props.mode}
          </li>

          <li
            className={this.props.sidePaneItem === SIDEPANE.Config ? 'active-tab' : undefined}
            onClick={e => {
              if (this.props.sidePaneItem === SIDEPANE.Config) {
                e.stopPropagation();
              }
              e.stopPropagation();
              this.props.setSidePaneItem(SIDEPANE.Config);
            }}
          >
            Config
          </li>
        </ul>

        {this.props.sidePaneItem === SIDEPANE.Config && <ConfigEditorHeader />}

        <div className="merge-toolbar">
          <button>
            <ArrowUpCircle
              data-tip
              data-for="mergeConfig"
              onClick={e => {
                e.stopPropagation();
                this.handleMergeConfig(e);
              }}
            />
          </button>
          <button>
            <ArrowDownCircle
              data-tip
              data-for="extractConfig"
              onClick={e => {
                e.stopPropagation();
                this.handleExtractConfig();
              }}
            />
          </button>
          <ReactTooltip id="mergeConfig" effect="solid">
            <span style={{ textTransform: 'none' }}>Merge config into spec</span>
          </ReactTooltip>
          <ReactTooltip id="extractConfig" effect="solid">
            <span style={{ textTransform: 'none' }}>Extract config from spec</span>
          </ReactTooltip>
        </div>
      </div>
    );
  }
}

function mapStateToProps(state, ownProps) {
  return {
    compiledVegaSpec: state.compiledVegaSpec,
    configEditorString: state.configEditorString,
    editorString: state.editorString,
    manualParse: state.manualParse,
    mode: state.mode,
    sidePaneItem: state.sidePaneItem,
    themeName: state.themeName,
    value: state.vegaSpec,
  };
}

export function mapDispatchToProps(dispatch: Dispatch<EditorActions.Action>) {
  return bindActionCreators(
    {
      clearConfig: EditorActions.clearConfig,
      parseSpec: EditorActions.parseSpec,
      setConfig: EditorActions.setConfig,
      setConfigEditorString: EditorActions.setConfigEditorString,
      setSidePaneItem: EditorActions.setSidePaneItem,
      setThemeName: EditorActions.setThemeName,
      toggleCompiledVegaSpec: EditorActions.toggleCompiledVegaSpec,
      updateEditorString: EditorActions.updateEditorString,
      updateVegaSpec: EditorActions.updateVegaSpec,
    },
    dispatch
  );
}

export default withRouter(
  connect(
    mapStateToProps,
    mapDispatchToProps
  )(SpecEditorHeader)
);
