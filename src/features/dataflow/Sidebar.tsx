import * as React from 'react';
import {useAppContext} from '../../context/app-context.js';
import {usePulsesState, usePulsesDispatch} from './PulsesProvider.js';
import './Sidebar.css';
import {GraphType, types} from './utils/graph.js';
import {memo, useState} from 'react';

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
  const {state} = useAppContext();
  const selectedTypes = state.types;

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
  const {state, setState} = useAppContext();
  return (
    <div>
      <input
        type="checkbox"
        checked={selected}
        onChange={(event) => setState((s) => ({...s, types: {...s.types, [type]: event.target.checked}}))}
      />
      <label>{label}</label>
    </div>
  );
}

function Id() {
  const [searchTerm, setSearchTerm] = useState<string | null>(null);
  const {state, setState} = useAppContext();
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
            setState((s) => ({...s, elementsSelected: {nodes: [searchTerm], edges: []}}));
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
  const {state, setState} = useAppContext();
  const selectedPulse = state.pulse;
  const pulses = usePulsesState();
  const pulsesDispatch = usePulsesDispatch();
  const pulsesEmpty = pulses.length === 0;
  return (
    <div className="buttons">
      <button onClick={() => setState((s) => ({...s, pulse: null}))} disabled={selectedPulse === null}>
        Unselect pulse
      </button>
      <button onClick={() => pulsesDispatch({type: 'RESET_PULSES'})} disabled={pulsesEmpty}>
        Clear recorded pulses
      </button>
    </div>
  );
}

function PulsesRows() {
  const pulses = usePulsesState().slice(0).reverse();
  const {state} = useAppContext();
  const selectedPulse = state.pulse;
  return (
    <tbody>
      {pulses.map(({clock, nValues}) => (
        <MemoPulse key={clock} clock={clock} nValues={nValues} isSelected={clock === selectedPulse} />
      ))}
    </tbody>
  );
}

const MemoPulse = memo(Pulse);

function Pulse({clock, isSelected, nValues}: {isSelected: boolean; clock: number; nValues: number}) {
  const {state, setState} = useAppContext();

  return (
    <tr className={isSelected ? 'active-pulse' : ''} onClick={() => setState((s) => ({...s, pulse: clock}))}>
      <td>{clock}</td>
      <td>{nValues}</td>
    </tr>
  );
}
