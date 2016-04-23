var overview = {};

overview.init = function() {
  overview.svg = d3.select("#overview").append("svg");
  overview.g = overview.svg.append("g");
  overview.brush = null;
};

overview.reset = function() {
  overview.init();
};

overview.close = function() {
  if(overview.svg) overview.svg.remove();
};

overview.update = function(counts, streams) {
  var width = document.getElementById("overview").clientWidth * 0.6;

  if(!overview.brush) initBrush();
  updateBrush();

  // Convert count object to list.
  var data = [];
  Object.keys(counts).forEach(function(key) {
    data.push({"pulse": key, "count": counts[key]});
  });

  var pulseIndexToPixel = d3.scale.linear()
      .domain([0, data.length])
      .range([0, width]);

  var index = function(value) {
    var result = data.filter(function(d) { return d.pulse === value; })[0];
    return data.indexOf(result);
  };

  var height = d3.scale.linear()
      .domain([0, Object.keys(streams).length]) 
      .range([0, 75]);

  // Draw summary rects
  var rects = overview.g.selectAll("rect").data(data);
  rects.enter().append("rect")
      .style("stroke", debug.config.color.lightGray)
      .style("stroke-width", "0.5px");
  rects.attr("width", width / data.length)
      .attr("height", function(d) { return height(d.count); })
      .attr("x", function(d) { return pulseIndexToPixel(index(d.pulse)); })
      .attr("y", function(d) { return 75 - height(d.count); })
      .style("fill", function(d) {
        if(model.current.pulse == d.pulse) return debug.config.color.green;
        return debug.config.color.blueGray;
      })
      .style("opacity", function(d) {
        if(model.current.pulse == d.pulse) return 1;
        return 0.5;
      });
};

/*************************** Helpers ***************************/
function initBrush() {
  // Create the brush on the overview
  var width = document.getElementById("overview").clientWidth * 0.6;
  var x = d3.scale.linear().range([0, width]);
  overview.brush = d3.svg.brush().x(x).on("brush", brushed);
  overview.svg.append("g").attr("class", "brush").call(overview.brush);

  var count = model.pulses.length;
  overview.convert = d3.scale.linear().domain([0, 1]).range([0, count]);
};

function updateBrush() {
  var e = overview.brush.extent();
  var old = [Math.round(overview.convert(e[0])), Math.round(overview.convert(e[1]))];

  // Update the conversion
  var count = model.pulses.length;
  overview.convert = d3.scale.linear().domain([0, 1]).range([0, count]);

  // Update the brush
  overview.brush.extent([overview.convert.invert(old[0]), overview.convert.invert(old[1])]);
  overview.brush(d3.select(".brush"));
};

overview.scrollBrush = function(dx) {
  var e = overview.brush.extent();
  if((dx > 0 && e[0] === 0) || (dx < 0 && e[1] === 1)) return;
  var old = [Math.round(overview.convert(e[0])), Math.round(overview.convert(e[1]))];
  var min = Math.max(overview.convert.invert(old[0] - dx), 0);
  var max = Math.min(overview.convert.invert(old[1] - dx), 1);
  overview.brush.extent([min, max]);
  overview.brush(d3.select(".brush"));
  brushed();
};

function brushed() {
  var e = overview.brush.extent();
  var old = [Math.round(overview.convert(e[0])), Math.round(overview.convert(e[1]))];
  overview.brush.extent([overview.convert.invert(old[0]), overview.convert.invert(old[1])]);
  overview.brush(d3.select(".brush"));

  debug.update();
};