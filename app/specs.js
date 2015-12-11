var VL_SPECS = {
  'Basic': [
    {
      "name": "area",
      "title": "Area Chart"
    },
    {
      "name": "bar",
      "title": "Simple Bar Chart"
    },
    {
      "name": "bar_aggregate",
      "title": "Aggregate Bar Chart"
    },
    {
      "name": "bar_filter_calc",
      "title": "Bar with filter and calculation"
    },
    {
      "name": "bar_grouped",
      "title": "Grouped bar chart."
    },
    {
      "name": "bar_log",
      "title": "Bar chart with log scale and large numbers",
    },
    {
      "name": "histogram",
      "title": "Histogram"
    },
    {
      "name": "line",
      "title": "Line chart"
    },
    {
      "name": "line_month",
      "title": "Line showing pattern between months"
    },
    {
      "name": "scatter",
      "title": "A scatterplot"
    },
    // TODO: colored & shape scatter,
    // TOOD: bubble scatter,
    {
      "name": "scatter_binned",
      "title": "Binned Scatterplot"
    },
    {
      "name": "tick",
      "title": "Tick marks"
    },

    // Hide until we finalize heatmap
    // {
    //   "name": "tableheatmap",
    //   "title": "Table Heatmap."
    // }
  ],
  'stack': [
    {
      "name": "stacked_area",
      "title": "Stacked Area Chart"
    },
    {
      "name": "stacked_bar_h",
      "title": "Horizontal Stacked Bar Chart"
    },
    {
      "name": "stacked_bar_v",
      "title": "Vertical Stacked Bar Chart"
    },
    {
      "name": "stacked_bar_1d",
      "title": '1D Stacked Bar Chart'
    }
  ],
  'Trellis': [
    {
      "name": "trellis_barley",
      "title": "Trellis Plot"
    },
    {
      "name": "trellis_area",
      "title": 'Trellis Area chart'
    },
    {
      "name": "trellis_stacked_bar", "title": 'Trellis Stacked Bar Chart'
    },
    {"name": "trellis_scatter"}
  ]
};

var VG_SPECS = {
  'Static': [
    { "name": "arc" },
    { "name": "area" },
    { "name": "bar" },
    {
      "name": "barley",
      "desc": "Based on the <a href='http://www.jstor.org/pss/1390777'>Trellis Display</a> by Becker et al."
    },
    { "name": "choropleth" },
    {
      "name": "driving",
      "desc": "Based on <a href='http://www.nytimes.com/imagepages/2010/05/02/business/02metrics.html'>Driving Shifts Into Reverse</a> by Hannah Fairfield. <em>The New York Times</em> (May 2, 2010)."
    },
    { "name": "error" },
    { "name": "force" },
    { "name": "grouped_bar" },
    { "name": "heatmap" },
    { "name": "image" },
    { "name": "jobs" },
    { "name": "lifelines" },
    { "name": "map" },
    { "name": "parallel_coords" },
    { "name": "playfair" },
    { "name": "population" },
    { "name": "treemap" },
    { "name": "scatter_matrix" },
    { "name": "stacked_area" },
    { "name": "stacked_bar" },
    { "name": "stocks" },
    { "name": "weather" },
    { "name": "wordcloud" }
  ],
  'Interactive': [
    {
      "name": "airports",
      "desc": "Based on <a href='https://mbostock.github.io/d3/talk/20111116/airports.html'>U.S. Airports, 2008</a> by Mike Bostock."
    },
    { "name": "brush" },
    {
      "name": "budget_forecasts",
      "desc": "Based on <a href='http://www.nytimes.com/interactive/2010/02/02/us/politics/20100201-budget-porcupine-graphic.html'>Budget Forecasts, Compared With Reality</a> by Amanda Cox. <em>The New York Times</em> (February 2, 2010)."
    },
    {
      "name": "crossfilter",
      "desc": "Based on <a href='http://square.github.io/crossfilter/'>Crossfilter.js</a> by Mike Bostock. <em>Square Inc</em>."
    },
    {
      "name": "dimpvis",
      "desc": "Based on <a href='http://vialab.science.uoit.ca/portfolio/dimpvis'>DimpVis</a> by Brittany Kondo and Christopher Collins. <em>University of Ontario Institute of Technology</em> (2014)."
    },
    { "name": "horizon",
      "desc": "<a href='http://idl.cs.washington.edu/papers/horizon/'>Horizon graph</a> example. Click to change the number of layers."
    },
    { "name": "index_chart" },
    {
      "name": "force_drag",
      "desc": "Drag nodes to reposition them. Double-click nodes to fix them in place."
    },
    { "name": "linking" },
    {
      "name": "overview+detail",
      "desc": "Based on <a href='http://bl.ocks.org/mbostock/1667367'>Focus+Context with Brushing</a> by Mike Bostock."
    },
    { "name": "panzoom_points" },
    { "name": "reorder_matrix" },
    { "name": "shiftclick_select" },
    { "name": "tooltip" }
  ],
  'Parameterized': [
    {
      "name": "airports-params",
      "desc": "Uses <a href='http://github.com/vega/vega-embed'>vega-embed</a> to parameterize the visualization."
    },
    {
      "name": "force-params",
      "desc": "Uses <a href='http://github.com/vega/vega-embed'>vega-embed</a> to parameterize the visualization."
    },
    {
      "name": "jobs-params",
      "desc": "Uses <a href='http://github.com/vega/vega-embed'>vega-embed</a> to parameterize the visualization."
    },
    {
      "name": "map-params",
      "desc": "Uses <a href='http://github.com/vega/vega-embed'>vega-embed</a> to parameterize the visualization."
    }
  ]
};
