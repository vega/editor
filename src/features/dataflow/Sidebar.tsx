import * as React from 'react';
import {useDataflowActions, useDataflowComputed} from './DataflowContext.js';
import './Sidebar.css';
import {GraphType, types} from './utils/graph.js';

export function Sidebar() {
  return (
    <div className="sidebar">
      <Types />
      <Id />
      <Pulses />
    </div>
  );
}

function Types() {
  const {selectedTypes} = useDataflowComputed();

  return (
    <fieldset className="type-filter">
      <legend>Filter by type</legend>
      {Object.entries(types).map(([type, {label}]) => (
        <Type key={type} type={type as GraphType} selected={selectedTypes[type]} label={label} />
      ))}
    </fieldset>
  );
}

function Type({type, label, selected}: {type: GraphType; label: string; selected: boolean}) {
  const {setSelectedType} = useDataflowActions();
  return (
    <div>
      <input type="checkbox" checked={selected} onChange={(event) => setSelectedType(type, event.target.checked)} />
      <label>{label}</label>
    </div>
  );
}

function Id() {
  const [searchTerm, setSearchTerm] = React.useState<string | null>(null);
  const {setSelectedElements} = useDataflowActions();
  return (
    <fieldset className="id-filter">
      <legend>Filter by ID</legend>
      <div>
        <input type="search" title="Pulse Id Search" onChange={(e) => setSearchTerm(e.target.value)} />
        <button
          onClick={() => {
            if (!searchTerm) {
              return;
            }
            setSelectedElements({nodes: [searchTerm], edges: []});
            setSearchTerm(null);
          }}
        >
          Search
        </button>
      </div>
    </fieldset>
  );
}

function Pulses() {
  return (
    <fieldset>
      <legend>Filter by pulse</legend>
      <p>
        Clicking on a pulse filters the nodes to those that were updated in that pulse and displays their values on
        hover.
      </p>
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
    </fieldset>
  );
}

function PulsesButtons() {
  const {selectedPulse, pulsesEmpty} = useDataflowComputed();
  const {setSelectedPulse, resetPulses} = useDataflowActions();
  return (
    <div className="buttons">
      <button onClick={() => setSelectedPulse(null)} disabled={selectedPulse === null}>
        Unselect pulse
      </button>
      <button onClick={() => resetPulses()} disabled={pulsesEmpty}>
        Clear recorded pulses
      </button>
    </div>
  );
}

function PulsesRows() {
  const {sortedPulses, selectedPulse} = useDataflowComputed();
  return (
    <tbody>
      {sortedPulses.map(({clock, nValues}) => (
        <MemoPulse key={clock} clock={clock} nValues={nValues} isSelected={clock === selectedPulse} />
      ))}
    </tbody>
  );
}

const MemoPulse = React.memo(Pulse);

function Pulse({clock, isSelected, nValues}: {isSelected: boolean; clock: number; nValues: number}) {
  const {setSelectedPulse} = useDataflowActions();

  return (
    <tr className={isSelected ? 'active-pulse' : ''} onClick={() => setSelectedPulse(clock)}>
      <td>{clock}</td>
      <td>{nValues}</td>
    </tr>
  );
}
