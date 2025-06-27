import * as React from 'react';
import {useAppDispatch, useAppSelector} from '../../hooks';
import * as EditorActions from '../../actions/editor';
import Renderer from './renderer.js';

export interface GistSelectWidgetProps {
  selectGist: (id?: string, file?: string, image?: string) => void;
}

export default function GistSelectWidget(props: GistSelectWidgetProps) {
  const dispatch = useAppDispatch();

  const {isAuthenticated, private: isPrivate} = useAppSelector((appState) => ({
    isAuthenticated: appState.isAuthenticated,
    private: appState.private,
  }));

  return (
    <Renderer
      isAuthenticated={isAuthenticated}
      private={isPrivate}
      receiveCurrentUser={(isAuth: boolean, handle?: string, name?: string, profilePicUrl?: string) =>
        dispatch(EditorActions.receiveCurrentUser(isAuth, handle, name, profilePicUrl))
      }
      toggleGistPrivacy={() => dispatch(EditorActions.toggleGistPrivacy())}
      selectGist={props.selectGist}
    />
  );
}
