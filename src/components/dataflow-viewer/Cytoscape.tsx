import * as React from 'react';

import {Dispatch} from './reducer';
import style from './style';
import cytoscape from 'cytoscape';
export default function Cytoscape({dispatch}: {dispatch: Dispatch}) {
  const divRef = React.useRef<HTMLDivElement | null>(null);

  React.useEffect(() => {
    const cy = cytoscape({
      container: divRef.current,
      style,
    });

    cy.on('select', () => dispatch({type: 'select-elements'}));
    cy.on('unselect', () => dispatch({type: 'unselect-elements'}));
    cy.on('layoutstop', (e) => dispatch({type: 'layout-stop', layout: e.layout}));
    cy.on('mouseover', ({target}) => dispatch({type: 'mouseover-graph', target}));
    cy.on('mouseout', ({target}) => dispatch({type: 'mouseout-graph', target}));

    dispatch({type: 'set-cytoscape', cy});
  }, [divRef.current, dispatch]);
  return <div className="cytoscape" ref={divRef} />;
}
