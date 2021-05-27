// Copy of https://observablehq.com/@vega/vega2dot

/**
 * Generates a dot-formatted file for Graphviz to visualize the dataflow
 * graph for a Vega View instance.
 * Note: does not (yet) support nested scopes / subflows.
 * @param {View} view A Vega View instance.
 * @param {number} [stamp] Optional pulse timestamp. If provided, dataflow
 *   nodes and edges that have not been evaluated since the timestamp will
 *   be deemphasized.
 * @returns {string} The generated dot file.
 */
export function view2dot(view, stamp) {
  const rt = view._runtime,
    ops = rt.nodes,
    keys = Object.keys(ops);

  const signals = Object.keys(rt.signals).reduce((lut, name) => {
    lut[rt.signals[name].id] = name;
    return lut;
  }, {});

  const scales = Object.keys(rt.scales).reduce((lut, name) => {
    lut[rt.scales[name].id] = name;
    return lut;
  }, {});

  const data = Object.keys(rt.data).reduce((lut, name) => {
    const sets = rt.data[name];
    if (sets.input) lut[sets.input.id] = name;
    if (sets.output) lut[sets.output.id] = name;
    return lut;
  }, {});

  // build node objects
  const nodes = keys.map((key) => {
    const op = ops[key];
    const node: any = {
      id: op.id,
      type: op.constructor.name.toLowerCase(),
      stamp: op.stamp,
      value: op,
    };
    if (markTypes[getType(node.type)]) node.isMark = true;
    if (signals[op.id]) node.signal = signals[op.id];
    if (scales[op.id]) node.scale = scales[op.id];
    if (data[op.id]) node.data = data[op.id];
    if (rt.root === op) node.root = true;
    return node;
  });

  const ids = nodes.reduce((lut, node) => {
    lut[node.id] = node;
    return lut;
  }, {});

  // build edge objects
  const edges = [];
  keys.forEach((key) => {
    const op = ops[key];
    if (op._targets)
      op._targets.forEach((t) => {
        if (!ids[t.id]) return;
        edges.push({
          nodes: [op.id, t.id],
          param: t.source === op ? 'pulse' : argop(t, op),
        });
        if (t.source === op && ids[op.id].isMark) {
          const node = ids[t.id];
          if (getType(node.type) === 'collect') {
            // annotate post-datajoin collect operators as mark-processing
            node.isMark = true;
          }
        }
      });
  });

  return `digraph {
    rankdir = LR;
    node [style=filled];
    ${nodes
      .map((node) => {
        return (
          node.id +
          ' [label="' +
          nodeLabel(node) +
          '"]' +
          ' [color="' +
          nodeColor(node, stamp) +
          '"]' +
          ' [fillcolor="' +
          nodeFillColor(node, stamp) +
          '"]' +
          ' [fontcolor="' +
          nodeFontColor(node, stamp) +
          '"]'
        );
      })
      .join(';\n  ')};
    ${edges
      .map((e) => {
        return (
          e.nodes.join(' -> ') +
          ' [label="' +
          (e.param === 'pulse' ? '' : e.param) +
          '"]' +
          ' [color="' +
          edgeColor(e, ids, stamp) +
          '"]' +
          ' [fontcolor="' +
          edgeLabelColor(e, ids, stamp) +
          '"]' +
          ' [weight="' +
          edgeWeight(e, ids) +
          '"]'
        );
      })
      .join(';\n  ')};
  }`;
}

function nodeLabel(node) {
  return node.signal
    ? node.signal
    : node.scale
    ? node.scale
    : node.root
    ? 'root'
    : getType(node.type) === 'collect' && node.data
    ? node.data
    : getType(node.type);
}

function nodeFillColor(node, stamp) {
  return stamp && node.value.stamp < stamp
    ? '#ffffff'
    : node.signal
    ? '#dddddd'
    : node.scale
    ? '#ccffcc'
    : node.data
    ? '#ffcccc'
    : getType(node.type) === 'axisticks' || getType(node.type) === 'legendentries'
    ? '#ffcccc'
    : node.isMark || node.root
    ? '#ccccff'
    : '#ffffff';
}

function nodeColor(node, stamp) {
  return stamp && node.value.stamp < stamp ? '#dddddd' : '#000000';
}

function nodeFontColor(node, stamp) {
  return stamp && node.value.stamp < stamp ? '#cccccc' : '#000000';
}

function edgeColor(edge, nodes, stamp) {
  const n = edge.nodes;
  return stamp && nodes[n[0]].value.stamp < stamp ? '#dddddd' : edge.param !== 'pulse' ? '#aaaaaa' : '#000000';
}

function edgeLabelColor(edge, nodes, stamp) {
  const n = edge.nodes;
  return stamp && nodes[n[0]].value.stamp < stamp ? '#dddddd' : '#000000';
}
function edgeWeight(edge, nodes) {
  const n = edge.nodes;
  return edge.param !== 'pulse' ? 1 : nodes[n[0]].isMark && nodes[n[1]].isMark ? 100 : 2;
}

function argop(t, s) {
  if (t._argops)
    for (const v of t._argops) {
      if (v.op === s) return v.name;
    }
  return '';
}

function getType(type) {
  const cut = type ? type.indexOf('$') : -1;
  return cut < 0 ? type : type.slice(0, cut);
}

const markTypes = {
  datajoin: 1,
  encode: 1,
  mark: 1,
  bound: 1,
  overlap: 1,
  sortitems: 1,
  render: 1,
  viewlayout: 1,
};
