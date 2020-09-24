import useLazyRef from "./useLazyRef";

export function useResizeObserver(
  callback: ResizeObserverCallback
): ResizeObserver {
  const observerRef = useLazyRef(() => new ResizeObserver(callback));
  return observerRef.current;
}
