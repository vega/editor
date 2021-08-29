import * as React from 'react';
import {useDispatch} from 'react-redux';
import {useAppSelector} from '../../hooks';
import {resetPulses, Pulse, sortedPulsesSelector, pulsesEmptySelector} from './pulsesSlice';
import './Sidebar.css';
import {selectedPulseSelector, setSelectedPulse} from './selectionSlice';

export function Sidebar() {
  return (
    <div className="sidebar">
      <Pulses />
    </div>
  );
}

function Pulses() {
  return (
    <>
      <h3>Pulses</h3>
      <p>Click to filter nodes to those touched by the pulse</p>
      <PulsesButtons />
      <table className="editor-table">
        <thead>
          <tr>
            <th>Clock</th>
            <th>Touched Nodes</th>
          </tr>
        </thead>
        <PulsesRows />
      </table>
    </>
  );
}

function PulsesButtons() {
  const dispatch = useDispatch();
  const selectedPulse = useAppSelector(selectedPulseSelector);
  const pulsesEmpty = useAppSelector(pulsesEmptySelector);
  return (
    <div className="buttons">
      <button onClick={() => dispatch(setSelectedPulse(null))} disabled={selectedPulse === null}>
        Unselect
      </button>
      <button onClick={() => dispatch(resetPulses())} disabled={pulsesEmpty}>
        Clear
      </button>
    </div>
  );
}

function PulsesRows() {
  const pulses = useAppSelector(sortedPulsesSelector);
  const selectedPulse = useAppSelector(selectedPulseSelector);
  return (
    <tbody>
      {pulses.map(({clock, nValues}) => (
        <MemoPulse key={clock} clock={clock} nValues={nValues} isSelected={clock === selectedPulse} />
      ))}
    </tbody>
  );
}

const MemoPulse = React.memo(Pulse);

function Pulse({clock, isSelected, nValues}: {isSelected: boolean; clock: number; nValues: number}) {
  const dispatch = useDispatch();

  return (
    <tr className={isSelected ? 'active-pulse' : ''} onClick={() => dispatch(setSelectedPulse(clock))}>
      <td>{clock}</td>
      <td>{nValues}</td>
    </tr>
  );
}
