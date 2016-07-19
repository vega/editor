var debug = {};

/*************************** Config ****************************/

debug.config = {
  "color": {
    "darkGreen": "#4E6836",   "green": "#70944D",
    "lightGreen": "#9BB482",  "blueGray": "#5997A6",
    "darkBlue": "#3E6A74",    "lightBlue": "#8BB6C1",
    "lightGray": "#F1F1F1",   "middleGray": "#d9d9d9",
    "gray": "#A4A4A4",        "red": "#C3423F"
  },
  "replay": "fa-pause",    // Font Awesome symbol to replay
  "record": "fa-play"      // Font Awesome symbtol to record
};

/**********************                  ***********************/

debug.init = function() {
  debug.open = false;

	// Set up the debugging button
	d3.select(".btn_debug").attr("class", "btn_debug fa fa-bug hide-vl");
	d3.select(".btn_debug").on("click", function() {
    debug.open = !debug.open;
		toggle(this, "selected");
		toggle(".vega-editor", "debugging");
    debug.start();
		ved.resize();
	});

  d3.select(".fa-question-circle").on("click", function() {
    d3.event.stopPropagation();
  });

  d3.select(".click_toggle_vega.debug")
      .style("margin-left", function() {
        return this.parentNode.getBoundingClientRect().width / 2 - 175 + "px";
      });

	d3.select(".vg_pane.debug").on("click", function() {
  	subviewVisibility();
  });

  debug.view = "timeline";
  d3.select(".sel_debug").on("change", function() {
    debug.view = d3.event.target.value;
    viewVisibility();
  });

  // Set up the mode radio buttons
  debug.currentMode = "record";
  d3.selectAll(".btn_mode").on("click", function() {
    d3.event.stopPropagation();
    model.current = {
      "time": model.times[model.times.length - 1],
      "pulse": model.pulses[model.pulses.length - 1]
    };
    if(debug.currentMode === "replay") model.redrawVis();
    debug.mode(d3.select(this).attr("value"));
    debug.update();
  });

  d3.select(".sel_debug").on("click", function() {
  	d3.event.stopPropagation();
  });

  d3.select("body").on("keydown", keyboardNavigation);

  specVisibility();

  debug.width = d3.select("#overview").style("width");
};

debug.start = function() {
  if(debug.open) {
    debug.close();
    debug.reset();
  }
};

// Reset the debugging tools.
debug.reset = function() {
  debug.mode("record");

  // Initialize the model
  model.reset();
  debug.mode("record");

  // Initialize the timeline
  var panel = d3.select(".mod_body.debug");
  annotation.reset();
  timeline.reset(panel, model.streams);
  overview.reset();
  datasets.reset(panel);

  // Switch to the data if there are no signals
  if(Object.keys(model.streams).length == 0) {
    debug.view = "data";
    d3.select(".sel_debug").selectAll("option")
        .filter(function() { 
          return this.value == "data";
        })[0][0].selected = true;
  }
  viewVisibility();
};

debug.update = function(click) {
  if(!debug.open) return;
  if(debug.view === "timeline") timeline.update(model.streams);

  overview.update(model.pulseCounts, model.streams);
  if(debug.currentMode === "replay") {
    annotation.overlay();
    model.redrawVis();
  } else {
    if(annotation.svg) annotation.svg.remove();
    annotation.svg = null;
  }
  
  if(debug.view === "data") {
    var change = 0;
    if(model.difference[datasets.active]) {
      var index = model.pulses.indexOf(model.current.pulse);
      model.schema[datasets.active].forEach(function(property) {
        var difference = model.difference[datasets.active][property];
        change += difference[index];
      });
    }
    var changed = !model.difference[datasets.active] || change != 0;
    datasets.update(changed);
  }
};

debug.close = function() {
  model.close();
  overview.close();
  timeline.close();
  datasets.close();
  annotation.close();
};

debug.mode = function(mode) {
  debug.currentMode = mode;
  var type = (mode === "replay") ? "record" : "replay";
  d3.selectAll(".btn_mode").attr("class", "btn_mode debug selected fa " + debug.config[type])
      .attr("title", type)
      .attr("value", type);
  model.mode(debug.currentMode);
};

debug.findReferences = function(value) {
  var options = {
    backwards: false,
    wrap: true,
    caseSensitive: true, 
    wholeWord: true,
    range: null,
    regExp: false
  };
  ved.editor["vega"].find(value, options, true);
  var result = ved.editor["vega"].findAll(value, options);

  if(result == 0) return;
};

/********************** Helper Functions ***********************/
function subviewVisibility() {
  var toggle = d3.select(".click_toggle_vega.debug");
  var body = d3.select(".mod_body.debug");
  if(toggle.attr("class").indexOf("up") != -1) {
    toggle.attr("class", "click_toggle_vega down debug");
    body.attr("class", "mod_body debug max");
  } else {
    toggle.attr("class", "click_toggle_vega up debug");
    body.attr("class", "mod_body debug min");
  }
  ved.resize();
};

function viewVisibility() {

  if(debug.view === "timeline") datasets.removeLines()

  d3.select("#timeline").style("display", function() {
    return (debug.view === "timeline") ? "inline-block" : "none";
  });
  d3.select("#data").style("display", function() {
    return (debug.view === "data") ? "inline-block" : "none";
  });
  debug.update();
};

function toggle(el, toggle) {
	var className = d3.select(el).attr("class");
	d3.select(el).attr("class", function() {
		if(className.indexOf(toggle) == -1) return className + " " + toggle;
		return className.replace(" " + toggle, "");
	});
};

function specVisibility() {
  d3.select(".click_toggle_vis").on("click", function() {
    var current = d3.select(this).attr("class");
    if(current.indexOf("left") !== -1) {
      d3.select(this).attr("class", current.replace("left", "right"))
        .select("span").attr("class", "fa fa-angle-double-right");
      d3.select(".mod_spec").style("display", "none");
    } else {
      d3.select(this).attr("class", current.replace("right", "left"))
        .select("span").attr("class", "fa fa-angle-double-left");
      d3.select(".mod_spec").style("display", "flex");
    }
  })
};

/********************* Keyboard Navigation *********************/
function keyboardNavigation() {
  if(model.pulses.length === 0) return;
  var newMode = debug.currentMode;

  // Keyboard navigation of the timeline.
  if(d3.event.keyCode === 37 /* left arrow */) {
    newMode = model.backPulse();
  }
  if(d3.event.keyCode === 38 /* up arrow */) {
    newMode = model.back();
  }
  if(d3.event.keyCode === 39 /* right arrow */) {
    newMode = model.forwardPulse();
  }
  if(d3.event.keyCode === 40 /* down arrow */) {
    newMode = model.forward();
  }

  if(newMode !== debug.currentMode) debug.mode(newMode);
  debug.update();
};
