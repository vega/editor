import cytoscape, {Position} from 'cytoscape';
import * as React from 'react';
import {Elements} from './utils/allRelated';
import popper from 'cytoscape-popper';
import {ElkNode} from 'elkjs';
import {Size} from './utils/measureText';
import {style} from './utils/cytoscapeStyle';
import {Positions} from './utils/ELKToPositions';
cytoscape.use(popper);

/**
 * A controlled Cytoscape component, which is mean to be rendered once with a given set of elements and list of visible
 * nodes/edges, and then re-rendered updating those visible elements, before being re-rendered with new elements.
 */
export function CytoscapeControlled({
  elements,
  visible,
  positions,
  onHover,
  onSelect,
}: {
  elements: cytoscape.ElementsDefinition | null;
  visible: {nodes: Set<string>; edges: Set<string>} | null;
  // Mapping of each node to its position
  positions: Positions | null;
  onSelect: (elements: Elements | null) => void;
  onHover: (target: null | {type: 'node' | 'edge'; id: string; referenceClientRect: DOMRect}) => void;
}) {
  const divRef = React.useRef<HTMLDivElement | null>(null);
  const cyRef = React.useRef<cytoscape.Core | null>(null);

  // Set cytoscape ref in first effect
  React.useEffect(() => {
    const cy = (cyRef.current = cytoscape({container: divRef.current, style}));
    cy.on('select', () =>
      onSelect({
        edges: cy.edges(':selected').map((e) => e.id()),
        nodes: cy.nodes(':selected').map((n) => n.id()),
      })
    );
    cy.on('unselect', () => onSelect(null));
    cy.on('mouseover', ({target}) => {
      if (target === cy) {
        // mouseover background
        return;
      }
      onHover({
        type: target.isNode() ? 'node' : 'edge',
        id: target.id(),
        referenceClientRect: target.popperRef().getBoundingClientRect(),
      });
    });
    cy.on('mouseout', ({target}) => {
      if (target === cy) {
        return;
      }
      onHover(null);
    });
    return () => {
      cy.destroy();
      onHover(null);
    };
  }, [divRef.current, onHover, onSelect]);

  // Start a batch update, if we habe changes to make with elements
  React.useEffect(() => {
    console.log('starting batch');
    cyRef.current.startBatch();
  }, [elements, visible, positions]);

  // Update the elements
  React.useEffect(() => {
    const cy = cyRef.current;
    console.log('Removing elements');

    cy.elements().remove();
    if (elements !== null) {
      console.log('Adding elements');
      cy.add(elements);
    }
  }, [elements]);

  // Update the visible elements
  React.useEffect(() => {
    const cy = cyRef.current;

    // Set the only visible elements to those in the visible set, if provided
    // Use `display` instead of `visible` to avoid making space for hidden ones when
    // fitting viewport
    // https://js.cytoscape.org/#style/visibility
    if (visible === null) {
      console.log('Setting all to visible');

      cy.elements().style('display', 'element');
    } else {
      console.log('Filtering visible');

      cy.$(':visible').style('display', 'none');
      for (const id of [...visible.edges, ...visible.nodes]) {
        cy.$id(id).style('display', 'element');
      }
    }
  }, [visible]);

  // Update the positions
  React.useEffect(() => {
    if (positions === null) {
      return;
    }
    const cy = cyRef.current;
    // Convert from ELK's position, which is relative to the parent and for the top left corner,
    // to cytoscape's which is absolute and in the center of the node
    // https://github.com/cytoscape/cytoscape.js-elk/blob/ce1f11d8d9d472d92148f6ec101e69b40268c8b9/src/layout.js#L17-L26
    console.log('Setting positions');

    for (const [id, position] of Object.entries(positions)) {
      cy.$id(id).position(position);
    }
  }, [positions]);

  React.useEffect(() => {
    console.log('ending batch');
    cyRef.current.endBatch();
  }, [elements, visible, positions]);

  // If we updated the positions, fit to viewport after ending batch
  React.useEffect(() => {
    if (positions !== null) {
      console.log('fitting viewport');
      cyRef.current.fit();
    }
  }, [positions]);

  //
  return <div className="cytoscape" ref={divRef} />;
}
