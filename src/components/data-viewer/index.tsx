import * as React from 'react';
import {useAppSelector} from '../../hooks.js';
import Renderer from './renderer.js';

export interface OwnComponentProps {
  onClickHandler: (header: string) => void;
}

export default function DataViewer(props: OwnComponentProps) {
  const stateProps = useAppSelector((appState) => ({
    editorRef: appState.editorRef,
    view: appState.view,
  }));

  return <Renderer {...stateProps} {...props} />;
}
