import {Graphviz} from 'graphviz-react';
import * as React from 'react';
import {useEffect, useRef, useState} from 'react';
import {mapStateToProps} from '.';
import {runtime2dot} from '../../utils/vega2dot';
import './index.css';

type StoreProps = ReturnType<typeof mapStateToProps>;

type State = {
  error: Error | null;
};

// Wrap the component so we can catch the errors. We don't use the previously defined
// error boundary component, since we want to seperate errors in graph generation from
// errors in spec rendering
export default class DataflowViewer extends React.Component<StoreProps, State> {
  state: State = {
    error: null,
  };
  public componentDidCatch(error: Error) {
    this.setState({error});
  }

  public render() {
    if (this.state.error) {
      return <div id="error-indicator">{this.state.error.message}</div>;
    }
    return <DataflowViewerInternal {...this.props} />;
  }
}

function DataflowViewerInternal({runtime}: StoreProps) {
  const componentRef = useRef();

  const dot = runtime2dot(runtime);
  // TODO: Use webworker for graphviz
  // https://github.com/DomParfitt/graphviz-react/issues/37

  // Can't set to parent width, so manually get parent container and use this to set
  // https://github.com/DomParfitt/graphviz-react/issues/11
  const {width, height} = useContainerDimensions(componentRef);
  return (
    <div ref={componentRef} className="dataflow-pane">
      <Graphviz dot={dot} options={{fit: true, zoom: true, width, height}} />
    </div>
  );
}

/**
 * From https://stackoverflow.com/a/60978633/907060
 */
export const useContainerDimensions = (myRef) => {
  const getDimensions = () => ({
    width: myRef.current.offsetWidth,
    height: myRef.current.offsetHeight,
  });

  const [dimensions, setDimensions] = useState({width: 0, height: 0});

  useEffect(() => {
    const handleResize = () => {
      setDimensions(getDimensions());
    };

    if (myRef.current) {
      setDimensions(getDimensions());
    }

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [myRef]);

  return dimensions;
};
