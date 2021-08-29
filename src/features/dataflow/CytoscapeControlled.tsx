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
 * nodes, and then re-rendered updating those visible elements, before being re-rendered with new elements.
 */
export function CytoscapeControlled({
  elements,
  positions,
  onHover,
  onSelect,
}: {
  elements: cytoscape.ElementsDefinition | null;
  // Mapping of each visible node to its position
  positions: Positions | null;
  onSelect: (elements: Elements | null) => void;
  onHover: (target: null | {type: 'node' | 'edge'; id: string; referenceClientRect: DOMRect}) => void;
}) {
  const divRef = React.useRef<HTMLDivElement | null>(null);
  const cyRef = React.useRef<cytoscape.Core | null>(null);
  // The elements that have been removed, from a selection
  const removedRef = React.useRef<cytoscape.CollectionReturnValue | null>(null);

  // Set cytoscape ref in first effect
  React.useEffect(() => {
    const cy = (cyRef.current = cytoscape({container: divRef.current, style}));
    removedRef.current = null;
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
    cyRef.current.startBatch();
  }, [cyRef.current, elements, positions]);

  // Update the elements
  React.useEffect(() => {
    const cy = cyRef.current;

    cy.elements().remove();
    if (elements !== null) {
      cy.add(elements);
    }
    removedRef.current = null;
  }, [cyRef.current, elements]);

  // Update the positions
  React.useEffect(() => {
    if (positions === null) {
      return;
    }
    const cy = cyRef.current;

    if (removedRef.current) {
      removedRef.current.restore();
    }

    // Convert from ELK's position, which is relative to the parent and for the top left corner,
    // to cytoscape's which is absolute and in the center of the node
    // https://github.com/cytoscape/cytoscape.js-elk/blob/ce1f11d8d9d472d92148f6ec101e69b40268c8b9/src/layout.js#L17-L26

    for (const [id, position] of Object.entries(positions)) {
      const node = cy.$id(id);
      node.position(position);
    }

    // Remove all nodes that don't have positions
    removedRef.current = cy
      .collection(Object.keys(positions).map((id) => cy.$id(id)))
      .absoluteComplement()
      .nodes()
      .remove();
  }, [cyRef.current, positions]);

  React.useEffect(() => {
    cyRef.current.endBatch();
  }, [cyRef.current, elements, positions]);

  // If we updated the positions, fit to viewport after ending batch
  React.useEffect(() => {
    if (positions !== null) {
      cyRef.current.fit();
    }
  }, [cyRef.current, positions]);

  //
  return <div className="cytoscape" ref={divRef} />;
}
