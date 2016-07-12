var datasets = {};

datasets.init = function(panel) {
  datasets.div = panel.append("div")
      .attr("class", "debug")
      .attr("id", "data")
    .on("mousewheel", function() {
      d3.selectAll(".dataTooltip").remove();
    });

  datasets.active = null;
  datasets.max = 10;
  datasets.minBarSize = 5;

  datasets.initTable();
};

datasets.reset = function(panel) {
  datasets.init(panel);
};

datasets.close = function(changed) {
  if(datasets.div) datasets.div.remove();
};

datasets.update = function(changed) {
  datasets.div.style("width", debug.width);
  if(changed) {
    drawTableCells();
    updateHistograms();
  }
  drawLines();
};

/********************** Data Processing ************************/

/************************ Create Table *************************/

datasets.initTable = function() {
  var div = datasets.div.append("div")
      .attr("id", "header");
  datasets.table = div.append("table");
  datasets.color = d3.scale.ordinal()
      .range(['#fec44f','#fe9929','#ec7014','#cc4c02','#993404','#662506']);

  extractData();
  initTableHeader();
  datasets.update(true);
};

function initTableHeader() {
  datasets.header = datasets.table.append("tr");
  Object.keys(model.data).forEach(function(dataName) {
    if(datasets.active == null) datasets.active = dataName;
    datasets.header.append("td")
        .attr("id", dataName + "-header")
        .attr("class", function() {
          return (dataName == datasets.active) ? "active" : "inactive";
        })
        .append("div").html(dataName)
        .on("click", function() {
          if(datasets.active == d3.select(this).html()) return;
          datasets.active = d3.select(this).html();
          switchTable();
        });
  });
};

function switchTable() {
  d3.select("#cells").remove();
  datasets.header.selectAll("td")
      .attr("class", function() {
        var id = d3.select(this).attr("id").replace("-header", "");
        return (id == datasets.active) ? "active" : "inactive";
      });
  datasets.update(true);
};

// Draw the table cells.
function drawTableCells() {
  var data = model.data[datasets.active];
  var table = datasets.div.select("#cells");
  if(!table[0][0]) table = datasets.div.append("table").attr("id", "cells");
  d3.selectAll(".dataRow").remove();
  if(data.values().length == 0 && !model.schema[datasets.active]) {
    datasetMore(data, table);
    return;
  }
  if(!model.schema[datasets.active]) {
    model.schema[datasets.active] = vg.util.keys(data.values()[0]);
  }

  datasetHeader(data, table);
  datasetCells(data, table);
};

function datasetHeader(data, table) {
  // Create the table header of data attributes
  var row = table.append("tr");
  if(d3.select("#histograms")[0][0]) return;
  var histograms = table.append("tr").attr("id", "histograms");
  model.schema[datasets.active].forEach(function(name) {
    row.append("td")
        .attr("class", "header")
        .style("color", datasets.color(name))
      .append("div").html(name)
      .on("click", function() { debug.findReferences(this.innerHTML); })
      .on("mouseover", function() { hideLines(this.innerHTML); })
      .on("mouseout", function() {
        d3.select("#overview").selectAll("path").style("opacity", 1);
        d3.select("#overview").selectAll("circle").style("opacity", 1);
      });

    histograms.append("td")
        .attr("class", "histogram")
        .attr("id", name + "Histogram");
  });
};

function datasetCells(data, table) {
  // Create a new row for each data element.
  d3.selectAll(".dataRow").remove();
  var index = 0;
  var values = data.values();
  var value;
  var max = Math.min(datasets.max, values.length)
  while(index < max) {
    value = values[index];
    index += 1;
    var row = table.append("tr").attr("class", "dataRow");
    model.schema[data.name()].forEach(function(property) {
      var cell = row.append("td")
          .attr("class", "cell")
        .on("click", function() { drawPopup(property, value[property]); })
        .on("mouseover", datasets.drawCellTooltip)
        .on("mouseout", function() { d3.selectAll(".dataTooltip").remove(); })
        .append("div")
          .html(function() {
            try { return JSON.stringify(value[property]); } 
            catch(err) { return "--"; }
          });
    });
  }
  datasetMore(data, table);
};

function datasetMore(data, table) {
  d3.select(".more").remove();
  var clickString =  (datasets.max <= data.values().length) ? ". Click for more." : ".";
  var moreString = "Showing <span class=name>" 
                 + Math.min(datasets.max, data.values().length) + "</span>"
                 + " of <span class=name>" 
                 + data.values().length + "</span>"
                 + clickString;

  var row = datasets.div.append("div")
      .html(moreString)
      .attr("class", "more")
  if(datasets.max >= data.values().length) return;
  row.on("click", function() {
      datasets.max *= 2;
      datasetCells(data, table);
    });
};

/************************** Histogram **************************/
function updateHistograms() {
  (model.schema[datasets.active] || []).forEach(function(dataName) {
    drawHistogram(dataName);
  });
};

function drawHistogram(dataName) {
  // Compute the spacing
  var svgWidth;
  if(!d3.select("#" + dataName + "Histogram").select("svg")[0][0]) {
    svgWidth = document.getElementById(dataName + "Histogram").getBoundingClientRect().width;
  } else {
    svgWidth = d3.select("#" + dataName + "Histogram").select("svg").attr("width");
  }

  var margin = {top: 2, right: 0, bottom: 0, left: 0}
      width = svgWidth - margin.left - margin.right,
      height = 50 - margin.top - margin.bottom;
  var numTicks = Math.floor(width / datasets.minBarSize);
  var barWidth = width / numTicks;

  // Get the array of values for the histogram
  var values = model.data[datasets.active].values().map(function(value) {
    return value[dataName];
  });

  // Compute the histogram layout
  var x, data, type;
  if(typeof values[0] === "number") {
    x = d3.scale.linear().domain(d3.extent(values)).range([0, width]);
    data = d3.layout.histogram().bins(numTicks)(values);
    type = "linear";
  } else {
    x = d3.scale.ordinal().domain(values);
    barWidth = width / x.domain().length;

    // Figure out the range
    var index = -1;
    var ordinalRange = x.domain().map(function(x) { return ++index*barWidth; });
    x.range(ordinalRange);
    var reverse = d3.scale.ordinal().domain(x.range()).range(x.domain());

    // Bin the data
    data = d3.layout.histogram().bins(x.domain().length)(values.map(x));
    type = "ordinal";
  }

  data.forEach(function(barValue) {
    barValue.scale = x;
    barValue.type = type;
    barValue.attribute = dataName;
    if(reverse) barValue.reverse = reverse;
  });
  
  if(data.length == 0) return;

  var y = d3.scale.linear()
      .domain([0, d3.max(data, function(d) { return d.y; })])
      .range([height, 0]);

  var svg = d3.select("#" + dataName + "Histogram").select("svg");
  if(svg[0][0]) {
    d3.select("#" + dataName + "Histogram").select("svg").remove();
  }
  var svg = d3.select("#" + dataName + "Histogram").append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
    .append("g")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  var bar = svg.selectAll(".bar")
      .data(data)
    .enter().append("g")
      .attr("class", "bar")
      .attr("transform", function(d) { 
        return "translate(" + x(d.x) + "," + y(d.y) + ")"; 
      });

  bar.append("rect")
      .attr("x", 0)
      .attr("width", barWidth)
      .attr("height", function(d) { return height - y(d.y); })
      .style("fill", debug.config.color.blueGray)
      .style("stroke", debug.config.color.lightGray)
      .style("stroke-width", "0.5px");
};

/*************************** Tooltip ***************************/
datasets.drawCellTooltip = function() {
  d3.selectAll(".dataTooltip").remove();
  var bounds = this.getBoundingClientRect();
  var value = d3.select(this).select("div").html();
  var valueCell = d3.select("body").append("div")
      .html(dataToString(value))
      .attr("class", "dataTooltip") 
      .style("left", bounds.left + 1 + "px")
      .style("top", bounds.top + 1 + "px")
      .style("min-width", bounds.width - 8 + "px");
};

/************************* Variability *************************/
function drawLines() {
  d3.select("#overview").selectAll("path").remove();
  d3.select("#overview").selectAll("circle").remove();
  if(!model.difference[datasets.active]) return;
  model.schema[datasets.active].forEach(function(property) {
    drawDifference(model.difference[datasets.active][property], property)
  });
};

function hideLines(property) {
  d3.select("#overview").selectAll("path")
      .style("opacity", function() {
        return ((property + "Difference") == this.id) ? 1 : 0;
      });
  d3.select("#overview").selectAll("circle")
      .style("opacity", function(d) {
        return ((property + "Point") == this.id) ? 1 : 0;
      });
};

datasets.removeLines = function() {
  d3.select("#overview").selectAll("path").remove();
  d3.select("#overview").selectAll("circle").remove();
};

function drawDifference(values, property) {
  var index = 0;
  var data = [];
  values.forEach(function(d) {
    data = data.concat({"diff": d, "index": index});
    index++;
  });

  var pageWidth = d3.select("#overview").select("svg").style("width").replace("px", "");
  var barWidth = d3.select("#overview").select("rect").attr("width") / 2;

  var x = d3.scale.linear()
    .domain(d3.extent(data, function(d) { return d.index; }))
    .range([barWidth, pageWidth - barWidth]);

  var y = d3.scale.linear()
    .domain(d3.extent(data, function(d) { return d.diff; }))
    .range([73, 5]);

  var line = d3.svg.line()
    .x(function(d) { return x(d.index); })
    .y(function(d) { return y(d.diff); });

  var svg = d3.select("#overview").select("svg");

  svg.append("path")
      .datum(data)
      .attr("class", "line")
      .attr("id", property + "Difference")
      .attr("d", line)
      .style("stroke", datasets.color(property));

  var point = data.filter(function(point) {
    return point.index == model.pulses.indexOf(model.current.pulse);
  });
  if(!model.current.pulse) return;
  point = point[0];

  svg.append("circle")
      .attr("id", property + "Point")
      .attr("cx", x(point.index))
      .attr("cy", y(point.diff))
      .attr("r", 3)
      .style("fill", datasets.color(property));
};

/********************** Helper Functions ***********************/
function dataToString(data) {
  var string = "";
  if(typeof data === "string") data = JSON.parse(data);
  if(typeof data === "object") {
    string += "<span class=data>{</span>";
    vg.util.keys(data).forEach(function(key) {
      string += "<span class=name>&emsp;" + key + "</span>";
      string += "<span class=data>: </span>"
      string += JSON.stringify(data[key]);
      string += "<br>"
    });

    string = string.substring(0, string.length - 4);
    string += "<span class=data>&emsp;}</span>";
  } else {
    string = JSON.stringify(data);
  }
  return string;
};
