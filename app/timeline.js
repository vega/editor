var timeline = {
  indent: 5
};

timeline.init = function(panel, streams) {
  if(Object.keys(streams).length === 0) return;
  timeline.div = panel.append("div")
      .attr("class", "debug")
      .attr("id", "timeline");
  
  timeline.table = timeline.div.append("table");

  timeline.initTable(streams);
  timeline.update(streams);
};

timeline.reset = function(panel, streams) {
  timeline.init(panel, streams);
};

timeline.close = function() {
  if(timeline.div) timeline.div.remove();
  d3.select(".cursor").remove();
};

timeline.update = function(streams) {
  if(Object.keys(streams).length === 0) return;
  updateValues(streams);
  updateTimeline(streams);
  drawCursor();
};

/************************* Initialize **************************/

timeline.initTable = function(streams) {
  Object.keys(streams).forEach(function(signalName) {
    var row = timeline.table.append("tr");

    // Create the name column.
    row.append("td")
        .attr("class", "fixed-width")
      .append("div")
        .html(signalName)
        .attr("class", "fixed-width")
        .attr("id", signalName + "-name")
      .on("click", function() {
        debug.findReferences(this.innerHTML);
      });

    // Create the timeline column.
    row.append("td").append("div")
        .attr("class", "values")
      .append("svg")
        .attr("id", signalName + "-signals")
      .on("mousewheel", function() {
        var dx = d3.event.wheelDeltaX % 2;
        overview.scrollBrush(dx);
      });

    // Create the value column.
    row.append("td")
        .attr("class", "fixed-width")
      .append("div")
        .html(model.valueToString(streams[signalName][0].value))
        .attr("class", "fixed-width")
        .attr("id", signalName + "-value")
      .on("click", function(d) {
        var signalName = this.id.replace("-value", "");
        var value = model.valueOfSignalAtTime(signalName, model.current.time);
        drawPopup(signalName, value);
      })
      .on("mouseover", function() {
        drawValueTooltip(this);
      })
      .on("mouseout", function() {
        d3.selectAll(".extension").remove();
        d3.selectAll(".label").remove();
      });
  });
};

/*************************** Update ****************************/

function updateValues(streams) {
  Object.keys(streams).forEach(function(signalName) {
    
    // Get the value of the stream at the current time.
    var value = model.valueOfSignalAtTime(signalName, model.current.time);

    var node = d3.select("#" + signalName + "-value")
        .html(model.valueToString(value.value))
        .style("background-color", function() {
          if(value.time == model.current.time) return debug.config.color.darkGreen;
          return debug.config.color.lightGreen;
        })
        .style("color", function() {
          if(model.valueToString(value.value) == "Click to show.") {
            if(value.time == model.current.time) return debug.config.color.blueGray;
            return debug.config.color.darkBlue;
          }
          return "white";
        });
  });
};

function updateTimeline(streams) {
  var visible = model.pulses.filter(function(pulse) {
    if(!overview.brush || overview.brush.empty()) return true;
    var index = model.pulses.indexOf(pulse);
    return index >= overview.convert(overview.brush.extent()[0]) && 
           index < overview.convert(overview.brush.extent()[1])
  });

  var width = document.getElementById("overview").clientWidth * 0.6;
  var cellWidth = width / Object.keys(visible).length;

  Object.keys(streams).forEach(function(signalName) {
    
    // Filter the data appropriately.
    var data = streams[signalName].filter(function(value) {
      if(visible.indexOf(value.pulse) !== -1) return true;
      return false;
    });
    
    // Draw the signal rects.
    var rects = d3.select("#" + signalName + "-signals").selectAll("rect")
        .data(data);
    
    // Add new signal rects.
    rects.enter().append("rect")
      .on("click", function(d) {
        model.current = d;
        debug.mode("replay");
        debug.update(true);
      })
      .on("mouseover", function(d) {
        drawDependencies(signalName, d.time);
        timeline.drawCellTooltip(d.value);
        d3.select(this).style("fill", debug.config.color.gray);
      })
      .on("mouseout", function(d) {
        removeDependencies();
        removeCellTooltip();
        d3.select(this).style("fill", function(d) {
          var color = debug.config.color;
          if(d.time == model.current.time) return color.darkGreen;
          var current = model.valueOfSignalAtTime(signalName, model.current.time);
          if(d.value == current.value && d.time == current.time) return color.lightGreen;
          return color.middleGray;
        });
      });
    
    // Update properties.
    rects.attr("width", cellWidth)
        .attr("x", function(d) {
          var index = visible.indexOf(d.pulse);
          return index * cellWidth;
        })
        .style("fill", function(d) {
          var color = debug.config.color;
          if(d.time == model.current.time) return color.darkGreen;
          var current = model.valueOfSignalAtTime(signalName, model.current.time);
          if(d.value == current.value && d.time == current.time) return color.lightGreen;
          return color.middleGray;
        });
    rects.exit().remove();
  });
};

/************************** Tooltip ***************************/
timeline.drawCellTooltip = function(value) {
  if(!(typeof value === "string")) value = model.valueToString(value);

  var tooltip;
  if(d3.select(".tooltip")[0][0]) {
    tooltip = d3.select(".tooltip").html(value);
  } else {
    tooltip = d3.select("#overview").append("div")
        .html(value)
        .attr("class", "tooltip") 
        .style("opacity", 0);
  }

  tooltip.transition()        
        .duration(100)      
        .style("opacity", 0.9);
};

function removeCellTooltip() {
  if(!d3.select(".tooltip")[0][0]) return;
  d3.select(".tooltip").transition()        
      .duration(700)      
      .style("opacity", 0)
      .each("end", function() { this.remove(); });
};

function drawValueTooltip(div) {
  var value = model.valueOfSignalAtTime(div.id.replace("-value", ""), model.current.time);
  var bounds = document.getElementById(div.id).getBoundingClientRect();
  var arrowColor = {};
  var valueCell = d3.select("body").append("div")
      .html(model.valueToString(value.value))
      .attr("class", "extension") 
      .style("position", "absolute")
      .style("left", bounds.left + "px")
      .style("top", bounds.top + "px")
      .style("background-color", function() {
        var type = (value.time == model.current.time);
        var color = debug.config.color;
        arrowColor.arrow = type ? color.gray : color.darkBlue;
        arrowColor.name = type ? color.lightBlue : color.blueGray;
        return type ? color.darkGreen : color.lightGreen;
      });

  // The scales associated with the signal.
  var scales = model.scalesOfSignal(div.id.replace("-value", ""));
  Object.keys(scales).forEach(function(scaleName) {
    var s = scales[scaleName];
    drawScaleTooltip(value, scaleName, s, arrowColor);
  });
};

function drawScaleTooltip(value, scaleName, scale, arrowColor) {
  var label = d3.select("body").append("div")
      .attr("class", "label")
      .style("position", "absolute")
      .style("background-color", function() {
        if(value.time == model.current.time) return debug.config.color.darkGreen;
        return debug.config.color.lightGreen;
      });
  var table = label.append("table");
  
  // Create the header row.
  var arrowHead  = (scale.invert ? "inversion" : "scale");
  var inputHead, outputHead;
  if(/*scale.type.data == "domain" && */ scale.invert
  || /*scale.type.data != "domain" && */ !scale.invert) {
    inputHead = "pixel";
    outputHead = "data";
  } else {
    inputHead = "data";
    outputHead = "pixel";
  }
  
  var row = table.append("tr");
  row.append("th").append("div")
      .html(inputHead)
      .style("color", arrowColor.arrow);
  row.append("th").append("div")
      .html(arrowHead)
      .style("color", arrowColor.arrow);
  row.append("th").append("div")
      .html(outputHead)
      .style("color", arrowColor.arrow);
  
  // Create the data row.
  var arrowString = "<span style='color:" + arrowColor.arrow + "'>&#x2550;&#x2550;</span>"
                  + "<span style='color:" + arrowColor.name + "'>&#x00A0;" 
                  + scaleName
                  + (scale.invert ? "<sup>-1</sup>" : "")
                  + "&#x00A0;</span>"
                  + "<span style='color:" + arrowColor.arrow + "'>&#10233;</span>";

  row = table.append("tr");
  row.append("td").append("div").html(scale.invert 
    ? (scale.scale ? scale.scale(value.value) : "")
    : (scale.scale ? scale.scale.invert(value.value) : ""));
  row.append("td").append("div").html(arrowString);
  row.append("td").append("div").html(model.valueToString(value.value));

  // Position the tooltip appropriately.
  var extensionBounds = document.getElementsByClassName("extension")[0].getBoundingClientRect();
  var labelBounds = document.getElementsByClassName("label")[0].getBoundingClientRect()
  var left = extensionBounds.left - (labelBounds.width - extensionBounds.width);
  var top = extensionBounds.top - (labelBounds.height - extensionBounds.height);
                 
  label.style("top", top + "px").style("left", left + "px");
};

/************************* Data Popup *************************/
function drawPopup(name, value) {
  var popup = d3.select("body").append("div")
      .attr("class", "popup")
      .style("width", document.body.clientWidth + "px")
      .style("height", document.body.clientHeight + "px")
    .on("click", function() {
      d3.selectAll(".popup").remove();
      d3.selectAll(".popupContents").remove();
    });

  var string = dataToPopup(name, value);
  d3.select("body").append("div")
      .html(string)
      .attr("class", "popupContents");
  var width = d3.select(".popupContents").style("width");
  var height = d3.select(".popupContents").style("height");
  var left = (document.body.clientWidth / 2) - (width.substring(0,width.length - 2) / 2);
  var top = (document.body.clientHeight / 2) - (height.substring(0,height.length - 2) / 2);
  d3.select(".popupContents")
      .style("left", left + "px")
      .style("top", top + "px")
    .on("click", function() {
      // If the object was too large to show in the table, show it as an
      // object that the user can explore in the console.
      console.log("Value of '" + name + "' is:", value);
    });
};

function dataToPopup(name, data) {
  var string = "";

  // Add a header
  string += "<h>Value of <span class=name>" + name + "</span><span class=data>: </span></h>";
  string += "<br>";

  if(typeof data === "object") string += toString(data);
  else string += JSON.stringify(data);

  return string;
};

function toString(data, indent) {
  if(!indent) indent = 1;
  var string = "";
  if(indent > timeline.indent) {
    string += "<span class=mouseChain>click popup to print to console...</span>";
  } else {
    // Show the contents
    string += "<span class=data>{</span>";
    string += "<br>";

    vg.util.keys(data).forEach(function(key) {
      string += "<span class=name>" + "&emsp;".repeat(indent) + key + "</span>";
      string += "<span class=data>: </span>";
      if(typeof data[key] === "object") string += toString(data[key],indent+1)
      else string += JSON.stringify(data[key]);
      string += "<br>";
    });

    string = string.substring(0, string.length - 4);
    string += "<br>";
    string += "<span class=data>" + "&emsp;".repeat(indent-1) + "}</span>";
  }
  return string;
};

/*************************** Helpers ***************************/

function drawDependencies(signalName, time) {
  var deps = model.dependencies[signalName];
  var other = Object.keys(model.streams).filter(function(name) {
    return deps.indexOf(name) === -1;
  });

  // Update the name column
  deps.forEach(function(name) {
    d3.select("#" + name + "-name")
        .html(name + " <span class='fa fa-chain'></span>");
  });
  other.forEach(function(name) {
    d3.select("#" + name + "-name")
        .html(name);
  });

  // Update the value cells
  var values = model.dependenciesOfSignalAtTime(signalName, time);
  deps.forEach(function(name) {
    d3.select("#" + name + "-signals").selectAll("rect")
        .style("stroke", function(d) {
          return (d == values[name]) ? debug.config.color.red : "white";
        })
        .style("stroke-width", function(d) {
          return (d == values[name]) ? "3px" : "0.5px";
        });
  });
  other.forEach(function(name) {
    d3.select("#" + name + "-signals").selectAll("rect")
        .style("stroke", "white")
        .style("stroke-width", "0.5px");
  });
};

function removeDependencies() {
  Object.keys(model.streams).forEach(function(name) {
    d3.select("#" + name + "-name")
        .html(name);
    d3.select("#" + name + "-signals").selectAll("rect")
        .style("stroke", "white")
        .style("stroke-width", "0.5px");
  });
};

function drawCursor() {
  var visible = model.pulses.filter(function(pulse) {
    if(!overview.brush || overview.brush.empty()) return true;
    var index = model.pulses.indexOf(pulse);
    return index >= overview.convert(overview.brush.extent()[0]) && 
           index < overview.convert(overview.brush.extent()[1])
  });

  var shift = (debug.currentMode === "replay") ? 0.5 : 1;
  var index = visible.indexOf(model.current.pulse);
  var xPos = (index + shift) * timeline.div.select("rect").attr("width");
  var offset = d3.select(".fixed-width").style("width").replace("px", "");

  var data = [{ "x": xPos, "y": 0},  
              { "x": xPos, "y": document.getElementById("timeline").clientHeight}];
  var lineFunction = d3.svg.line()
      .x(function(d) { return d.x; })
      .y(function(d) { return d.y; })
      .interpolate("linear");

  d3.select(".cursor").remove();

  // Set up the canvas for the cursor
  var svg = d3.select("#timeline").append("svg")
      .attr("class", "cursor")
      .style("width", document.getElementById("timeline").clientWidth)
      .style("height", document.getElementById("timeline").clientHeight)
      .style("left", offset)
      .style("top", function() {
        return document.getElementById("timeline").getBoundingClientRect().top;
      });

  svg.append("path")
      .attr("d", lineFunction(data))
      .attr("stroke", function() {
        if(debug.currentMode === "replay") return debug.config.color.green;
        return debug.config.color.red;
      })
      .attr("stroke-width", function() {
        return (debug.currentMode === "replay") ? 1 : 2;
      })
      .attr("fill", "none");
};
