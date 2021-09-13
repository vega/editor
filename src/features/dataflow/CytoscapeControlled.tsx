import cytoscape from 'cytoscape';
import * as React from 'react';
import {Elements} from './utils/allRelated';
import popper from 'cytoscape-popper';
import {style} from './utils/cytoscapeStyle';
import {Positions} from './utils/ELKToPositions';
cytoscape.use(popper);

/**
 * A controlled Cytoscape component, which is meant to be rendered once with a given set of elements and list of visible
 * nodes, and then re-rendered updating the positions and which elements are visible, before being re-rendered with new elements.
 */
export function CytoscapeControlled({
  elements,
  positions,
  onHover,
  onSelect,
}: {
  elements: cytoscape.ElementsDefinition | null;
  // Mapping of each visible node to its position, the IDs being a subset of the `elements` props
  positions: Positions | null;
  onSelect: (elements: Elements | null) => void;
  onHover: (target: null | {type: 'node' | 'edge'; id: string; referenceClientRect: DOMRect}) => void;
}) {
  const divRef = React.useRef<HTMLDivElement | null>(null);
  const cyRef = React.useRef<cytoscape.Core | null>(null);
  // The elements that have been removed, from a selection
  const removedRef = React.useRef<cytoscape.CollectionReturnValue | null>(null);

  // Set cytoscape ref in first effect and set up callbacks
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

  // Update the elements
  React.useEffect(() => {
    const cy = cyRef.current;
    cy.batch(() => {
      // Delete all old new elements, add new ones, and reset temporarily
      // removed elements reference
      cy.elements().remove();
      if (elements !== null) {
        cy.add(elements);
      }
    });
    removedRef.current = null;
  }, [cyRef.current, elements]);

  // Update the positions
  React.useEffect(() => {
    // Toggle off hovering when moving positions
    onHover(null);
    if (positions === null) {
      return;
    }

    const cy = cyRef.current;

    // Record nodes we will restore, so don't animate them
    const restoredNodeIDs = new Set(removedRef.current?.map((n) => n.id()));

    // Restore all previously removed nodes
    if (removedRef.current) {
      removedRef.current.restore();
    }
    // Remove all nodes that don't have positions
    removedRef.current = cy
      .collection(Object.keys(positions).map((id) => cy.$id(id)))
      .absoluteComplement()
      .nodes()
      .remove();

    // Update the layouts
    (cy.nodes() as any).layoutPositions(
      cy.makeLayout({name: 'preset'}),
      {
        eles: cy.elements(),
        fit: true,
        animate: true,
        animationDuration: 1500,
        animationEasing: 'ease-in-out-sine',
        // Only animate if the node was not just restored
        animateFilter: (node) => !restoredNodeIDs.has(node.id()),
      } as any,
      (node) => positions[node.id()]
    );
  }, [cyRef.current, positions, onHover]);

  return <div className="cytoscape" ref={divRef} />;
}
