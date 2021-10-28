/**
 * Converts a Vega dataflow runtime expression to an abstract graph representation.
 */

import {Runtime} from 'vega-typings';
import {
  Binding,
  BuiltinParameter,
  ObjectOrAny,
  Operator,
  Parameter,
  Stream,
  Subflow,
  Update,
  ID,
  BaseOperator,
} from 'vega-typings/types/runtime/runtime';

import {prettifyExpression} from './prettify';
import {Graph, Node} from './graph';
import {measureText} from './measureText';

export function runtimeToGraph(runtime: Runtime): Graph {
  const graph = {nodes: {}, edges: {}} as Graph;
  addRuntime(graph, runtime);
  return graph;
}
function addRuntime(graph: Graph, runtime: Runtime): void {
  runtime.bindings.forEach((b) => addBinding(graph, b));
  addFlow(graph, runtime, undefined);
}

function addFlow(graph: Graph, {streams, operators, updates}: Subflow, parent: ID | undefined): void {
  streams.forEach((s) => addStream(graph, s, parent));
  operators.forEach((o) => addOperator(graph, o, parent));
  updates.forEach((u, i) => addUpdate(graph, u, i, parent));
}
function addOperator(graph: Graph, {id, type, params, ...rest}: Operator, parent: ID | undefined): void {
  addNode(graph, {
    type: 'operator',
    id,
    parent,
    colorKey: `operator:${type}`,
    label: type,
  });
  addParam(graph, id, 'ID', id.toString(), false);
  addOperatorParameters(graph, id, params);

  // Don't show metadata
  delete rest['metadata'];
  // Refs is always null
  delete rest['refs'];

  if ('update' in rest) {
    addParam(graph, id, 'update', rest.update.code);
    delete rest['update'];
  }
  if (rest.parent !== undefined) {
    const parentID = rest.parent.$ref;
    addEdge(graph, {source: parentID, target: id});
    delete rest['parent'];
  }
  // Handle data separately to show in graph as nodes
  if (rest.data !== undefined) {
    addData(graph, id, rest.data, parent);
    delete rest['data'];
  }

  if (rest.signal !== undefined) {
    addSignal(graph, id, rest.signal, parent);
    delete rest['signal'];
  }

  for (const [k, v] of Object.entries(rest)) {
    if (v === undefined) {
      continue;
    }
    addParam(graph, id, k, JSON.stringify(v));
  }
}

function addSignal(graph: Graph, id: ID, signal: string, parent: ID | undefined): void {
  // If we have a signal, add a node for that signal if we havent already,
  // and add an edge.
  // If we have already added a binding for that signal, we use that node instead
  // of making a new one
  const signalID = parent !== undefined ? `${parent}.${signal}` : signal;
  if (!hasNode(graph, signalID)) {
    addNode(graph, {
      type: 'signal',
      id: signalID,
      parent,
      label: signal,
    });
  }
  associateNode(graph, signalID, id);
  addEdge(graph, {source: signalID, target: id, label: 'signal'});
}

function addData(graph: Graph, id: ID, data: BaseOperator['data'], parent: ID | undefined): void {
  for (const [name, dataset] of Object.entries(data)) {
    const datasetNodeID = `data.${parent ?? 'root'}.${name}`;
    if (!hasNode(graph, datasetNodeID)) {
      addNode(graph, {
        type: 'data',
        id: datasetNodeID,
        parent,
        label: name,
      });
    }
    associateNode(graph, datasetNodeID, id);

    for (const stage of new Set(dataset)) {
      const datasetStageNodeID = `${datasetNodeID}.${stage}`;
      addNode(graph, {
        type: 'data',
        id: datasetStageNodeID,
        parent: datasetNodeID,
        label: stage,
      });
      associateNode(graph, datasetStageNodeID, id);
      addEdge(graph, {source: datasetStageNodeID, target: id});
    }
  }
}

function addOperatorParameters(graph: Graph, id: ID, params: Operator['params']): void {
  for (const [k, v] of Object.entries(params ?? {})) {
    if (v === undefined) {
      continue;
    }
    // We have to check to see if the parameter values is a either a regular JSON value,
    // or a special case parameter, or a list of values/special case parameters.
    if (Array.isArray(v)) {
      const added = new Set<number>();
      for (const [i, vI] of v.entries()) {
        if (addOperatorParameter(graph, id, `${k}[${i}]`, vI)) {
          added.add(i);
        }
      }
      // If we didn't add any operators, then add them all as one array
      if (added.size === 0) {
        addParam(graph, id, k, JSON.stringify(v));
        continue;
      }
      // otherwise, add all that aren't added
      for (const [i, vI] of v.entries()) {
        if (!added.has(i)) {
          addParam(graph, id, `${k}[${i}]`, JSON.stringify(vI));
        }
      }
      continue;
    }
    // Tries adding the operator parameter as a special case, if that fails,
    // then add as a regular parameter by stringifying
    if (!addOperatorParameter(graph, id, k, v)) {
      addParam(graph, id, k, JSON.stringify(v));
    }
  }
}
/**
 * Adds a parameter, returning whether it was added or not.
 */
function addOperatorParameter(graph: Graph, id: ID, k: string, v: Parameter | ObjectOrAny<BuiltinParameter>): boolean {
  // Hide null parent params
  if (k === 'parent' && v === null) {
    return true;
  }
  if (typeof v !== 'object') {
    return false;
  }
  if (v === null) {
    return false;
  }
  if ('$ref' in v) {
    const vID = v.$ref;
    const primary = k === 'pulse';
    const label = primary ? undefined : k;
    addEdge(graph, {source: vID, target: id, label, primary});
    return true;
  }
  if ('$subflow' in v) {
    addFlow(graph, v.$subflow, id);
    // Add edge to first node, which is root node and is used to detach the subflow
    // TODO: Disable for now, until we understand its purpose
    // const rootID = v.$subflow.operators[0].id;
    // addEdge(graph, {source: id, target: rootID, label: 'root'});
    return true;
  }
  if ('$expr' in v) {
    addParam(graph, id, k, v.$expr.code);
    for (const [label, {$ref}] of Object.entries(v.$params)) {
      addEdge(graph, {source: $ref, target: id, label: `${k}.${label}`});
    }
    return true;
  }
  if ('$encode' in v) {
    for (const [stage, {$expr}] of Object.entries(v.$encode)) {
      // Assumes that the marktype is the same in all stages
      addParam(graph, id, 'encode marktype', $expr.marktype);
      // Add each stage as a param, mapping each channel to its value
      addParam(
        graph,
        id,
        `encode.${stage}`,
        '{' +
          Object.entries($expr.channels)
            .map(([channel, {code}]) => `${channel}: ${prettifyExpression(code)},`)
            .join('\n') +
          '}'
      );
    }
    return true;
  }
  return false;
}
function addUpdate(graph: Graph, {source, target, update, options}: Update, index: number, parent: ID): void {
  // ID updates by index
  const id = `update-${parent || 'root'}.${index}`;
  addNode(graph, {type: 'update', id: id, parent, label: 'update'});
  if (options?.force) {
    addParam(graph, id, 'force', 'true');
  }
  if (update && typeof update === 'object' && '$expr' in update) {
    addParam(graph, id, 'value', update.$expr.code);
    for (const [k, v] of Object.entries(update.$params ?? {})) {
      const paramID = v.$ref;
      associateNode(graph, id, paramID);
      addEdge(graph, {source: paramID, target: id, label: k});
    }
  } else {
    addParam(graph, id, 'value', JSON.stringify(update));
  }
  const sourceID = typeof source === 'object' ? source.$ref : source;
  associateNode(graph, id, sourceID);
  associateNode(graph, id, target);
  addEdge(graph, {source: sourceID, target: id});
  addEdge(graph, {source: id, target});
}
function addBinding(graph: Graph, {signal, ...rest}: Binding) {
  addNode(graph, {
    type: 'binding',
    id: signal,
    label: signal,
  });
  for (const [k, v] of Object.entries(rest)) {
    if (v === undefined) {
      continue;
    }
    addParam(graph, signal, k, JSON.stringify(v));
  }
}
function addStream(graph: Graph, stream: Stream, parent: ID) {
  const {id} = stream;
  const label = 'stream' in stream ? 'stream' : 'merge' in stream ? 'merge' : `${stream.source}:${stream.type}`;
  addNode(graph, {
    type: 'stream',
    id,
    label,
    parent,
  });
  addParam(graph, id, 'type', 'stream');
  if ('stream' in stream) {
    addEdge(graph, {source: stream.stream, target: id});
  } else if ('merge' in stream) {
    stream.merge.forEach((from) => {
      addEdge(graph, {source: from, target: id});
    });
  }
  if ('between' in stream) {
    const [before, after] = stream.between;
    addEdge(graph, {source: before, target: id, label: 'before'});
    addEdge(graph, {source: id, target: after, label: 'after'});
  }
  if (stream.consume) {
    addParam(graph, id, 'consume', 'true');
  }
  if (stream.debounce) {
    addParam(graph, id, 'debounce', stream.debounce.toString());
  }
  if (stream.throttle) {
    addParam(graph, id, 'throttle', stream.throttle.toString());
  }
  if (stream.filter) {
    addParam(graph, id, 'filter', stream.filter.code);
  }
}
// Helper function to assist in adding to the graph, taking care of denormalization, converting node IDs
// to string, and adding edge IDs.

function addNode(
  graph: Graph,
  {
    id: runtimeID,
    parent: parentRuntimeID,
    colorKey,
    ...rest
  }: {id: ID; parent?: ID} & Required<Pick<Node, 'type' | 'label'>> & Pick<Node, 'colorKey'>
): void {
  const id = runtimeID.toString();

  const node = getNode(graph, id);
  Object.assign(node, rest);
  node.colorKey = colorKey ?? rest.type;
  node.size = measureText(node.label);
  node.associated.push(id);
  node.partition =
    rest.type === 'binding' || rest.type === 'signal' ? 0 : rest.type === 'stream' || rest.type === 'data' ? 1 : 2;

  if (parentRuntimeID) {
    const parentID = parentRuntimeID.toString();
    node.parent = parentID;
    getNode(graph, parentID).children.push(id);
  }
}
// TODO Namespace signal by parent?
function addEdge(
  graph: Graph,
  {
    source: runtimeSource,
    target: runtimeTarget,
    primary,
    label,
  }: {source: ID; target: ID; label?: string; primary?: boolean}
): void {
  const source = runtimeSource.toString();
  const target = runtimeTarget.toString();
  // Increment edge ids to make each unique
  graph.edges[`edge:${Object.keys(graph.edges).length}`] = {
    source,
    target,
    label,
    primary: primary ?? false,
    size: measureText(label ?? ''),
  };
  getNode(graph, source).outgoing.push(target);
  getNode(graph, target).incoming.push(source);
}

function addParam(graph: Graph, id: ID, key: string, value: string, prettify = true): void {
  getNode(graph, id.toString()).params[key] = prettify ? prettifyExpression(value, key.length) : value;
}

function hasNode(graph: Graph, id: ID): boolean {
  return graph.nodes[id] !== undefined;
}

function associateNode(graph: Graph, nodeID: ID, relatedID: ID): void {
  getNode(graph, nodeID.toString()).associated.push(relatedID.toString());
}
function getNode({nodes}: Graph, id: string): Node {
  let node = nodes[id];
  if (!node) {
    node = {
      children: [],
      incoming: [],
      outgoing: [],
      associated: [],
      params: {},
      size: null,
    };
    nodes[id] = node;
  }
  return node;
}
