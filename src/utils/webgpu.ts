import {useEffect, useState} from 'react';
import type {State} from '../constants/default-state.js';

let registered: boolean | undefined;
let registration: Promise<boolean> | undefined;

/**
 * Registers https://github.com/vega/vega-webgpu as Vega's `webgpu` renderer, once, when this browser hands out a
 * WebGPU adapter. Resolves to whether the renderer is registered.
 *
 * `navigator.gpu` alone is not enough, a blocklisted GPU has it and no adapter, and Vega WebGPU then draws nothing.
 */
export function registerWebGPURenderer(): Promise<boolean> {
  registration ??= (async () => {
    const gpu = (navigator as Navigator & {gpu?: {requestAdapter(): Promise<unknown>}}).gpu;
    if (!(await gpu?.requestAdapter())) {
      return false;
    }
    await import('vega-webgpu');
    return true;
  })()
    .catch((error) => {
      console.warn('Vega WebGPU is not available:', error);
      return false;
    })
    .then((available) => {
      registered = available;
      return available;
    });
  return registration;
}

/** Whether the `webgpu` renderer is registered. False until the check has finished. */
export function useWebGPU(): boolean {
  const [available, setAvailable] = useState(registered ?? false);
  useEffect(() => {
    let mounted = true;
    registerWebGPURenderer().then((result) => mounted && setAvailable(result));
    return () => {
      mounted = false;
    };
  }, []);
  return available;
}

/** The renderer the view draws with. Canvas stands in for WebGPU until it is registered, or where it never is. */
export function effectiveRenderer(renderer: State['renderer'], webgpu: boolean): State['renderer'] {
  return renderer === 'webgpu' && !webgpu ? 'canvas' : renderer;
}
