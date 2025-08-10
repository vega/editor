import * as React from 'react';
import {useAppContext} from '../../context/app-context.js';
import {GistPrivacy} from '../../constants/consts.js';
import Renderer from './renderer.js';

export interface GistSelectWidgetProps {
  selectGist: (id?: string, file?: string, image?: string) => void;
}

export default function GistSelectWidget(props: GistSelectWidgetProps) {
  const {state, setState} = useAppContext();

  const {isAuthenticated, private: isPrivate} = state;

  return (
    <Renderer
      isAuthenticated={isAuthenticated}
      private={isPrivate}
      receiveCurrentUser={(isAuth: boolean, handle?: string, name?: string, profilePicUrl?: string) =>
        setState((s) => ({...s, isAuthenticated: isAuth, handle, name, profilePicUrl}))
      }
      toggleGistPrivacy={() =>
        setState((s) => ({...s, private: s.private === GistPrivacy.PUBLIC ? GistPrivacy.ALL : GistPrivacy.PUBLIC}))
      }
      selectGist={props.selectGist}
    />
  );
}
