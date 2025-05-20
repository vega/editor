declare module 'react-split-pane' {
  import * as React from 'react';

  export interface SplitPaneProps {
    allowResize?: boolean;
    className?: string;
    primary?: 'first' | 'second';
    minSize?: number | string;
    maxSize?: number | string;
    defaultSize?: number | string;
    size?: number | string;
    split?: 'vertical' | 'horizontal';
    style?: React.CSSProperties;
    paneStyle?: React.CSSProperties;
    pane1Style?: React.CSSProperties;
    pane2Style?: React.CSSProperties;
    resizerStyle?: React.CSSProperties;
    step?: number;
    onChange?: (newSize: number) => void;
    onDragStarted?: () => void;
    onDragFinished?: () => void;
    children?: React.ReactNode;
  }

  export default class SplitPane extends React.Component<SplitPaneProps> {}
}
