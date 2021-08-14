import * as React from 'react';
import './index.css';
import Pulses from './Pulses';
import Graph from './Graph';
import {StoreProps} from '.';
import {useDataflowReducer} from './reducer';

export default function DataflowViewer({pulses, runtime, clearPulses}: StoreProps) {
  const [state, dispatch] = useDataflowReducer({pulses, runtime});

  // When the pulses or runtime prop changes, update the state
  React.useEffect(() => dispatch({type: 'new-pulses', pulses}), [pulses]);
  React.useEffect(() => dispatch({type: 'new-runtime', runtime}), [runtime]);

  return (
    <div className="dataflow-pane">
      <Graph dispatch={dispatch} layoutRunning={!!state.runningLayout} />
      <Pulses dispatch={dispatch} pulses={state.pulses} selectedPulse={state.selectedPulse} clearPulses={clearPulses} />
    </div>
  );
}
