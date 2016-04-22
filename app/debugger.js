var debug = {};

/*************************** Config ****************************/

debug.config = {
  "color": {
    "darkGreen": "#4E6836",   "green": "#70944D",
    "lightGreen": "#9BB482",  "blueGray": "#5997A6",
    "darkBlue": "#3E6A74",    "lightBlue": "#8BB6C1",
    "lightGray": "#F1F1F1",   "middleGray": "#d9d9d9",
    "gray": "#A4A4A4",        "red": "#C3423F"
  }
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

	d3.select(".vg_pane.debug").on("click", function() {
  	subviewVisibility();
  });

  debug.view = "timeline";
  d3.select(".sel_debug").on("change", function() {
    debug.view = d3.event.target.value;
    viewVisibility();
  });

  // Set up the mode radio buttons
  debug.currentMode = "play";
  d3.selectAll(".btn_mode").on("click", function() {
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
};

debug.start = function() {
  if(debug.open) {
    debug.close();
    debug.reset();
  }
};

// Reset the debugging tools.
debug.reset = function() {
  debug.mode("play");

  // Initialize the model
  model.reset();
  debug.mode("play");

  // Initialize the timeline
  var panel = d3.select(".mod_body.debug");
  annotation.reset();
  timeline.reset(panel, model.streams);
  overview.reset();
  datasets.reset(panel);
  viewVisibility();
};

debug.update = function(click) {
  if(!debug.open) return;
  if(debug.view === "timeline") timeline.update(model.streams);
  if(debug.view === "data") datasets.update();
  overview.update(model.pulseCounts, model.streams);
  if(debug.currentMode === "replay") {
    annotation.overlay();
    model.redrawVis();
  } else {
    if(annotation.svg) annotation.svg.remove();
    annotation.svg = null;
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
  d3.selectAll(".btn_mode").attr("class", function() {
    return this.className.replace(" selected", "");
  });
  if(mode === "play") toggle(".fa-play", "selected");
  if(mode === "replay") toggle(".fa-history", "selected");
  if(mode === "record") toggle(".fa-dot-circle-o", "selected");

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
