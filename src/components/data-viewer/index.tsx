import * as React from 'react';
import Renderer, {OwnComponentProps} from './renderer.js';

export default function DataViewer(props: OwnComponentProps) {
  return <Renderer {...props} />;
}
