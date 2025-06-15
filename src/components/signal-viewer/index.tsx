import * as React from 'react';
import {useAppDispatch, useAppSelector} from '../../hooks.js';
import * as EditorActions from '../../actions/editor.js';
import Renderer from './renderer.js';

export interface SignalViewerProps {
  onClickHandler: (header: string) => void;
}

export default function SignalViewer(props: SignalViewerProps) {
  const dispatch = useAppDispatch();
  const stateProps = useAppSelector((appState) => ({
    signals: appState.signals,
    view: appState.view,
  }));

  const actions = {
    addSignal: (value: any) => dispatch(EditorActions.addSignal(value)),
    setSignals: (signals: any) => dispatch(EditorActions.setSignals(signals)),
    setView: (view: any) => dispatch(EditorActions.setView(view)),
  };

  return <Renderer {...stateProps} {...actions} {...props} />;
}
