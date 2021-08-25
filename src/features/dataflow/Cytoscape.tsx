import {createSelector} from '@reduxjs/toolkit';
import cytoscape from 'cytoscape';
import * as React from 'react';
import {useDispatch} from 'react-redux';
import {useAppSelector} from '../../hooks';
import {elkGraphWithPositionSelector} from './layoutSlice';
import {filteredGraphSelector} from './selectionSlice';
import {setSelectedElements} from './selectionSlice';
import {toCytoscape} from './utils/toCytoscape';
import {style} from './utils/cytoscapeStyle';
import {setPopup} from './popupSlice';
import popper from 'cytoscape-popper';

cytoscape.use(popper);

export function Cytoscape() {
  const divRef = React.useRef<HTMLDivElement | null>(null);
  const cyRef = React.useRef<cytoscape.Core | null>(null);

  const dispatch = useDispatch();
  const elements = useAppSelector(cytoscapeElementsSelector);

  React.useEffect(() => {
    const cy = (cyRef.current = cytoscape({container: divRef.current, style}));
    cy.on('select', () =>
      dispatch(
        setSelectedElements({
          edges: cy.edges(':selected').map((e) => e.id()),
          nodes: cy.nodes(':selected').map((n) => n.id()),
        })
      )
    );
    cy.on('unselect', () => dispatch(setSelectedElements(null)));
    cy.on('mouseover', ({target}) => {
      if (target === cy) {
        // mouseover background
        return;
      }
      dispatch(
        setPopup({
          type: target.isNode() ? 'node' : 'edge',
          id: target.id(),
          referenceClientRect: target.popperRef().getBoundingClientRect(),
        })
      );
    });
    cy.on('mouseout', ({target}) => {
      if (target === cy) {
        return;
      }
      dispatch(setPopup(null));
    });
    return () => {
      cy.destroy();
      dispatch(setPopup(null));
    };
  }, [divRef.current, dispatch]);

  React.useEffect(() => {
    if (elements !== null) {
      cyRef.current.json({elements});
      cyRef.current.fit();
      // Remove poup when relaying out
      dispatch(setPopup(null));
    }
  }, [cyRef.current, elements]);

  //
  return <div className="cytoscape" ref={divRef} />;
}

const cytoscapeElementsSelector = createSelector(elkGraphWithPositionSelector, filteredGraphSelector, (layout, graph) =>
  layout && graph ? toCytoscape(graph, layout) : null
);
