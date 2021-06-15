import {Runtime} from 'vega-typings';

type Node = {
  id: number | string;
  type: string;
  value: any;
  tooltip: string;
  isMark: boolean;
  signal: string | undefined;
  scale: string | undefined;
  data: string | undefined;
  root: boolean;
  event: string;
};

type Edge = {
  source: number;
  target: number;
  param: string;
};

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

function nodeLabel(node: Node) {
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

function nodeFillColor(node: Node, stamp?: number) {
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

function nodeColor(node: Node, stamp?: number) {
  return stamp && node.value.stamp < stamp ? '#dddddd' : '#000000';
}

function nodeFontColor(node: Node, stamp?: number) {
  return stamp && node.value.stamp < stamp ? '#cccccc' : '#000000';
}

function edgeColor(edge: Edge, nodes: Node[], stamp?: number) {
  return stamp && nodes[edge.source].value.stamp < stamp
    ? '#dddddd'
    : edge.param !== 'pulse'
    ? edge.param.startsWith('$$')
      ? 'cyan'
      : '#aaaaaa'
    : '#000000';
}

function edgeLabelColor(edge: Edge, nodes: Node[], stamp?: number) {
  return stamp && nodes[edge.source].value.stamp < stamp ? '#dddddd' : '#000000';
}

function escapeDotString(string: string): string {
  return string
    ? string
        .replace(/\[/g, '\\[')
        .replace(/\]/g, '\\]')
        .replace(/\{/g, '\\{')
        .replace(/\}/g, '\\}')
        .replace(/"/g, '\\"')
    : '';
}

function findRefsInObject(obj: any, prefix = ''): {path: string; ref: number}[] {
  let result = [];
  if (obj && typeof obj === 'object') {
    for (const key in obj) {
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
      ? op.params.ops.map((o: any, i: number) => o + (op.params.fields[i] ? '_' + op.params.fields[i] : ''))
      : undefined;
  }
  return op.params.as ? escapeDotString(JSON.stringify(op.params.as)) : undefined;
}

function enrichNodeInformation(node: Partial<Node>, op) {
  if (op.type === 'mark') {
    node.tooltip = op.params.markdef.marktype + (op.params.markdef.name ? ` \\"${op.params.markdef.name}\\"` : '');
  }
  if (op.type === 'encode' && op.params.encoders) {
    node.tooltip = escapeDotString(
      Object.entries(op.params.encoders.$encode)
        .map(([k, v]: [string, any]) => {
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

function buildGraph(dataflow: Runtime): [Node[], Edge[]] {
  let nodes = [];
  let edges = [];

  dataflow.operators.forEach((op) => {
    const node: Partial<Node> & Pick<Node, 'id' | 'type' | 'value'> = {
      id: op.id,
      type: op.type,
      value: op,
      tooltip: '',
    };
    if (markTypes[op.type]) node.isMark = true;
    if ('signal' in op) {
      node.signal = op.signal;
      node.tooltip = escapeDotString(JSON.stringify(op.value));
    }
    if ('scale' in op) node.scale = op.scale;
    if (op.type === 'collect' && op.data) {
      node.data = Object.keys(op.data)[0];
      if (op.value && op.value.$ingest instanceof Array) {
        node.tooltip = op.value.$ingest.length + ' data rows';
      }
    }
    if ('root' in op) {
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
    const node: Partial<Node> = {
      id: op.id,
      type: 'eventstream',
      value: op,
      tooltip: '',
    };
    node.event =
      'type' in op ? `${op.source}:${op.type}` : 'merge' in op ? 'merge' : 'stream' in op ? 'stream' : (null as never);

    node.tooltip = Object.entries({
      filter: op.filter?.code,
      throttle: op.throttle,
      debounce: op.debounce,
      consume: op.consume,
    })
      .filter(([k, v]) => v)
      .map(([k, v]) => `${k}: ${v}`)
      .join('\n');

    if ('stream' in op) {
      edges.push({source: op.stream, target: op.id, param: 'stream'});
    }
    if ('between' in op) {
      const [before, after] = op.between;

      edges.push({source: before, target: op.id, param: 'between[0]'});
      edges.push({source: after, target: op.id, param: 'between[1]'});
    }
    if ('merge' in op) {
      op.merge.forEach((source) => {
        edges.push({source: source, target: op.id, param: 'merge'});
      });
    }
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
          nodes.find((n) => n.id === src.ref) &&
          nodes.find((n) => n.id === src.ref).type === 'datajoin'
        ) {
          node.isMark = true;
        }
      });
    }
  });

  dataflow.updates.forEach(({target, source, update}) => {
    if (typeof update === 'object' && '$expr' in update) {
      const sourceID = typeof source === 'object' ? source.$ref : source;
      edges.push({
        source: sourceID,
        // If the target is an expression, don't save an ID for it
        target: typeof target === 'object' ? undefined : target,
        param: escapeDotString(update.$expr.code),
      });
      const params = findRefsInObject(update.$params);
      params.forEach((src) =>
        edges.push({
          source: src.ref,
          target: sourceID,
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

function NEList2Dot([nodes, edges]: [Node[], Edge[]]): string {
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
             edgeColor(e, nodes) +
             '"]' +
             ' [fontcolor="' +
             edgeLabelColor(e, nodes) +
             '"]' +
             ' [style="' +
             (e.param.startsWith('$$') ? 'dashed' : 'solid') +
             '"]'
           );
         })
         .join(';\n  ')};
     }`;
}

export function runtime2dot(runtime: Runtime): string {
  const dataflowGraph = buildGraph(runtime);
  return NEList2Dot(dataflowGraph);
}
