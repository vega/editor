import stringify from 'json-stringify-pretty-compact';
import * as React from 'react';
import MonacoEditor from 'react-monaco-editor';
import { connect } from 'react-redux';
import ThemeEditor from '../../theme-editor/index';

import { Mode, SIDEPANE } from '../../../constants';
import { State } from '../../../constants/default-state';
import CompiledSpecDisplayHeader from '../compiled-spec-header';

type Props = ReturnType<typeof mapStateToProps>;

class CompiledSpecDisplay extends React.PureComponent<Props> {
  public render() {
    return (
      <div className={'sizeFixEditorParent full-height-wrapper'}>
        <CompiledSpecDisplayHeader />
        {this.props.sidePaneItem === SIDEPANE.CompiledVega && this.props.mode === Mode.VegaLite ? (
          <>
            <MonacoEditor
              options={{
                automaticLayout: true,
                folding: true,
                minimap: { enabled: false },
                readOnly: true,
                scrollBeyondLastLine: false,
                wordWrap: 'on',
              }}
              language="json"
              value={stringify(this.props.value)}
            />
          </>
        ) : (
          <ThemeEditor />
        )}
      </div>
    );
  }
}

function mapStateToProps(state: State, ownProps) {
  return {
    mode: state.mode,
    sidePaneItem: state.sidePaneItem,
    value: state.vegaSpec,
  };
}

export default connect(mapStateToProps)(CompiledSpecDisplay);
