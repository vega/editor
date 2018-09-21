import './index.css';

import * as React from 'react';
import * as vega from 'vega';
import * as vl from 'vega-lite';
import { Mode, NAMES } from '../../constants/consts';

const getVersion = (mode: Mode) => {
  return mode === Mode.Vega ? vega.version : vl.version;
};

interface Props {
  mode;
  renderer?: string;

  setRenderer: (val: any) => void;
  toggleDebugPane: () => void;
}

export default class Toolbar extends React.Component<Props> {
  public render() {
    return (
      <div className="toolbar">
        <div className="status">{`${NAMES[this.props.mode]} version ${getVersion(this.props.mode)}`}</div>
        <div
          className="renderer-toggle"
          onClick={() => {
            // Cycle renderer
            const nextRenderer = this.props.renderer === 'svg' ? 'canvas' : 'svg';
            this.props.setRenderer(nextRenderer);
          }}
        >
          {`Renderer: ${this.props.renderer === 'canvas' ? 'Canvas' : 'SVG'}`}
        </div>
      </div>
    );
  }
}
