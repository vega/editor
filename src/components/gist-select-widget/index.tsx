import * as React from 'react';
import {useAppDispatch, useAppSelector} from '../../hooks.js';
import * as EditorActions from '../../actions/editor.js';
import Renderer from './renderer.js';
import {GistPrivacy} from '../../constants/index.js';

export interface GistSelectWidgetProps {
  selectGist: (id?: string, file?: string, image?: string) => void;
}

export default function GistSelectWidget(props: GistSelectWidgetProps) {
  const dispatch = useAppDispatch();

  const stateProps = useAppSelector((appState) => ({
    isAuthenticated: appState.isAuthenticated,
    private: appState.private,
  }));

  const actions = {
    receiveCurrentUser: (isAuthenticated: boolean, handle?: string, name?: string, profilePicUrl?: string) =>
      dispatch(EditorActions.receiveCurrentUser(isAuthenticated, handle, name, profilePicUrl)),
    toggleGistPrivacy: () => dispatch(EditorActions.toggleGistPrivacy()),
  };

  return <Renderer {...stateProps} {...actions} selectGist={props.selectGist} />;
}
