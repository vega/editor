import * as React from 'react';
import {useAppContext} from '../../context/app-context.js';
import Renderer from './renderer.js';

export default function ErrorPane() {
  const {state} = useAppContext();
  const {error, errors, warns, debugs, infos} = state;

  return <Renderer error={error} errors={errors} warns={warns} debugs={debugs} infos={infos} />;
}
