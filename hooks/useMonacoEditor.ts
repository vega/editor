import { MutableRefObject, RefObject, useEffect, useRef } from "react";
import * as monaco from "monaco-editor";
import { useResizeObserver } from "./useResizeObserver";

export function useMonacoEditor(
  containerRef: RefObject<HTMLElement | null>,
  options: monaco.editor.IStandaloneEditorConstructionOptions
): MutableRefObject<monaco.editor.IStandaloneCodeEditor | null> {
  const editorRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(null);
  useEffect(() => {
    if (containerRef.current !== null) {
      if (editorRef.current !== null) {
        editorRef.current.dispose();
        editorRef.current = null;
      }
      editorRef.current = monaco.editor.create(containerRef.current, options);
    }
  }, [containerRef.current]);
  return editorRef;
}

export function useAutoSizeMonacoEditor(
  containerRef: RefObject<HTMLElement | null>,
  options: monaco.editor.IStandaloneEditorConstructionOptions
): MutableRefObject<monaco.editor.IStandaloneCodeEditor | null> {
  const editorRef = useMonacoEditor(containerRef, options);
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
  return editorRef;
}
