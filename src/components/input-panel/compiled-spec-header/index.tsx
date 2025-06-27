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

  const {compiledVegaSpec, value, compiledPaneItem} = useAppSelector((state) => ({
    compiledVegaSpec: state.compiledVegaSpec,
    value: state.compiledPaneItem == COMPILEDPANE.Vega ? state.vegaSpec : state.normalizedVegaLiteSpec,
    compiledPaneItem: state.compiledPaneItem,
  }));

  const editVegaSpec = () => {
    if (window.location.pathname.indexOf('/edited') === -1) {
      navigate('/edited');
    }
    dispatch(EditorActions.clearConfig());
    if (compiledPaneItem == COMPILEDPANE.Vega) {
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

  if (compiledVegaSpec) {
    const toggleStyleUp = {...toggleStyle, position: 'static'} as const;
    return (
      <div className="editor-header" style={toggleStyleUp} onClick={toggleCompiledVegaSpec}>
        <ul className="tabs-nav">
          <li
            className={compiledPaneItem == COMPILEDPANE.Vega ? 'active-tab' : undefined}
            onClick={(e) => {
              setCompiledPaneItem(COMPILEDPANE.Vega);
              e.stopPropagation();
            }}
          >
            Compiled Vega
          </li>

          <li
            className={compiledPaneItem == COMPILEDPANE.NormalizedVegaLite ? 'active-tab' : undefined}
            onClick={(e) => {
              setCompiledPaneItem(COMPILEDPANE.NormalizedVegaLite);
              e.stopPropagation();
            }}
          >
            Extended Vega-Lite Spec
          </li>
        </ul>
        {compiledPaneItem === COMPILEDPANE.Vega ? (
          <button onClick={editVegaSpec} style={{cursor: 'pointer'}}>
            Edit Vega Spec
          </button>
        ) : null}
        {compiledPaneItem === COMPILEDPANE.NormalizedVegaLite ? (
          <button onClick={editVegaSpec} style={{cursor: 'pointer'}}>
            Edit Extended Vega-Lite Spec
          </button>
        ) : null}
        <ChevronDown />
      </div>
    );
  } else {
    return (
      <div onClick={toggleCompiledVegaSpec} className="editor-header" style={toggleStyle}>
        <ul className="tabs-nav">
          <li
            className={compiledPaneItem == COMPILEDPANE.Vega ? 'active-tab' : undefined}
            onClick={() => {
              setCompiledPaneItem(COMPILEDPANE.Vega);
            }}
          >
            Compiled Vega
          </li>
          <li
            className={compiledPaneItem == COMPILEDPANE.NormalizedVegaLite ? 'active-tab' : undefined}
            onClick={() => {
              setCompiledPaneItem(COMPILEDPANE.NormalizedVegaLite);
            }}
          >
            Extended Vega-Lite Spec
          </li>
        </ul>
        <ChevronUp />
      </div>
    );
  }
}

export default CompiledSpecDisplayHeader;

// Keeping these for reference during migration
/*
import {connect, useDispatch, useSelector} from 'react-redux';
import {bindActionCreators, Dispatch} from 'redux';
import {State} from '../../../constants/default-state.js';

function CompiledSpecDisplayHeader() {
  const props = useSelector((state: State) => mapStateToProps(state));
  const dispatch = useDispatch();
  const dispatchProps = mapDispatchToProps(dispatch);
  // ... rest of old implementation
}

function mapStateToProps(state: State) {
  return {
    compiledVegaSpec: state.compiledVegaSpec,
    value: state.compiledPaneItem == COMPILEDPANE.Vega ? state.vegaSpec : state.normalizedVegaLiteSpec,
    compiledPaneItem: state.compiledPaneItem,
  };
}

export function mapDispatchToProps(dispatch: Dispatch<EditorActions.Action>) {
  return bindActionCreators(
    {
      clearConfig: EditorActions.clearConfig,
      toggleCompiledVegaSpec: EditorActions.toggleCompiledVegaSpec,
      updateVegaSpec: EditorActions.updateVegaSpec,
      updateVegaLiteSpec: EditorActions.updateVegaLiteSpec,
      setCompiledPaneItem: EditorActions.setCompiledPaneItem,
    },
    dispatch,
  );
}

export default connect(mapStateToProps, mapDispatchToProps)(CompiledSpecDisplayHeader);
*/
