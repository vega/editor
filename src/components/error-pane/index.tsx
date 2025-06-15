import * as React from 'react';
import {useAppSelector} from '../../hooks.js';
import Renderer from './renderer.js';

export default function ErrorPane() {
  const errorState = useAppSelector((state) => ({
    error: state.error,
    errors: state.errors,
    warns: state.warns,
    debugs: state.debugs,
    infos: state.infos,
  }));

  return (
    <Renderer
      error={errorState.error}
      errors={errorState.errors}
      warns={errorState.warns}
      debugs={errorState.debugs}
      infos={errorState.infos}
    />
  );
}
