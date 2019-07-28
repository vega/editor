import stringify from 'json-stringify-pretty-compact';
import * as React from 'react';
import { ArrowUpCircle, ChevronDown, ChevronUp } from 'react-feather';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import ReactTooltip from 'react-tooltip';
import { bindActionCreators, Dispatch } from 'redux';
import { mergeDeep } from 'vega-lite/build/src/util';
import * as EditorActions from '../../../actions/editor';
import { Mode, SIDEPANE } from '../../../constants';
import ConfigEditorHeader from '../../config-editor/config-editor-header';

const toggleStyle = {
  cursor: 'pointer',
};

type Props = ReturnType<typeof mapStateToProps> & ReturnType<typeof mapDispatchToProps> & { history: any };

class CompiledSpecDisplayHeader extends React.PureComponent<Props> {
  constructor(props) {
    super(props);
    this.editVegaSpec = this.editVegaSpec.bind(this);
  }

  public handleMergeConfig(e) {
    e.stopPropagation();

    if (this.props.configEditorString === '{}') {
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

      if (!this.props.manualParse) {
        this.props.parseSpec(true);
      }
    } catch (e) {
      console.warn(e);
    }
  }
  public editVegaSpec() {
    if (this.props.history.location.pathname.indexOf('/edited') === -1) {
      this.props.history.push('/edited');
    }
    this.props.clearConfig();
    this.props.updateVegaSpec(stringify(this.props.value));
  }
  public render() {
    if (this.props.compiledVegaSpec) {
      const toggleStyleUp = Object.assign({}, toggleStyle, {
        position: 'static',
      });
      return (
        <div className="editor-header pane-header" onClick={e => this.props.toggleCompiledVegaSpec()}>
          <ul className="tabs-nav">
            {this.props.mode === Mode.VegaLite ? (
              <li
                className={this.props.sidePaneItem === SIDEPANE.CompiledVega ? 'active-tab' : undefined}
                onClick={e => {
                  if (this.props.sidePaneItem === SIDEPANE.CompiledVega) {
                    e.stopPropagation();
                  }
                  e.stopPropagation();
                  this.props.setSidePaneItem(SIDEPANE.CompiledVega);
                }}
              >
                Compiled Vega
              </li>
            ) : null}
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

          {this.props.sidePaneItem === SIDEPANE.CompiledVega && this.props.mode === Mode.VegaLite ? (
            <button className="edit-vega" onClick={this.editVegaSpec} style={{ zIndex: 0, cursor: 'pointer' }}>
              Edit Vega Spec
            </button>
          ) : (
            <>
              <ConfigEditorHeader />
            </>
          )}

          <ArrowUpCircle
            data-tip
            data-for="mergeConfig"
            onClick={e => {
              e.stopPropagation();
              this.handleMergeConfig(e);
            }}
          />
          <ChevronDown />
          <ReactTooltip id="mergeConfig" effect="solid">
            <span style={{ textTransform: 'none' }}>Merge config into spec</span>
          </ReactTooltip>
        </div>
      );
    } else {
      return (
        <div onClick={this.props.toggleCompiledVegaSpec} className="editor-header" style={toggleStyle}>
          <span>{this.props.mode === Mode.VegaLite ? 'Compiled Vega and' : null} Config</span>

          <button onClick={this.editVegaSpec} style={{ zIndex: -1, opacity: 0, cursor: 'pointer' }}>
            Edit Vega Spec
          </button>

          <ChevronUp />
        </div>
      );
    }
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
  )(CompiledSpecDisplayHeader)
);
