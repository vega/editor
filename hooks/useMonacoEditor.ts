import { RefObject, useEffect, useRef } from "react";
import * as monaco from "monaco-editor";
import { useResizeObserver } from "./useResizeObserver";

export function useMonacoEditor(
  containerRef: RefObject<HTMLElement | null>,
  options: monaco.editor.IStandaloneEditorConstructionOptions
): monaco.editor.IStandaloneCodeEditor | null {
  const editorRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(null);
  const observer = useResizeObserver(() => {
    if (editorRef.current !== null) {
      editorRef.current.layout();
    }
  });
  useEffect(() => {
    if (containerRef.current !== null) {
      observer.observe(containerRef.current);
    }
    return () => {
      if (containerRef.current !== null) {
        observer.unobserve(containerRef.current);
      }
    };
  }, [containerRef.current]);
  useEffect(() => {
    if (containerRef.current !== null) {
      if (editorRef.current !== null) {
        editorRef.current.dispose();
        editorRef.current = null;
      }
      editorRef.current = monaco.editor.create(containerRef.current, options);
    }
  }, [containerRef.current]);
  return editorRef.current;
}
