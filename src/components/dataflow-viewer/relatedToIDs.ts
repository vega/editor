import cytoscape from 'cytoscape';

/**
 * Returns all nodes that are related to the IDs passed in
 */
export default function relatedToIDs(cy: cytoscape.Core, ids: string[]): cytoscape.NodeCollection {
  return cy.nodes().filter((node) => {
    const relatedIDs: string[] = node.data('relatedIDs');
    for (const relatedID of relatedIDs) {
      if (ids.includes(relatedID)) {
        return true;
      }
    }
    return false;
  });
}
