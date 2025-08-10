import stringify from 'json-stringify-pretty-compact';
import * as React from 'react';
import {ChevronDown, ChevronUp} from 'react-feather';
import {useNavigate} from 'react-router';
import {useAppContext} from '../../../context/app-context.js';
import {COMPILEDPANE, Mode} from '../../../constants/index.js';

const toggleStyle = {
  cursor: 'pointer',
} as const;

function CompiledSpecDisplayHeader() {
  const {state, setState} = useAppContext();
  const navigate = useNavigate();

  const {compiledVegaSpec, compiledPaneItem, value} = {
    compiledVegaSpec: state.compiledVegaSpec,
    compiledPaneItem: state.compiledPaneItem,
    value: state.compiledPaneItem === COMPILEDPANE.Vega ? state.vegaSpec : state.normalizedVegaLiteSpec,
  };

  const editSpec = () => {
    navigate('/edited');
    setState((s) => ({...s, config: {}}));
    if (compiledPaneItem === COMPILEDPANE.Vega) {
      setState((s) => ({...s, editorString: stringify(value), mode: Mode.Vega, parse: true}));
    } else {
      setState((s) => ({...s, editorString: stringify(value), parse: true}));
    }
  };

  const toggleCompiledVegaSpec = () => {
    setState((s) => ({...s, compiledVegaSpec: !s.compiledVegaSpec}));
  };

  const setCompiledPaneItem = (item: (typeof COMPILEDPANE)[keyof typeof COMPILEDPANE]) => {
    setState((s) => ({...s, compiledPaneItem: item}));
    if (!state.compiledVegaSpec) {
      setState((s) => ({...s, compiledVegaSpec: true}));
    }
  };

  return (
    <div className="editor-header" style={toggleStyle} onClick={toggleCompiledVegaSpec}>
      <ul className="tabs-nav">
        <li
          className={compiledPaneItem === COMPILEDPANE.Vega ? 'active-tab' : undefined}
          onClick={(e) => {
            e.stopPropagation();
            setCompiledPaneItem(COMPILEDPANE.Vega);
          }}
        >
          Compiled Vega
        </li>

        <li
          className={compiledPaneItem === COMPILEDPANE.NormalizedVegaLite ? 'active-tab' : undefined}
          onClick={(e) => {
            e.stopPropagation();
            setCompiledPaneItem(COMPILEDPANE.NormalizedVegaLite);
          }}
        >
          Extended Vega-Lite Spec
        </li>
      </ul>
      {compiledVegaSpec && (
        <button onClick={editSpec} style={{cursor: 'pointer'}}>
          {compiledPaneItem === COMPILEDPANE.Vega ? 'Edit Vega Spec' : 'Edit Extended Vega-Lite Spec'}
        </button>
      )}
      {compiledVegaSpec ? <ChevronDown /> : <ChevronUp />}
    </div>
  );
}

export default CompiledSpecDisplayHeader;
