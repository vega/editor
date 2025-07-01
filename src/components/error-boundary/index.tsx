import * as React from 'react';
import {useAppContext} from '../../context/app-context.js';
import Renderer from './renderer.js';

export default function ErrorBoundary(props) {
  const {state, setState} = useAppContext();
  const {error} = state;

  return (
    <Renderer
      error={error}
      logError={(err) => setState((s) => ({...s, error: err}))}
      toggleDebugPane={() => setState((s) => ({...s, debugPane: !s.debugPane}))}
      {...props}
    />
  );
}
