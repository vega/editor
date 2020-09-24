import { useRef } from "react";

export function useResizeObserver(
  callback: ResizeObserverCallback
): ResizeObserver {
  const observerRef = useRef(new ResizeObserver(callback));
  return observerRef.current;
}
