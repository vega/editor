import * as React from 'react';
import {useDispatch} from 'react-redux';
import {useAppSelector} from '../../hooks';
import {resetPulses, Pulse, selectPulses} from './pulsesSlice';
import './Pulses.css';
import {selectSelectedPulse, setSelectedPulse} from './selectionSlice';

export function Pulses() {
  const pulses = useAppSelector(selectPulses);
  const selectedPulse = useAppSelector(selectSelectedPulse);
  const dispatch = useDispatch();
  return (
    <div className="pulses">
      <h3>Pulses</h3>
      <p>Click to filter nodes to those touched by the pulse</p>
      <div className="buttons">
        <button onClick={() => dispatch(setSelectedPulse(null))} disabled={selectedPulse === null}>
          Unselect
        </button>
        <button onClick={() => dispatch(resetPulses())} disabled={pulses.length === 0}>
          Clear
        </button>
      </div>
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
    <tr className={isSelected ? 'active-pulse' : ''} onClick={() => dispatch(setSelectedPulse(clock))}>
      <td>{clock}</td>
      <td>{Object.keys(values).length}</td>
    </tr>
  );
}
