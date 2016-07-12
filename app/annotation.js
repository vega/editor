var annotation = {};

annotation.init = function() {
  annotation.svg = null;
  ved.view.on("mousemove", function(event, item) {
    annotation.current = item;
  });

  annotation.offsetX = ved.view.padding().left;
  annotation.offsetY = ved.view.padding().top;

  // Set up the tooltip
  annotation.probe = d3.select("body").append("div")
      .attr("class", "probe")   
      .style("opacity", 0);
  d3.select(".marks")
    .on("mousemove", function() {
      if(debug.currentMode !== "replay") return;

      annotation.probe.transition()        
          .duration(100)      
          .style("opacity", .9);
      
      probe();
      annotation.probe
          .style("left", (d3.event.pageX + 10) + "px")     
          .style("top", (d3.event.pageY + 8) + "px");
    })                  
    .on("mouseout", function() {
      annotation.probe.transition()        
          .duration(500)      
          .style("opacity", 0);
    });
};

annotation.reset = function() {
  annotation.init();
};

annotation.close = function() {
  if(annotation.svg) annotation.svg.remove();
  annotation.svg = null;
  if(annotation.probe) annotation.probe.remove();
  annotation.probe = null;
}

annotation.overlay = function() {
  // Create svg canvas on which to draw the signals.
  if(debug.currentMode !== "replay" || annotation.svg) return;

  annotation.svg = d3.select(".vis .vega").append("svg")
      .attr("class", "overlay")
      .style("width", d3.select(".marks").style("width"))
      .style("height", d3.select(".marks").style("height"))
      .style("border", "1px solid #4F99FC");
};

/********************** Helper Functions ***********************/
function probe() {
  // Remove the old probe table.
  d3.select(".probe table").remove();
  drawProbeTooltip();
};

function drawProbeTooltip() {
  // Check if the visualization has a position scale
  var containsPosition = false;
  Object.keys(model.scaleTypes).forEach(function(key) {
    if(model.scaleTypes[key].type == "position") containsPosition = true;
  });

  containsPosition ? drawPosition() : drawPoint();
  drawProperties();
};

function drawPosition() {
  var table = d3.select(".probe").append("table");
  var context = model.context();
  
  // Table header
  var row = table.append("tr");
  row.append("th").append("div").html("data");
  row.append("th").append("div").html("scale");
  row.append("th").append("div").html("encoding");

  var x = d3.event.layerX - annotation.offsetX;
  var y = d3.event.layerY - annotation.offsetY;
  var relativeX = x - (context.x || 0);
  var relativeY = y - (context.y || 0);

  var resultX = scaleRow(table, context, "width", relativeX);
  var resultY = scaleRow(table, context, "height", relativeY);
  if(!resultX && !resultY) drawEmpty();
};

function scaleRow(table, context, type, value) {
  var group = context.mark.name || context.mark.marktype || "";
  if(group == "group") group = "";
  var round = function(value) { return Math.round(value*100) / 100; };
  var containsScale = true;
  var row = table.append("tr");

  var pos = model.scale("position", type, group);
  var gpos = model.scale("group", type, group);
  var pscale = pos ? context.scale(pos.name) : null;
  var gscale = gpos ? context.scale(gpos.name) : null;
  if(pscale) {
    // Determine the direction of the scale.
    var invert = pos.data == "domain" ? false : true;
    row.append("td").append("div").html(function() {
      var result = pscale.invert(value);
      if(typeof result === "number") result = round(result);
      if(result instanceof Date) result = result.toDateString();
      return result;
    });
    row.append("td").append("div").html(arrow(pos.name, invert));
    row.append("td").append("div").html(round(value));
  } else if(gscale) {
    // Determine the direction of the scale.
    var invert = gpos.data == "domain" ? false : true;
    row.append("td").append("div").html(function() {
      var result = gscale.invert(value);
      if(typeof result === "number") result = round(result);
      if(result instanceof Date) result = result.toDateString();
      return result;
    });
    row.append("td").append("div").html(arrow(gpos.name, invert));
    row.append("td").append("div").html(round(value));
  } else {
    containsScale = false;
  }
  return containsScale;
};

function drawEmpty() {
  d3.select(".probe table").remove();
  var table = d3.select(".probe").append("table");
  row = table.append("tr");
  row.append("td").append("div").html("");
  row.append("th").append("div").html("No backing data");
  row.append("td").append("div").html("");
};

function drawPoint() {
  var table = d3.select(".probe").append("table");
  var round = function(value) { return Math.round(value*100) / 100; };

  // Table header
  var row = table.append("tr");
  row.append("th").append("div").html("x");
  row.append("th").append("div").html("y");

  var x = d3.event.layerX - annotation.offsetX;
  var y = d3.event.layerY - annotation.offsetY;

  // Show the pixel value
  row = table.append("tr");
  var prefix = "<span style='color:" + debug.config.color.blueGray + "'>(</span>";
  var middle = "<span style='color:" + debug.config.color.blueGray + "'>,</span>";
  var suffix = "<span style='color:" + debug.config.color.blueGray + "'>)</span>";
  row.append("td").append("div").html(prefix + round(x) + middle);
  row.append("td").append("div").html(round(y) + suffix);
};

function drawProperties() {
  if(!annotation.current) return;
  var table = d3.select(".probe").select("table");
  var key = annotation.current.mark.name || annotation.current.mark.marktype;
  var properties = model.marks[key] || {};
  (Object.keys(properties) || []).forEach(function(property) {
    var row = table.append("tr").attr("id", "property");
    var context = model.context();
    var scale = context.scale(properties[property].scale);
    if(scale) {
      var value = annotation.current[property];
      if(["fill"].indexOf(property) >= 0) {
        value = "<span style='color:" + value + "'>" + value + "</span>";
      }
      row.append("td").append("div").html(annotation.current.datum[properties[property].field]);
      row.append("td").append("div").html(arrow(properties[property].scale, false));
      row.append("td").append("div").html(value);
    }
  });
};

function arrow(scaleName, invert) {
  var arrow = "<span style='color:" + debug.config.color.blueGray + "'>&#x2550;&#x2550;</span>"
            + "<span style='color:" + debug.config.color.green + "'>&#x00A0;" 
            + scaleName
            + (invert ? "<sup>-1</sup>" : "")
            + "&#x00A0;</span>"
            + "<span style='color:" + debug.config.color.blueGray + "'>&#10233;</span>";
  return arrow;
};
