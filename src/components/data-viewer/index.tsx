import * as React from 'react';
import {useAppSelector} from '../../hooks.js';
import Renderer from './renderer.js';

export interface OwnComponentProps {
  onClickHandler: (header: string) => void;
}

export default function DataViewer(props: OwnComponentProps) {
  const editorRef = useAppSelector((state) => state.editorRef);
  const view = useAppSelector((state) => state.view);

  return <Renderer editorRef={editorRef} view={view} {...props} />;
}
