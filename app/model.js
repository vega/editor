var model = {
  internalsHidden:  true,   // Hide internals while debugging
  trackingHidden:   true,   // Hide debugging tracking
  propertiesHidden: ["_prev"],
  pulses: []
};

model.init = function() {
  model.signals       = null,
  model.pulseCounts   = {0: 0}, // Count pulse updates as they occur
  model.pulses        = [0],    // Maintain a list of pulses.
  model.times         = [Date.now()],
  model.streams       = {},     // Signal streams
  model.streamsHidden = {},     // Hidden signal streams (internal, tracking)
  model.currentMode   = null;
  model.current = {"time": Date.now()};

  setListeners();

  // Datasets
  model.schema = {};
  model.histograms = {};
  model.difference = {};
  model.data = {}
  extractData();

  // Analysis
  model.scaleTypes = {};
  classifyScales(ved.spec);

  model.marks = {};
  classifyMarks(ved.spec, ".")

  model.dependencies = {};
  Object.keys(model.streams).forEach(function(signalName) {
    model.dependencies[signalName] = dependencies(signalName);
  });

  model.modifies = modifies();
  model.clearPoints = {};
  model.modifies.forEach(function(mod) {
    var clear = mod.modify.filter(function(t) { return t.type === "clear" })[0];
    Object.keys(model.streams).forEach(function(name) {
      if((clear && clear.test.indexOf(name) !== -1) || !clear) {
        if(model.clearPoints[name]) {
          model.clearPoints[name] = {
            "datasets": model.clearPoints[name].push(mod.name),
            "cache": [{"time": model.times[0], "pulse": model.pulses[0]}]
          };
        } else {
          model.clearPoints[name] = {
            "datasets": [mod.name],
            "cache": [{"time": model.times[0], "pulse": model.pulses[0]}]
          };
        }
      }
    });
  });
};

model.reset = function() {
  model.init();
};

model.close = function() {
  model.signals = null;
};

model.mode = function(newMode) {
  if(model.currentMode === newMode) return;
  model.currentMode = newMode;

  if(model.signals) enableSignals();
  if(model.currentMode === "replay") disableSignals();
  if(model.currentMode === "record") {
    if(!model.times) return;
    var time = model.times[model.times.length - 1];
    Object.keys(model.streams).forEach(function(signalName) {
      var signal = model.valueOfSignalAtTime(signalName, time);
      if(signal.time === time) model.current = signal;
    });
  }
};

model.redrawVis = function() {
  if(model.modifies.length !== 0) {
    var end = {"time": model.current.time, "pulse": model.current.pulse};
    var start = end;
    Object.keys(model.clearPoints).forEach(function(clear) {
      var cache = model.clearPoints[clear].cache;
      for(i = cache.length - 1; i >= 0; i--) {
        if(cache[i].time <= model.current.time) {
          start = cache[i];
          break;
        }
      }
    });
    model.replayModifiesFromTo(start, end);
  } else {
    model.redraw();
  }
};

model.redraw = function() {
  enableSignals();  // Temporarily reenable signals.

  var newSignals = {};
  Object.keys(model.streams).forEach(function(signalName) {
    var value = model.valueOfSignalAtTime(signalName, model.current.time).value;
    newSignals[signalName] = value
  });

  ved.view.signal(newSignals, true).update();

  disableSignals(); // Disable signals again.
};

// Convert the input value/object to a string.
model.valueToString = function(value) {
  var string;
  if(typeof value === "object") {

    try {
      string = JSON.stringify(value);
      if(string && string.length >= 100) {
        var key = Object.keys(value)[0];
        var newValue = {};
        newValue[key] = value[key];
        string = JSON.stringify(newValue);
        string = string.substring(0, string.length - 1);
        string += ", <span style='color:" + color.red + "'>click to show more...</span>}";
      }
    } catch(err) {
      string = "Click to show.";
    }

  } else {
    string = JSON.stringify(value);
  }
  return string;
};

// Get the value of the given signal name at the given time.
model.valueOfSignalAtTime = function(signalName, time) {
  var result = {"time": 0};
  model.streams[signalName].forEach(function(value) {
    if(result.time < value.time && value.time <= time) {
      result = value;
    }
  });
  return result;
};

/********************** Signal Recording ***********************/
function setListeners() {
  if(!ved.spec.signals) return;
  var signals = ved.view.model()._signals;
  var specSignals = ved.spec.signals.map(function(signal) { return signal.name });
  Object.keys(signals).forEach(function(signalName) {
    if((model.internalsHidden && specSignals.indexOf(signalName) === -1)
    || (model.trackingHidden  && signalName.indexOf("_vgTRACKING") !== -1)) {
      model.streamsHidden[signalName] = [{
        "pulse": 0,
        "time": model.current.time,
        "value": signals[signalName].value()
      }];
      signals[signalName].on(recordHidden);
    } else {
      model.streams[signalName] = [{
        "pulse": 0,
        "time": model.current.time,
        "value": signals[signalName].value()
      }];
      model.pulseCounts[0] += 1;
      signals[signalName].on(recordEvent);
    }
  });
};

function recordEvent(signalName, value) {
  if(model.currentMode !== "record") return;

  var time = Date.now();
  var pulse = ved.view.model().signal(signalName)._stamp;

  // If in a new timestep or pulse, update the time lists.
  if(time > model.times[model.times.length - 1]) model.times.push(time);
  if(pulse > model.pulses[model.pulses.length - 1]) {
    model.pulses.push(pulse);
    model.getDifference();
  }
  model.pulseCounts[pulse] = (model.pulseCounts[pulse] || 0) + 1;
  var obj = {
    "pulse": pulse,
    "time": time,
    "value": value
  };
  model.streams[signalName].push(obj);

  Object.keys(model.clearPoints).forEach(function(name) {
    if(name === signalName) cacheData(signalName, value, time, pulse);
  });

  // Only update the current time if the stream was "live" / recording.
  if(model.currentMode === "record") model.current = obj;
  debug.update();
};

function recordHidden(signalName, value) {
  if(model.currentMode !== "record") return;
  var time = Date.now();
  var pulse = ved.view.model().signal(signalName)._stamp;
  var obj = {"pulse": pulse, "time": time, "value": value};
  model.streamsHidden[signalName].push(obj);
};

function cacheData(signalName, value, time, pulse) {
  var dataNames = model.clearPoints[signalName].datasets;
  var mod = model.modifies.filter(function(m) {
    return dataNames.indexOf(m.name) !== -1;
  });
  mod.forEach(function(m) {
    var test = m.modify.filter(function(t) { return t.type === "clear"; })[0];
    if(test && eval(test.test.replace(signalName, value))) {
      model.clearPoints[signalName].cache.push({"time": time, "pulse": pulse});
    } else {
      model.clearPoints[signalName].cache.push({"time": time, "pulse": pulse});
    }
  });
};

model.replayModifiesFromTo = function(start, end) {
  model.current = start;
  model.redraw();
  while(model.times.indexOf(end.time) - model.times.indexOf(model.current.time) >= Object.keys(model.streams).length) {
    model.forwardPulse();
    model.redraw();
  }
  while(model.current.time < end.time) {
    model.forward();
    model.redraw();
  }
};

/*********************** Static Analysis ***********************/

function dependencies(signalName) {
  var deps = [];
  var signalNames = Object.keys(model.streams);
  var signal = ved.spec.signals.filter(function(signal) {
    return signal.name === signalName;
  })[0];

  // Check for dependent signals in the stream definition.
  if(signal && signal.streams) {
    signal.streams.forEach(function(stream) {
      var contains = signalNames.filter(function(name) {
        return stream.expr.indexOf(name) >= 0;
      });
      deps = deps.concat(contains);
    });
  }

  // Check for dependent signals in the expr definition.
  if (signal && signal.expr) {
    var contains = signalNames.filter(function(name) {
      return signal.expr.indexOf(name) >= 0;
    });
    deps = deps.concat(contains);
  }
  return deps;
};

model.dependenciesOfSignalAtTime = function(signalName, time) {
  var values = {};
  model.dependencies[signalName].forEach(function(name) {
    if(name == signalName) {
      var lastTime = model.times[model.times.indexOf(time) - 1];
      values[name] = model.valueOfSignalAtTime(name, lastTime);
    } else {
      values[name] = model.valueOfSignalAtTime(name, time);
    }
  });
  return values;
};

model.scalesOfSignal = function(signalName) {
  var scales = {};
  var signal = ved.spec.signals.filter(function(s) {
    return s.name === signalName;
  })[0];

  if(!signal || !signal.streams) return scales;
  signal.streams.forEach(function(stream) {
    var obj = {};
    if(stream.scale instanceof Object) {

      obj.invert = stream.scale.invert;
      if(stream.scale.scope) {
        var time = model.valueOfSignalAtTime(signalName, model.current.time).time;
        var value = model.valueOfSignalAtTime(stream.scale.scope, time).value;
        if(value.scale) {
          if(model.scaleTypes) obj.type = model.scaleTypes[value.mark.name + "." + stream.scale.name];
          obj.scale = value.scale(stream.scale.name);
        } else {
          obj.scale = undefined;
        }
      } else {
        obj.scale = ved.view.model().scene().items[0].scale(stream.scale.name);
        if(model.scaleTypes) obj.type = model.scaleTypes["." + stream.scale.name];
      }
      scales[stream.scale.name] = obj;
    } else if(stream.scale) {
      obj.scale = ved.view.model().scene().items[0].scale(stream.scale);
      if(model.scaleTypes) obj.type = model.scaleTypes["." + stream.scale];
      scales[stream.scale] = obj;
    }
  });
  return scales;
};

function modifies() {
  var result = {};
  var mod = ved.spec.data.filter(function(d) {
    return d.modify;
  });
  return mod;
};

function classifyScales(root) {
  var positions = [];
  // Recursively look for scales in other levels
  (root.marks || []).forEach(function(item) {
    positions = positions.concat(classifyScales(item));
  });

  // Classify the scales at the current level.
  var newPositions = [];
  (root.scales || []).forEach(function(scale) {
    var name = root.name || root.type || "";
    var obj = {};
    if(scale.range == "width" || scale.domain == "width") {
      obj["name"] = scale.name;
      obj["domain"] = "width";
      obj["data"] = (scale.range == "width" ? "domain" : "range");
      if(positions.indexOf("width") != -1) {
        obj["type"] = "group";
      } else {
        obj["type"] = "position";
        newPositions.push("width");
      }
      model.scaleTypes[name + "." + scale.name] = obj;
    } else if(scale.range == "height" || scale.domain == "height") {
      obj["name"] = scale.name;
      obj["domain"] = "height";
      obj["data"] = (scale.range == "height" ? "domain" : "range");
      if(positions.indexOf("height") != -1) {
        obj["type"] = "group";
      } else {
        obj["type"] = "position";
        newPositions.push("height");
      }
      model.scaleTypes[name + "." + scale.name] = obj;
    } else {
      obj["name"] = scale.name;
      obj["type"] = "property";
      obj["scale"] = model.scale(ved.view.model().scene().items[0])
      if(scale.range.data || scale.range.signal) {
        obj["data"] = "range";
      } else {
        obj["data"] = "domain";
      }
      model.scaleTypes[name + "." + scale.name] = obj;
    }
  });

  return newPositions;
};

function classifyMarks(root) {
  root.marks.forEach(function(mark) {
    if(mark.type == "group") {
      classifyMarks(mark);
    } else {
      var scales = properties();
      scales = Object.keys(scales).map(function(scale) {
        return scales[scale].name;
      });
      model.marks[mark.name || mark.type] = scaledProperties(mark, scales);
    }
  });
};

function properties() {
  var scales = {};
  Object.keys(model.scaleTypes).forEach(function(key) {
    if(model.scaleTypes[key].type == "property") scales[key] = model.scaleTypes[key];
  });
  return scales;
};

function scaledProperties(mark, scales) {
  var result = {};
  Object.keys(mark.properties).forEach(function(set) {
    var properties = mark.properties[set];
    Object.keys(properties).forEach(function(property) {
      var definition = properties[property];
      if(definition.scale && scales.indexOf(definition.scale) >= 0) {
        result[property] = {"scale": definition.scale, "field": definition.field};
      }
    });
  });
  return result;
};

/************************** Datasets ***************************/
function extractData() {
  var specData = ved.spec.data.map(function(data) { return data.name; });
  ved.view.model().data()
      .filter(function(dataset) {
        return specData.indexOf(dataset.name()) !== -1 || !model.internalsHidden;
      })
      .forEach(function(dataset) {
        model.data[dataset.name()] = dataset;
        var values = model.data[dataset.name()].values();
        var properties = vg.util.keys(values[0]).filter(function(property) {
          if(model.propertiesHidden.indexOf(property) !== -1 && model.internalsHidden) return false;
          return true;
        });
        if(values.length != 0) model.schema[dataset.name()] = properties;
      });
};

model.getDifference = function() {
  Object.keys(model.data).forEach(function(dataName) {
    var data = model.data[dataName].values();
    (model.schema[dataName] || []).forEach(function(propertyName) {
      var values = computeHistogram(data, propertyName);
      calculateDifference(dataName, propertyName, values)
    });
  });
};

function calculateDifference(data, property, values) {
  if(!model.histograms[data]) model.histograms[data] = {};
  if(!model.difference[data]) model.difference[data] = {};

  var numPulses = model.pulses.length - 1;
  if(numPulses != (model.difference[data][property] || []).length) {
    var padding = Array.apply(null, Array(numPulses)).map(Number.prototype.valueOf,0);
    model.difference[data][property] = (model.difference[data][property] || []).concat(padding);
  }

  // Compute difference
  var prevValues = model.histograms[data][property] || [];
  var difference = 0;
  if(prevValues.length == 0) {
    // Do nothing. The difference should be zero at the start (no change).
  } else {
    values.forEach(function(array) {
      var index = values.indexOf(array);
      difference += Math.abs(array.length - (prevValues[index] || []).length);
    });
  }
  model.histograms[data][property] = values;
  model.difference[data][property] = (model.difference[data][property] || []).concat(difference);
};

function computeHistogram(data, property) {
  // Get the array of values for the histogram
  var values = data.map(function(value) { return value[property]; });

  // Compute the histogram layout
  var x, data, type;
  if(typeof values[0] === "number") {
    data = d3.layout.histogram().bins(20)(values);
  } else {
    x = d3.scale.ordinal().domain(values);
    var index = -1;
    var ordinalRange = x.domain().map(function(x) { return ++index*20; });
    x.range(ordinalRange);
    var reverse = d3.scale.ordinal().domain(x.range()).range(x.domain());
    data = d3.layout.histogram().bins(x.domain().length)(values.map(x));
  }
  return data;
};

/********************** Helper Functions ***********************/
function disableSignals() {
  var signals = ved.view.model()._signals;
  model.signals = signals;
  ved.view.model()._signals = {};
  Object.keys(model.signals).forEach(function(signalName) {
    if(signalName.indexOf("_vgTRACKING") !== -1) {
      ved.view.model()._signals[signalName] = model.signals[signalName];
    }
  });
};

function enableSignals() {
  ved.view.model()._signals = model.signals;
  model.signals = null;
};

model.context = function() {
  var context;
  if(ved.view.model().signal("group_vgTRACKING")) {
    context = ved.view.model().signal("group_vgTRACKING").value();
  }
  if(Object.keys(context).length === 0) {
    context = ved.view.model().scene().items[0];
  }
  return context;
};

model.scale = function(type, domain, group) {
  var scale = undefined;
  Object.keys(model.scaleTypes).forEach(function(key) {
    var s = model.scaleTypes[key];
    if(s.type == type && s.domain == domain && key.indexOf(group) >= 0) {
      scale = s;
    }
  });
  return scale;
};

/************************* Navigation **************************/
model.backPulse = function() {
  model.mode("replay");
  var index = model.pulses.indexOf(model.current.pulse);

  // When first entering replay, don't change the pulse.
  if(model.mode === "record" || index === 0) return "replay";

  // Find the last signal update of the previous pulse.
  var value = {"time": 0};
  Object.keys(model.streams).forEach(function(signalName) {
    var values = model.streams[signalName].filter(function(value) {
      return value.pulse == model.pulses[index - 1];
    });
    if(values.length == 1 && values[0].time > value.time) value = values[0];
  });
  model.current = value;
  return "replay";
};

model.back = function() {
  model.mode("replay");
  var index = model.times.indexOf(model.current.time);

  // When first entering replay, don't change the pulse.
  if(model.mode === "record" || index === 0) return "replay";

  var newTime = model.times[index - 1];
  Object.keys(model.streams).forEach(function(signalName) {
    var value = model.valueOfSignalAtTime(signalName, newTime);
    if(value.time === newTime) model.current = value;
  });
  return "replay";
};

model.forwardPulse = function() {
  var index = model.pulses.indexOf(model.current.pulse);
  if(index === model.pulses.length - 1) {
    // Indicate that the visualization should start recording again.
    model.mode("record");
    return "record";
  }

  model.mode("replay");
  var value = {"time": 0};
  Object.keys(model.streams).forEach(function(signalName) {
    var values = model.streams[signalName].filter(function(value) {
      return value.pulse == model.pulses[index + 1];
    });
    if(values.length === 1 && values[0].time > value.time) value = values[0];
  });
  model.current = value;
  return "replay";
};

model.forward = function() {
  var index = model.times.indexOf(model.current.time);
  if(index == model.times.length - 1) {
    // Indicate that the visualization should start recording again.
    model.mode("record");
    return "record";
  }

  model.mode("replay");
  var newTime = model.times[index + 1];
  Object.keys(model.streams).forEach(function(signalName) {
    var value = model.valueOfSignalAtTime(signalName, newTime);
    if(value.time === newTime) model.current = value;
  });
  return "replay";
};
