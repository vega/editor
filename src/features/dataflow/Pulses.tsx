import * as React from 'react';
import {useDispatch} from 'react-redux';
import {useAppSelector} from '../../hooks';
import {selectPulse, resetPulses, Pulse, selectPulses, selectSelectedPulse} from './pulsesSlice';

export function Pulses() {
  const pulses = useAppSelector(selectPulses);
  const selectedPulse = useAppSelector(selectSelectedPulse);
  const dispatch = useDispatch();
  return (
    <div className="pulses">
      <h3>Pulses</h3>
      <p>Click to filter nodes to those touched by the pulse</p>
      <button onClick={() => dispatch(selectPulse(null))} disabled={selectedPulse === null}>
        Unselect pulse
      </button>
      <button onClick={() => dispatch(resetPulses())} disabled={pulses.length === 0}>
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
          {pulses.map(({clock, values}) => (
            <Pulse key={clock} clock={clock} values={values} isSelected={clock === selectedPulse} />
          ))}
        </tbody>
      </table>
    </div>
  );
}

function Pulse({clock, values, isSelected}: Pulse & {isSelected: boolean}) {
  const dispatch = useDispatch();

  return (
    <tr className={isSelected ? 'active-pulse' : ''} onClick={() => dispatch(selectPulse(clock))}>
      <td>{clock}</td>
      <td>{Object.keys(values).length}</td>
    </tr>
  );
}
