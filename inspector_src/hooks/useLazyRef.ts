import { defaultCipherList } from "constants";
import { useRef } from "react";

const SENTINEL = Symbol();

export default function useLazyRef<T>(init: () => T) {
  const ref = useRef<T | typeof SENTINEL>(SENTINEL);
  if (ref.current === SENTINEL) {
    ref.current = init();
  }
  return ref as React.MutableRefObject<T>;
}
