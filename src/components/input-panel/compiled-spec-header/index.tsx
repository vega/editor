import stringify from 'json-stringify-pretty-compact';
import * as React from 'react';
import {ChevronDown, ChevronUp} from 'react-feather';
import {useNavigate} from 'react-router';
import {useAppDispatch, useAppSelector} from '../../../hooks.js';
import * as EditorActions from '../../../actions/editor.js';
import {COMPILEDPANE} from '../../../constants/index.js';

const toggleStyle = {
  cursor: 'pointer',
} as const;

function CompiledSpecDisplayHeader() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const {compiledVegaSpec, compiledPaneItem, value} = useAppSelector((state) => ({
    compiledVegaSpec: state.compiledVegaSpec,
    compiledPaneItem: state.compiledPaneItem,
    value: state.compiledPaneItem === COMPILEDPANE.Vega ? state.vegaSpec : state.normalizedVegaLiteSpec,
  }));

  const editSpec = () => {
    navigate('/edited');
    dispatch(EditorActions.clearConfig());
    if (compiledPaneItem === COMPILEDPANE.Vega) {
      dispatch(EditorActions.updateVegaSpec(stringify(value)));
    } else {
      dispatch(EditorActions.updateVegaLiteSpec(stringify(value)));
    }
  };

  const toggleCompiledVegaSpec = () => {
    dispatch(EditorActions.toggleCompiledVegaSpec());
  };

  const setCompiledPaneItem = (item: (typeof COMPILEDPANE)[keyof typeof COMPILEDPANE]) => {
    dispatch(EditorActions.setCompiledPaneItem(item));
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
