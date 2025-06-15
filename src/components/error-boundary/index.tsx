import * as React from 'react';
import {useAppDispatch, useAppSelector} from '../../hooks.js';
import * as EditorActions from '../../actions/editor.js';
import Renderer from './renderer.js';

export default function ErrorBoundary(props) {
  const error = useAppSelector((state) => state.error);
  const dispatch = useAppDispatch();

  const boundActions = {
    logError: (err) => dispatch(EditorActions.logError(err)),
    toggleDebugPane: () => dispatch(EditorActions.toggleDebugPane()),
  };

  return <Renderer error={error} {...boundActions} {...props} />;
}
