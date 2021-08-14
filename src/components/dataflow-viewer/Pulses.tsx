import * as React from 'react';
import {StoreProps} from '.';
import {Dispatch} from './reducer';

export default function Pulses({
  pulses,
  dispatch,
  selectedPulse,
  clearPulses,
}: {
  pulses: StoreProps['pulses'];
  selectedPulse: number | null;
  dispatch: Dispatch;
  clearPulses: StoreProps['clearPulses'];
}) {
  const onUnselectPulse = React.useCallback(() => dispatch({type: 'select-pulse', clock: null}), [dispatch]);
  return (
    <div className="pulses">
      <h3>Pulses</h3>
      <p>Click to filter nodes to those touched by the pulse</p>
      <button onClick={onUnselectPulse} disabled={selectedPulse === null}>
        Unselect pulse
      </button>
      <button onClick={clearPulses} disabled={pulses.length === 0}>
        Clear recorded pulses
      </button>
      <table className="editor-table">
        <thead>
          <tr>
            <th>Clock</th>
            <th>Touched Nodes</th>
          </tr>
        </thead>
        <tbody>
          {pulses
            // Sort with newest pulses first
            .sort((l, r) => r.clock - l.clock)
            .map(({clock, values}) => (
              <Pulse
                key={clock}
                clock={clock}
                values={values}
                isSelected={clock === selectedPulse}
                dispatch={dispatch}
              />
            ))}
        </tbody>
      </table>
    </div>
  );
}

export function Pulse({
  clock,
  values,
  isSelected,
  dispatch,
}: StoreProps['pulses'][number] & {isSelected: boolean; dispatch: Dispatch}) {
  const onSelect = React.useCallback(() => dispatch({type: 'select-pulse', clock}), [dispatch, clock]);

  return (
    <tr className={isSelected ? 'active-pulse' : ''} onClick={onSelect}>
      <td>{clock}</td>
      <td>{Object.keys(values).length}</td>
    </tr>
  );
}
