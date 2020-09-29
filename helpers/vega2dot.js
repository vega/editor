import { EventStream, Operator, Dataflow } from "vega-dataflow";

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
    ? "root"
    : node.type === "collect" && node.data
    ? node.data
    : node.event
    ? node.event
    : node.type;
}

function nodeFillColor(node, stamp) {
  return stamp && node.value.stamp < stamp
    ? "#ffffff"
    : node.signal
    ? "#dddddd"
    : node.scale
    ? "#ccffcc"
    : node.data
    ? "#ffcccc"
    : node.type === "axisticks" || node.type === "legendentries"
    ? "#ffffcc"
    : node.type === "eventstream"
    ? "#ccffff"
    : node.isMark || node.root
    ? "#ccccff"
    : "#ffffff";
}

function nodeColor(node, stamp) {
  return stamp && node.value.stamp < stamp ? "#dddddd" : "#000000";
}

function nodeFontColor(node, stamp) {
  return stamp && node.value.stamp < stamp ? "#cccccc" : "#000000";
}

function edgeColor(edge, nodes, stamp) {
  const n = edge.nodes;
  return stamp && nodes[n[0]].value.stamp < stamp
    ? "#dddddd"
    : edge.param !== "pulse"
    ? "#aaaaaa"
    : "#000000";
}

function edgeLabelColor(edge, nodes, stamp) {
  const n = edge.nodes;
  return stamp && nodes[n[0]].value.stamp < stamp ? "#dddddd" : "#000000";
}

function edgeWeight(edge, nodes) {
  const n = edge.nodes;
  return edge.param !== "pulse"
    ? 1
    : nodes[n[0]].isMark && nodes[n[1]].isMark
    ? 100
    : 2;
}

function argop(t, s) {
  if (t._argops)
    for (const v of t._argops) {
      if (v.op === s) return v.name;
    }
  return "";
}
function subView2dot(rt) {
  const ops = rt.nodes,
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
    let opid = op.id;
    let type = op.constructor.name.toLowerCase();
    let tooltip = "";
    if (type === "object") {
      if (op.stamp === undefined) {
        opid = "e" + opid;
        type = "eventstream";
      } else if (rt.root !== op) {
        type = "operator";
        tooltip = JSON.stringify(op.value)
          .replace(/\[/g, "\\[")
          .replace(/\]/g, "\\]")
          .replace(/\{/g, "\\{")
          .replace(/\}/g, "\\}")
          .replace(/\"/g, '\\"');
        console.log(tooltip);
      }
    }
    const node = {
      id: opid,
      type,
      stamp: op.stamp,
      value: op,
      tooltip,
    };
    if (markTypes[node.type]) node.isMark = true;
    if (signals[opid]) node.signal = signals[opid];
    if (scales[opid]) node.scale = scales[opid];
    if (data[opid]) node.data = data[opid];
    if (rt.root === op) node.root = true;
    return node;
  });

  const ids = nodes.reduce((lut, node) => {
    lut[node.id] = node;
    return lut;
  }, {});

  return [rt, ops, keys, signals, scales, data, nodes, ids];
}

export async function view2dot(view, stamp) {
  console.log(view);
  const rt = view._runtime;
  let ops = rt.nodes,
    keys = Object.keys(ops);

  let signals = Object.keys(rt.signals).reduce((lut, name) => {
    lut[rt.signals[name].id] = name;
    return lut;
  }, {});

  let scales = Object.keys(rt.scales).reduce((lut, name) => {
    lut[rt.scales[name].id] = name;
    return lut;
  }, {});

  let data = Object.keys(rt.data).reduce((lut, name) => {
    const sets = rt.data[name];
    if (sets.input) lut[sets.input.id] = name;
    if (sets.output) lut[sets.output.id] = name;
    return lut;
  }, {});

  // build node objects
  let nodes = keys.map((key) => {
    const op = ops[key];
    let opid = op.id;
    let type = op.constructor.name.toLowerCase();
    let tooltip = "";
    if (type === "object") {
      if (op.stamp === undefined) {
        opid = "e" + opid;
        type = "eventstream";
      } else if (rt.root !== op) {
        type = "operator";
        tooltip = JSON.stringify(op.value)
          .replace(/\[/g, "\\[")
          .replace(/\]/g, "\\]")
          .replace(/\{/g, "\\{")
          .replace(/\}/g, "\\}")
          .replace(/\"/g, '\\"');
        console.log(tooltip);
      }
    }
    const node = {
      id: opid,
      type,
      stamp: op.stamp,
      value: op,
      tooltip,
    };
    if (markTypes[node.type]) node.isMark = true;
    if (signals[opid]) node.signal = signals[opid];
    if (scales[opid]) node.scale = scales[opid];
    if (data[opid]) node.data = data[opid];
    if (rt.root === op) node.root = true;
    return node;
  });

  let ids = nodes.reduce((lut, node) => {
    lut[node.id] = node;
    return lut;
  }, {});

  if (rt.subcontext) {
    rt.subcontext.forEach((subview) => {
      const result = subView2dot(subview, keys.length);
      ops = { ...ops, ...result[1] };
      keys = keys.concat(result[2]);
      signals = { ...signals, ...result[3] };
      scales = { ...scales, ...result[4] };
      data = { ...data, ...result[5] };
      nodes = nodes.concat(result[6]);
      ids = { ...ids, ...result[7] };
    });
  }

  // build edge objects
  const edges = [];
  keys.forEach((key) => {
    const op = ops[key];
    if (op._targets)
      op._targets.forEach((t) => {
        if (op.stamp === undefined) {
          return;
        } else {
          if (!ids[t.id]) return;
          edges.push({
            nodes: [op.id, t.id],
            param: t.source === op ? "pulse" : argop(t, op),
          });
          if (t.source === op && ids[op.id].isMark) {
            const node = ids[t.id];
            if (node.type === "collect") {
              // annotate post-datajoin collect operators as mark-processing
              node.isMark = true;
            }
          }
        }
      });
  });

  // dig out all event streams using hijack method
  const _receive = EventStream.prototype.receive;
  const _evaluate = Operator.prototype.evaluate;
  const _pulse = Dataflow.prototype.pulse;
  const _update = Dataflow.prototype.update;

  const eventStreamList = [];
  for (let eventType of Object.keys(view._handler._handlers)) {
    for (let handler of view._handler._handlers[eventType]) {
      if (handler.handler && handler.handler instanceof Function) {
        const eventStream = await new Promise((res) => {
          EventStream.prototype.receive = function () {
            res(this);
          };
          const fakeEvent = { preventDefault: () => {} };
          handler.handler(fakeEvent);
          setTimeout(() => res(null), 1000); // hope this will not be invoked
        });
        if (eventStream) eventStreamList.push({ eventStream, eventType });
      }
    }
  }

  const extendTopoNodes = (eventStream) => {
    if (eventStream._targets && eventStream._targets instanceof Array) {
      eventStream._targets.forEach((op) => {
        if (!ids["e" + op.id]) {
          const node = {
            id: "e" + op.id,
            type: "eventstream",
            stamp: undefined,
            value: op,
            tooltip: "",
          };
          nodes.push(node);
          ids["e" + op.id] = node;
        }
        edges.push({
          nodes: ["e" + eventStream.id, "e" + op.id],
          param: "pulse",
        });
        extendTopoNodes(op);
      });
    }
  };

  const getNodeListWithFilter = (scenegraph, filter) => {
    const nodeList = [];
    if (scenegraph.interactive !== false) {
      try {
        if (filter({ item: scenegraph })) {
          nodeList.push(scenegraph);
        }
      } catch (e) {}
      if (scenegraph.items && scenegraph.items instanceof Array) {
        scenegraph.items.forEach((child) => {
          const subNodeList = getNodeListWithFilter(child, filter);
          for (let node of subNodeList) {
            if (!nodeList.includes(node)) {
              nodeList.push(node);
            }
          }
        });
      }
    }
    return nodeList;
  };

  const getNodeListWithListAndFilter = (list, filter) => {
    const nodeList = [];
    for (let scenegraph of list) {
      try {
        if (filter({ item: scenegraph })) {
          nodeList.push(scenegraph);
        }
      } catch (e) {}
    }
    return nodeList;
  };

  const extendStream2Node = async (stream, list = null) => {
    if (!list)
      list = getNodeListWithFilter(view._scenegraph.root, stream._filter);
    else list = getNodeListWithListAndFilter(list, stream._filter);
    if (stream.hasOwnProperty("_apply") && list.length) {
      const receiveList = [];
      for (let node of list) {
        try {
          let { op, param } = await new Promise((res) => {
            Operator.prototype.evaluate = function () {
              const op = this;
              let param = null;
              if (op._update) {
                const nestedGet = (target, path) => {
                  if (path === "$$realpath$$") return target.base;
                  return new Proxy(
                    { base: target.base + "[" + path + "]" },
                    {
                      get: nestedGet,
                    }
                  );
                };
                const fakeDatum = new Proxy(
                  { base: "datum" },
                  {
                    get: nestedGet,
                  }
                );
                param = op._update(op._argval, {
                  item: { datum: fakeDatum },
                  vega: {
                    view: () => ({
                      changeset: () => ({
                        encode: (_, name) => ({
                          $$realpath$$: JSON.stringify(name)
                            .replace(/\[/g, "\\[")
                            .replace(/\]/g, "\\]")
                            .replace(/\{/g, "\\{")
                            .replace(/\}/g, "\\}")
                            .replace(/\"/g, '\\"'),
                        }),
                      }),
                    }),
                  },
                }).$$realpath$$;
              }
              res({ op, param });
            };
            Dataflow.prototype.pulse = () => {};
            Dataflow.prototype.update = () => {};
            stream._apply({ item: list[0] });
            setTimeout(() => res({ op: null, param: null }), 1000);
          });
          if (op && param && !receiveList.includes(op)) {
            edges.push({
              nodes: ["e" + stream.id, op.id],
              param: "event",
            });
            edges.push({
              nodes: [op.id, "e" + stream.id],
              param,
            });
            receiveList.push(op);
            if (!ids[op.id]) {
              const node = {
                id: op.id,
                type: "operator",
                stamp: op.stamp,
                value: op,
                tooltip: "",
              };
              nodes.push(node);
              ids[op.id] = node;
            }
          }
          ({ op, param } = await new Promise((res) => {
            Operator.prototype.evaluate = () => {};
            Dataflow.prototype.pulse = function (op, changeset, options) {
              console.log("pulse", op, changeset, options);
              res({ op, param: "pulse" });
            };
            Dataflow.prototype.update = function (op, changeset, options) {
              console.log("update", op, changeset, options);
              res({ op, param: "update" });
            };
            stream._apply({ item: node });
            setTimeout(() => res({ op: null, param: null }), 1000);
          }));
          if (op && param && !receiveList.includes(op)) {
            edges.push({
              nodes: ["e" + stream.id, op.id],
              param,
            });
            receiveList.push(op);
            if (!ids[op.id]) {
              const node = {
                id: op.id,
                type: "operator",
                stamp: op.stamp,
                value: op,
                tooltip: "",
              };
              nodes.push(node);
              ids[op.id] = node;
            }
          }
        } catch (e) {}
      }
    }
    if (stream._targets && stream._targets instanceof Array) {
      for (let child of stream._targets) {
        await extendStream2Node(child, list);
      }
    }
  };

  for (let { eventStream, eventType } of eventStreamList) {
    if (!ids["e" + eventStream.id]) {
      const node = {
        id: "e" + eventStream.id,
        type: "eventstream",
        stamp: undefined,
        value: eventStream,
        tooltip: "",
      };
      nodes.push(node);
      ids["e" + eventStream.id] = node;
    }
    ids["e" + eventStream.id].event = eventType;
    extendTopoNodes(eventStream);
    await extendStream2Node(eventStream);
  }

  EventStream.prototype.receive = _receive;
  Operator.prototype.evaluate = _evaluate;
  Dataflow.prototype.pulse = _pulse;
  Dataflow.prototype.update = _update;

  console.log(nodes, edges);

  return `digraph {
  rankdir = LR;
  node [style=filled];
  ${nodes
    .map((node) => {
      return (
        node.id +
        ' [label="' +
        nodeLabel(node) +
        (node.tooltip ? ": " + node.tooltip : "") +
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
    .join(";\n  ")};
  ${edges
    .map((e) => {
      return (
        e.nodes.join(" -> ") +
        ' [label="' +
        (e.param === "pulse" ? "" : e.param) +
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
    .join(";\n  ")};
}`;
}

function visitScene(visitor, node, parent, index) {
  visitor(parent, node, index);
  const items = node.items;
  const n = (items && items.length) || 0;
  for (let i = 0; i < n; ++i) {
    visitScene(visitor, items[i], node, i);
  }
}

export function scene2dot(view) {
  const nodes = [];
  const edges = [];
  const lut = new Map();

  function visitor(parent, node, index) {
    const n = {
      id: nodes.length + 1,
      type: node.marktype,
      role: node.role,
      index: index,
    };
    nodes.push(n);
    lut.set(node, n);

    if (parent) {
      edges.push(lut.get(parent).id + " -- " + n.id);
    }
  }

  visitScene(visitor, view.scenegraph().root);

  return `graph {
  rankdir = TB;
  ${nodes
    .map(
      (n) =>
        n.id +
        ' [label="' +
        (n.type ? n.type + ":" + n.role : n.index) +
        '"]' +
        ' [shape="' +
        (n.type ? "rect" : "circle") +
        '"]'
    )
    .join(";\n  ")};
  ${edges.join(";\n  ")};
}`;
}
