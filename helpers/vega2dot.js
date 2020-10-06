import { EventStream, Operator, Dataflow } from "vega-dataflow";
import { functionContext } from "vega-functions";
import { parse as vgParse } from "vega";

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
    ? edge.param.startsWith("$$")
      ? "cyan"
      : "#aaaaaa"
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

function escapeDotString(string) {
  return string
    ? string
        .replace(/\[/g, "\\[")
        .replace(/\]/g, "\\]")
        .replace(/\{/g, "\\{")
        .replace(/\}/g, "\\}")
        .replace(/\"/g, '\\"')
    : "";
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
        tooltip = escapeDotString(JSON.stringify(op.value));
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
        tooltip = escapeDotString(JSON.stringify(op.value));
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

  // dig out all event streams using hijack method
  const _receive = EventStream.prototype.receive;
  const _evaluate = Operator.prototype.evaluate;
  const _pulse = Dataflow.prototype.pulse;
  const _update = Dataflow.prototype.update;
  const _functions = {};
  Object.keys(functionContext).forEach(
    (key) => (_functions[key] = functionContext[key])
  );

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

  const extendTopoNodes = (operator) => {
    if (operator._targets && operator._targets instanceof Array) {
      if (operator.stamp === undefined) {
        operator._targets.forEach((op) => {
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
          if (
            !edges.find(
              (edge) =>
                edge.nodes[0] === "e" + operator.id &&
                edge.nodes[1] === "e" + op.id
            )
          ) {
            edges.push({
              nodes: ["e" + operator.id, "e" + op.id],
              param: "pulse",
            });
          }
          extendTopoNodes(op);
        });
      } else {
        operator._targets.forEach((op) => {
          if (!ids[op.id]) {
            let type = op.constructor.name.toLowerCase();
            let tooltip = "";
            if (type === "object") {
              if (op.stamp === undefined) {
                opid = "e" + opid;
                type = "eventstream";
              } else if (rt.root !== op) {
                type = "operator";
                tooltip = escapeDotString(JSON.stringify(op.value));
              }
            }
            const node = {
              id: op.id,
              type,
              stamp: op.stamp,
              value: op,
              tooltip,
            };
            if (markTypes[node.type]) node.isMark = true;
            if (signals[op.id]) node.signal = signals[op.id];
            if (scales[op.id]) node.scale = scales[op.id];
            if (data[op.id]) node.data = data[op.id];
            if (rt.root === op) node.root = true;
            nodes.push(node);
            ids[op.id] = node;
          }
          if (
            !edges.find(
              (edge) => edge.nodes[0] === operator.id && edge.nodes[1] === op.id
            )
          ) {
            edges.push({
              nodes: [operator.id, op.id],
              param: op.source === operator ? "pulse" : argop(op, operator),
            });
          }
          extendTopoNodes(op);
        });
      }
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

  const extractOperatorStatement = (op) => {
    const nestedGet = (target, path) => {
      if (path === "$$realpath$$") return target.base;
      return new Proxy(
        { base: target.base + "['" + path + "']" },
        {
          get: nestedGet,
        }
      );
    };
    const nestedFunctionGet = (target, path) => {
      if (path === "$$realpath$$") return target.base;
      return (...args) =>
        new Proxy(
          {
            base:
              (target.base ? target.base + "." : "") +
              path +
              "(" +
              args
                .map((arg) =>
                  arg.$$realpath$$ ? arg.$$realpath$$ : JSON.stringify(arg)
                )
                .join(", ") +
              ")",
          },
          {
            get: nestedFunctionGet,
          }
        );
    };
    const fakeDatum = new Proxy(
      { base: "datum" },
      {
        get: nestedGet,
      }
    );
    const fakeVega = (func, param) =>
      new Proxy(
        {
          base: `${func}(${param !== undefined ? JSON.stringify(param) : ""})`,
        },
        {
          get: nestedGet,
        }
      );
    const fakeThis = new Proxy({ base: "" }, { get: nestedFunctionGet });
    const serializeItem = (item) =>
      item
        ? {
            x: item.x,
            y: item.y,
            markGroup: item.mark && item.mark.group,
          }
        : undefined;
    Object.keys(functionContext).forEach(
      (key) => (functionContext[key] = fakeThis[key])
    );
    try {
      return escapeDotString(
        op._update.call(fakeThis, op._argval, {
          item: { datum: fakeDatum },
          vega: {
            view: () => ({
              changeset: () => ({
                encode: (_, name) => ({
                  $$realpath$$: JSON.stringify(name),
                }),
              }),
            }),
            item: () => ({ datum: fakeDatum }),
            group: (item) => fakeVega("group", item),
            xy: (item) => fakeVega("xy", serializeItem(item)),
            x: (item) => fakeVega("x", serializeItem(item)),
            y: (item) => fakeVega("y", serializeItem(item)),
          },
        }).$$realpath$$
      );
    } catch (e) {
      return "";
    }
  };

  const extendStream2Node = async (stream, list = null) => {
    if (!list)
      list = getNodeListWithFilter(view._scenegraph.root, stream._filter);
    else list = getNodeListWithListAndFilter(list, stream._filter);
    if (stream.hasOwnProperty("_apply")) {
      let { op, param } = await new Promise((res) => {
        Operator.prototype.evaluate = function () {
          const op = this;
          let param = null;
          if (op._update) {
            param = extractOperatorStatement(op);
          }
          res({ op, param });
        };
        Dataflow.prototype.pulse = () => {};
        Dataflow.prototype.update = () => {};
        stream._apply({ item: { mark: {} } });
        setTimeout(() => res({ op: null, param: null }), 1000);
      });
      if (op) {
        if (
          !edges.find(
            (edge) =>
              edge.nodes[0] === "e" + stream.id && edge.nodes[1] === op.id
          )
        ) {
          edges.push({
            nodes: ["e" + stream.id, op.id],
            param: "event",
          });
        }
        if (
          !edges.find(
            (edge) =>
              edge.nodes[1] === "e" + stream.id && edge.nodes[0] === op.id
          )
        ) {
          edges.push({
            nodes: [op.id, "e" + stream.id],
            param: "result",
          });
        }
        if (!ids[op.id]) {
          const node = {
            id: op.id,
            type: "operator",
            stamp: op.stamp,
            value: op,
            tooltip: param,
          };
          nodes.push(node);
          ids[op.id] = node;
        }
      }
      const receiveList = [];
      for (let node of list) {
        try {
          let { op, param } = await new Promise((res) => {
            Operator.prototype.evaluate = function () {
              const op = this;
              let param = "";
              if (op._update) {
                param = extractOperatorStatement(op);
              }
              res({ op, param });
            };
            Dataflow.prototype.pulse = () => {};
            Dataflow.prototype.update = () => {};
            stream._apply({ item: node });
            setTimeout(() => res({ op: null, param: null }), 1000);
          });
          if (param.trim()) {
            ids[op.id].tooltip = param;
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
            if (
              !edges.find(
                (edge) =>
                  edge.nodes[0] === "e" + stream.id && edge.nodes[1] === op.id
              )
            ) {
              edges.push({
                nodes: ["e" + stream.id, op.id],
                param,
              });
            }
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

  for (let node of nodes) {
    extendTopoNodes(node.value);
    if (
      node.type === "operator" &&
      !node.tooltip &&
      node.value.hasOwnProperty("_update") &&
      node.value._update.toString().includes("native code")
    ) {
      node.tooltip = extractOperatorStatement(node.value);
    }
  }

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
  Object.keys(functionContext).forEach(
    (key) => (functionContext[key] = _functions[key])
  );

  keys.forEach((key) => {
    const op = ops[key];
    if (op._targets)
      op._targets.forEach((t) => {
        if (op.stamp === undefined) {
          return;
        } else {
          if (!ids[t.id]) {
            console.log(t.id);
            return;
          }
          if (
            !edges.find(
              (edge) => edge.nodes[0] === op.id && edge.nodes[1] === t.id
            )
          ) {
            edges.push({
              nodes: [op.id, t.id],
              param: t.source === op ? "pulse" : argop(t, op),
            });
          }
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

  nodes.forEach((node) => {
    const op = node.value;
    if (op._argops) {
      op._argops.forEach((src) => {
        src = src.op;
        if (op.stamp === undefined) {
          return;
        } else {
          if (!ids[src.id]) {
            console.log(src);
            return;
          }
          if (
            !edges.find(
              (edge) => edge.nodes[1] === op.id && edge.nodes[0] === src.id
            )
          ) {
            edges.push({
              nodes: [src.id, op.id],
              param: "$$" + argop(op, src),
            });
          }
        }
      });
    }
  });

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
        (e.param === "pulse"
          ? ""
          : e.param.startsWith("$$")
          ? e.param.slice(2)
          : e.param) +
        '"]' +
        ' [color="' +
        edgeColor(e, ids, stamp) +
        '"]' +
        ' [fontcolor="' +
        edgeLabelColor(e, ids, stamp) +
        '"]' +
        ' [weight="' +
        edgeWeight(e, ids) +
        '"]' +
        ' [style="' +
        (e.param.startsWith("$$") ? "dashed" : "solid") +
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

/**
 *
 * @param {any} obj
 * @param {string} prefix
 * @returns {[{
 *  path: string,
 *  ref: number
 * }]}
 */
function findRefsInObject(obj, prefix = "") {
  let result = [];
  if (obj && typeof obj === "object") {
    for (let key in obj) {
      if (key === "subflow") continue;
      if (obj[key] && obj[key].$ref !== undefined) {
        result.push({ path: prefix + key, ref: obj[key].$ref });
        continue;
      }
      result = result.concat(findRefsInObject(obj[key], prefix + key + "."));
    }
  }
  return result;
}

const concatType = ["aggregate", "joinaggregate", "window"];

function getNodeOutputOrDefault(op) {
  if (!op.params) return undefined;
  // Extracted from https://vega.github.io/vega/docs/transforms/
  const defaultMap = {
    bin: "bin0, bin1",
    countpattern: "text, count",
    cross: "a, b",
    density: "value, density",
    dotbin: "bin",
    fold: "key, value",
    kde: "value, density",
    quantile: "prob, value",
    sequence: "data",
    timeunit: "unit0, unit1",
    geopath: "as",
    geopoint: "x, y",
    geoshape: "shape",
    heatmap: "image",
    isocontour: "contour",
    kde2d: "grid",
    force: "x, y, vx, vy",
    label: "x, y, opacity, align, baseline",
    linkpath: "path",
    pie: "startAngle, endAngle",
    stack: "y0, y1",
    voronoi: "path",
    wordcloud: "x, y, font, fontSize, fontStyle, fontWeight, angle",
    pack: "x, y, r, depth, children",
    partition: "x0, y0, x1, y1, depth, children",
    tree: "x, y, depth, children",
    treemap: "x0, y0, x1, y1, depth, children",
  };
  if (op.type in defaultMap) {
    return op.params.as
      ? op.params.as instanceof Array
        ? op.params.as.join(", ")
        : typeof op.params.as === "string"
        ? op.params.as
        : escapeDotString(JSON.stringify(op.params.as))
      : defaultMap[op.type];
  }
  if (concatType.includes(op.type)) {
    return op.params.as
      ? op.params.as
      : op.params.ops
      ? op.params.ops.map(
          (op, i) => op + (op.params.fields[i] ? "_" + op.params.fields[i] : "")
        )
      : undefined;
  }
  return op.params.as
    ? escapeDotString(JSON.stringify(op.params.as))
    : undefined;
}

function enrichNodeInformation(node, op) {
  if (op.type === "mark") {
    node.tooltip =
      op.params.markdef.marktype +
      (op.params.markdef.name ? ` \\"${op.params.markdef.name}\\"` : "");
  }
  if (op.type === "encode" && op.params.encoders) {
    node.tooltip = escapeDotString(
      Object.entries(op.params.encoders.$encode)
        .map(([k, v]) => {
          return `${k}: ${JSON.stringify(v.$fields)} → ${JSON.stringify(
            v.$output
          )}`;
        })
        .join("\\n")
    );
  }
  if (op.type === "scale") {
    const params = op.params;
    const normalizeDR = (key) => {
      if (params[key] instanceof Array) {
        return `[${params[key]
          .map((item, idx) =>
            item.$ref !== undefined ? `${key}.${idx}` : item
          )
          .join(", ")}]`;
      } else if (params[key] && params[key].$ref !== undefined) {
        return `${key}`;
      }
      return `unknown(${key})`;
    };
    node.tooltip =
      [
        params.type,
        params.reverse ? "reverse" : "",
        params.round ? "round" : "",
        params.clamp ? "clamp" : "",
        params.nice ? "nice" : "",
        params.zero ? "zero" : "",
        params.domainImplicit ? "domainImplicit" : "",
        params.sort ? "sort" : "",
      ]
        .filter((x) => x)
        .join(", ") +
      "\\n" +
      normalizeDR("domain") +
      " → " +
      normalizeDR("range");
  }
  if (concatType.includes(op.type) && op.params) {
    node.tooltip =
      op.params.groupby instanceof Array
        ? op.params.groupby.map((gp) => gp.$field).join(", ") +
          (!op.params.fields ? " → count" : "")
        : op.params.groupby.$field +
          (op.params.groupby.$name ? " → " + op.params.groupby.$name : "");
  }
  if (op.params && op.params.expr) {
    node.tooltip =
      (node.tooltip ? node.tooltip + "\\n" : "") +
      escapeDotString(op.params.expr.$expr.code);
  }
  const nodeOutput = getNodeOutputOrDefault(op);
  if (op.params && op.params.field && op.params.field.$field) {
    node.tooltip =
      (node.tooltip ? node.tooltip + "\\n" : "") +
      op.params.field.$field +
      (nodeOutput ? " → " + nodeOutput : "");
  } else if (op.params && op.params.fields) {
    node.tooltip =
      (node.tooltip ? node.tooltip + "\\n" : "") +
      op.params.fields
        .map(
          (fd, i) =>
            fd.$field +
            (nodeOutput instanceof Array ? " → " + nodeOutput[i] : "")
        )
        .join(", ") +
      (typeof nodeOutput === "string" ? " → " + nodeOutput : "");
  } else if (nodeOutput) {
    node.tooltip =
      (node.tooltip ? node.tooltip + "\\n" : "") +
      " → " +
      (nodeOutput instanceof Array
        ? nodeOutput.join(", ")
        : typeof nodeOutput === "string"
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
      tooltip: "",
    };
    if (markTypes[op.type]) node.isMark = true;
    if (op.signal) {
      node.signal = op.signal;
      node.tooltip = escapeDotString(JSON.stringify(op.value));
    }
    if (op.scale) node.scale = op.scale;
    if (op.type === "collect" && op.data) {
      node.data = Object.keys(op.data)[0];
      if (op.value && op.value.$ingest instanceof Array) {
        node.tooltip = op.value.$ingest.length + " data rows";
      }
    }
    if (op.root) {
      node.root = true;
    }
    enrichNodeInformation(node, op);
    nodes.push(node);
    if (op.type === "prefacet") {
      const [n] = buildGraph(op.params.subflow.$subflow);
      nodes = nodes.concat(n);
    }
  });

  dataflow.streams.forEach((op) => {
    const node = {
      id: op.id,
      type: "eventstream",
      value: op,
      tooltip: "",
    };
    if (op.type) node.event = op.source + ":" + op.type;
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
          src.path === "pulse" &&
          node.type === "collect" &&
          nodes.find((node) => node.id === src.ref) &&
          nodes.find((node) => node.id === src.ref).type === "datajoin"
        ) {
          node.isMark = true;
        }
      });
    }
    if (op.stream) {
      edges.push({ source: op.stream, target: op.id, param: "pulse" });
    }
  });

  dataflow.updates.forEach((update) => {
    if (update.update && update.update.$expr)
      edges.push({
        source:
          update.source.$ref === undefined ? update.source : update.source.$ref,
        target:
          update.target.$ref === undefined ? update.target : update.target.$ref,
        param: escapeDotString(update.update.$expr.code),
      });
    if (update.update && update.update.$params) {
      const params = findRefsInObject(update.update.$params);
      params.forEach((src) =>
        edges.push({
          source: src.ref,
          target:
            update.source.$ref === undefined
              ? update.source
              : update.source.$ref,
          param: escapeDotString(src.path),
        })
      );
    }
  });

  // assuming no more than 10k nodes in dataflow
  nodes = nodes.map((node) => {
    let id = node.id.toString().split(":");
    id = id.reduce((p, v) => p * 10000 + parseInt(v), 0);
    return {
      ...node,
      id,
    };
  });
  edges = edges
    .filter((edge) => edge.source !== edge.target)
    .map((edge) => {
      let source = edge.source.toString().split(":");
      let target = edge.target.toString().split(":");
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
           (node.tooltip ? "\\n" + node.tooltip : "") +
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
       .join(";\n  ")};
     ${edges
       .map((e) => {
         return (
           e.source +
           " -> " +
           e.target +
           ' [label="' +
           (e.param === "pulse"
             ? ""
             : e.param.startsWith("$$")
             ? e.param.slice(2)
             : e.param) +
           '"]' +
           ' [color="' +
           edgeColor(e) +
           '"]' +
           ' [fontcolor="' +
           edgeLabelColor(e) +
           '"]' +
           ' [style="' +
           (e.param.startsWith("$$") ? "dashed" : "solid") +
           '"]'
         );
       })
       .join(";\n  ")};
   }`;
}

export function vega2dot(vgSpec) {
  const runtime = vgParse(JSON.parse(vgSpec), {}, { ast: true });
  console.log(runtime);
  const dataflowGraph = buildGraph(runtime);
  console.log(dataflowGraph);
  // console.log(NEList2Dot(dataflowGraph));
  return NEList2Dot(dataflowGraph);
}
