import cytoscape from 'cytoscape';

import elk from 'cytoscape-elk';

cytoscape.use(elk);

// https://github.com/cytoscape/cytoscape.js-elk
export default {
  name: 'elk',
  nodeDimensionsIncludeLabels: true,
  fit: true,
  elk: {
    algorithm: 'layered',
    'org.eclipse.elk.direction': 'RIGHT',

    'org.eclipse.elk.layered.compaction.postCompaction.strategy': 'EDGE_LENGTH',

    // Require to layout childrenhttps://github.com/kieler/elkjs/issues/44#issuecomment-412283358
    'org.eclipse.elk.hierarchyHandling': 'INCLUDE_CHILDREN',

    'org.eclipse.elk.layered.nodePlacement.strategy': 'NETWORK_SIMPLEX',
    // Add partitioning to move signal and bindings to top
    'org.eclipse.elk.partitioning.activate': true,
  },
};
