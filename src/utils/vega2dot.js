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

function nodeLabel(node) {
  return node.signal
    ? node.signal
    : node.scale
    ? node.scale
    : node.root
    ? 'root'
    : node.type === 'collect' && node.data
    ? node.data
    : node.event
    ? node.event
    : node.type;
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
    : node.type === 'axisticks' || node.type === 'legendentries'
    ? '#ffffcc'
    : node.type === 'eventstream'
    ? '#ccffff'
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
  return stamp && nodes[n[0]].value.stamp < stamp
    ? '#dddddd'
    : edge.param !== 'pulse'
    ? edge.param.startsWith('$$')
      ? 'cyan'
      : '#aaaaaa'
    : '#000000';
}

function edgeLabelColor(edge, nodes, stamp) {
  const n = edge.nodes;
  return stamp && nodes[n[0]].value.stamp < stamp ? '#dddddd' : '#000000';
}

function escapeDotString(string) {
  return string
    ? string
        .replace(/\[/g, '\\[')
        .replace(/\]/g, '\\]')
        .replace(/\{/g, '\\{')
        .replace(/\}/g, '\\}')
        .replace(/\"/g, '\\"')
    : '';
}

/**
 *
 * @param {any} obj
 * @param {string} prefix
 * @returns {[{
 *  path: string,
 *  ref: number
 * }]}
 */
function findRefsInObject(obj, prefix = '') {
  let result = [];
  if (obj && typeof obj === 'object') {
    for (let key in obj) {
      if (key === 'subflow') continue;
      if (obj[key] && obj[key].$ref !== undefined) {
        result.push({path: prefix + key, ref: obj[key].$ref});
        continue;
      }
      result = result.concat(findRefsInObject(obj[key], prefix + key + '.'));
    }
  }
  return result;
}

const concatType = ['aggregate', 'joinaggregate', 'window'];

function getNodeOutputOrDefault(op) {
  if (!op.params) return undefined;
  // Extracted from https://vega.github.io/vega/docs/transforms/
  const defaultMap = {
    bin: 'bin0, bin1',
    countpattern: 'text, count',
    cross: 'a, b',
    density: 'value, density',
    dotbin: 'bin',
    fold: 'key, value',
    kde: 'value, density',
    quantile: 'prob, value',
    sequence: 'data',
    timeunit: 'unit0, unit1',
    geopath: 'as',
    geopoint: 'x, y',
    geoshape: 'shape',
    heatmap: 'image',
    isocontour: 'contour',
    kde2d: 'grid',
    force: 'x, y, vx, vy',
    label: 'x, y, opacity, align, baseline',
    linkpath: 'path',
    pie: 'startAngle, endAngle',
    stack: 'y0, y1',
    voronoi: 'path',
    wordcloud: 'x, y, font, fontSize, fontStyle, fontWeight, angle',
    pack: 'x, y, r, depth, children',
    partition: 'x0, y0, x1, y1, depth, children',
    tree: 'x, y, depth, children',
    treemap: 'x0, y0, x1, y1, depth, children',
  };
  if (op.type in defaultMap) {
    return op.params.as
      ? op.params.as instanceof Array
        ? op.params.as.join(', ')
        : typeof op.params.as === 'string'
        ? op.params.as
        : escapeDotString(JSON.stringify(op.params.as))
      : defaultMap[op.type];
  }
  if (concatType.includes(op.type)) {
    return op.params.as
      ? op.params.as
      : op.params.ops
      ? op.params.ops.map((op, i) => op + (op.params.fields[i] ? '_' + op.params.fields[i] : ''))
      : undefined;
  }
  return op.params.as ? escapeDotString(JSON.stringify(op.params.as)) : undefined;
}

function enrichNodeInformation(node, op) {
  if (op.type === 'mark') {
    node.tooltip = op.params.markdef.marktype + (op.params.markdef.name ? ` \\"${op.params.markdef.name}\\"` : '');
  }
  if (op.type === 'encode' && op.params.encoders) {
    node.tooltip = escapeDotString(
      Object.entries(op.params.encoders.$encode)
        .map(([k, v]) => {
          return `${k}: ${JSON.stringify(v.$fields)} → ${JSON.stringify(v.$output)}`;
        })
        .join('\\n')
    );
  }
  if (op.type === 'scale') {
    const params = op.params;
    const normalizeDR = (key) => {
      if (params[key] instanceof Array) {
        return `[${params[key].map((item, idx) => (item.$ref !== undefined ? `${key}.${idx}` : item)).join(', ')}]`;
      } else if (params[key] && params[key].$ref !== undefined) {
        return `${key}`;
      }
      return `unknown(${key})`;
    };
    node.tooltip =
      [
        params.type,
        params.reverse ? 'reverse' : '',
        params.round ? 'round' : '',
        params.clamp ? 'clamp' : '',
        params.nice ? 'nice' : '',
        params.zero ? 'zero' : '',
        params.domainImplicit ? 'domainImplicit' : '',
        params.sort ? 'sort' : '',
      ]
        .filter((x) => x)
        .join(', ') +
      '\\n' +
      normalizeDR('domain') +
      ' → ' +
      normalizeDR('range');
  }
  if (concatType.includes(op.type) && op.params) {
    node.tooltip =
      op.params.groupby instanceof Array
        ? op.params.groupby.map((gp) => gp.$field).join(', ') + (!op.params.fields ? ' → count' : '')
        : op.params.groupby.$field + (op.params.groupby.$name ? ' → ' + op.params.groupby.$name : '');
  }
  if (op.params && op.params.expr) {
    node.tooltip = (node.tooltip ? node.tooltip + '\\n' : '') + escapeDotString(op.params.expr.$expr.code);
  }
  const nodeOutput = getNodeOutputOrDefault(op);
  if (op.params && op.params.field && op.params.field.$field) {
    node.tooltip =
      (node.tooltip ? node.tooltip + '\\n' : '') + op.params.field.$field + (nodeOutput ? ' → ' + nodeOutput : '');
  } else if (op.params && op.params.fields) {
    node.tooltip =
      (node.tooltip ? node.tooltip + '\\n' : '') +
      op.params.fields
        .map((fd, i) => (fd === null ? 'null' : fd.$field + (nodeOutput instanceof Array ? ' → ' + nodeOutput[i] : '')))
        .join(', ') +
      (typeof nodeOutput === 'string' ? ' → ' + nodeOutput : '');
  } else if (nodeOutput) {
    node.tooltip =
      (node.tooltip ? node.tooltip + '\\n' : '') +
      ' → ' +
      (nodeOutput instanceof Array
        ? nodeOutput.join(', ')
        : typeof nodeOutput === 'string'
        ? nodeOutput
        : escapeDotString(JSON.stringify(nodeOutput)));
  }
}

/**
 *
 * @param {vega.Runtime} dataflow
 * @returns {[
 *  {
 *    id: number,
 *    type: string,
 *    value: any,
 *    tooltip: string,
 *    isMark: boolean,
 *    signal: string | undefined,
 *    scale: string | undefined,
 *    data: string | undefined,
 *    root: boolean
 *  }[],
 *  {
 *    source: number,
 *    target: number,
 *    param: string
 *  }[]
 * ]}
 */
function buildGraph(dataflow) {
  let nodes = [];
  let edges = [];

  dataflow.operators.forEach((op) => {
    const node = {
      id: op.id,
      type: op.type,
      value: op,
      tooltip: '',
    };
    if (markTypes[op.type]) node.isMark = true;
    if (op.signal) {
      node.signal = op.signal;
      node.tooltip = escapeDotString(JSON.stringify(op.value));
    }
    if (op.scale) node.scale = op.scale;
    if (op.type === 'collect' && op.data) {
      node.data = Object.keys(op.data)[0];
      if (op.value && op.value.$ingest instanceof Array) {
        node.tooltip = op.value.$ingest.length + ' data rows';
      }
    }
    if (op.root) {
      node.root = true;
    }
    enrichNodeInformation(node, op);
    nodes.push(node);
    if (op.type === 'prefacet') {
      const [n] = buildGraph(op.params.subflow.$subflow);
      nodes = nodes.concat(n);
    }
  });

  dataflow.streams.forEach((op) => {
    const node = {
      id: op.id,
      type: 'eventstream',
      value: op,
      tooltip: '',
    };
    if (op.type) node.event = op.source + ':' + op.type;
    if (op.filter) node.tooltip = op.filter.code;
    nodes.push(node);
  });

  nodes.forEach((node) => {
    const op = node.value;
    if (op.params) {
      const params = findRefsInObject(op.params);
      params.forEach((src) => {
        edges.push({
          source: src.ref,
          target: op.id,
          param: escapeDotString(src.path),
        });
        if (
          src.path === 'pulse' &&
          node.type === 'collect' &&
          nodes.find((node) => node.id === src.ref) &&
          nodes.find((node) => node.id === src.ref).type === 'datajoin'
        ) {
          node.isMark = true;
        }
      });
    }
    if (op.stream) {
      edges.push({source: op.stream, target: op.id, param: 'pulse'});
    }
  });

  dataflow.updates.forEach((update) => {
    if (update.update && update.update.$expr)
      edges.push({
        source: update.source.$ref === undefined ? update.source : update.source.$ref,
        target: update.target.$ref === undefined ? update.target : update.target.$ref,
        param: escapeDotString(update.update.$expr.code),
      });
    if (update.update && update.update.$params) {
      const params = findRefsInObject(update.update.$params);
      params.forEach((src) =>
        edges.push({
          source: src.ref,
          target: update.source.$ref === undefined ? update.source : update.source.$ref,
          param: escapeDotString(src.path),
        })
      );
    }
  });

  // assuming no more than 10k nodes in dataflow
  nodes = nodes.map((node) => {
    let id = node.id.toString().split(':');
    id = id.reduce((p, v) => p * 10000 + parseInt(v), 0);
    return {
      ...node,
      id,
    };
  });
  edges = edges
    .filter((edge) => edge.source !== edge.target)
    .map((edge) => {
      let source = edge.source.toString().split(':');
      let target = edge.target.toString().split(':');
      source = source.reduce((p, v) => p * 10000 + parseInt(v), 0);
      target = target.reduce((p, v) => p * 10000 + parseInt(v), 0);
      return {
        ...edge,
        source,
        target,
      };
    });
  return [nodes, edges];
}

function NEList2Dot([nodes, edges]) {
  return `digraph {
     rankdir = LR;
     node [style=filled];
     ${nodes
       .map((node) => {
         return (
           node.id +
           ' [label="' +
           nodeLabel(node) +
           (node.tooltip ? '\\n' + node.tooltip : '') +
           '"]' +
           ' [color="' +
           nodeColor(node) +
           '"]' +
           ' [fillcolor="' +
           nodeFillColor(node) +
           '"]' +
           ' [fontcolor="' +
           nodeFontColor(node) +
           '"]'
         );
       })
       .join(';\n  ')};
     ${edges
       .map((e) => {
         return (
           e.source +
           ' -> ' +
           e.target +
           ' [label="' +
           (e.param === 'pulse' ? '' : e.param.startsWith('$$') ? e.param.slice(2) : e.param) +
           '"]' +
           ' [color="' +
           edgeColor(e) +
           '"]' +
           ' [fontcolor="' +
           edgeLabelColor(e) +
           '"]' +
           ' [style="' +
           (e.param.startsWith('$$') ? 'dashed' : 'solid') +
           '"]'
         );
       })
       .join(';\n  ')};
   }`;
}

export function runtime2dot(runtime) {
  const dataflowGraph = buildGraph(runtime);
  return NEList2Dot(dataflowGraph);
}
