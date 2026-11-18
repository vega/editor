import {renderHook, waitFor} from '@testing-library/react';
import {afterEach, describe, expect, it, vi} from 'vitest';

const imported = vi.fn();

// Fresh module state per test, since the registration runs once per page.
const loadWebGPU = async () => {
  vi.resetModules();
  vi.doMock('vega-webgpu', () => {
    imported();
    return {};
  });
  return import('../../src/utils/webgpu');
};

const stubGPU = (requestAdapter: () => Promise<unknown>) => {
  const gpu = {requestAdapter: vi.fn(requestAdapter)};
  Object.defineProperty(navigator, 'gpu', {value: gpu, configurable: true});
  return gpu;
};

describe('WebGPU renderer', () => {
  afterEach(() => {
    delete (navigator as any).gpu;
    imported.mockReset();
  });

  it('registers Vega WebGPU where the browser hands out an adapter', async () => {
    stubGPU(() => Promise.resolve({}));
    const {registerWebGPURenderer} = await loadWebGPU();

    const available = await registerWebGPURenderer();

    expect(available).toBe(true);
    expect(imported).toHaveBeenCalledTimes(1);
  });

  it('leaves it out without an adapter', async () => {
    stubGPU(() => Promise.resolve(null));
    const {registerWebGPURenderer} = await loadWebGPU();

    const available = await registerWebGPURenderer();

    expect(available).toBe(false);
    expect(imported).not.toHaveBeenCalled();
  });

  it('leaves it out without navigator.gpu', async () => {
    const {registerWebGPURenderer} = await loadWebGPU();

    const available = await registerWebGPURenderer();

    expect(available).toBe(false);
    expect(imported).not.toHaveBeenCalled();
  });

  it('leaves it out when asking for an adapter fails', async () => {
    stubGPU(() => Promise.reject(new Error('lost')));
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    const {registerWebGPURenderer} = await loadWebGPU();

    const available = await registerWebGPURenderer();

    expect(available).toBe(false);
  });

  it('checks once per page', async () => {
    const gpu = stubGPU(() => Promise.resolve({}));
    const {registerWebGPURenderer} = await loadWebGPU();

    await registerWebGPURenderer();
    await registerWebGPURenderer();

    expect(gpu.requestAdapter).toHaveBeenCalledTimes(1);
    expect(imported).toHaveBeenCalledTimes(1);
  });

  it('turns useWebGPU true once registered', async () => {
    stubGPU(() => Promise.resolve({}));
    const {useWebGPU} = await loadWebGPU();

    const {result} = renderHook(() => useWebGPU());

    expect(result.current).toBe(false);
    await waitFor(() => expect(result.current).toBe(true));
  });

  it('draws with canvas in place of WebGPU until it is registered', async () => {
    const {effectiveRenderer} = await loadWebGPU();

    expect(effectiveRenderer('webgpu', false)).toBe('canvas');
    expect(effectiveRenderer('webgpu', true)).toBe('webgpu');
    expect(effectiveRenderer('svg', false)).toBe('svg');
  });
});
