var VL_SPECS = {
  "Showcase": [
    {
      "name": "bar_layered_transparent",
      "title": "Bar chart with transparent layers",
      "showInEditor": true
    },
    {
      "name": "stacked_bar_h",
      "title": "Horizontal Stacked Bar Chart"
    },
    {
      "name": "trellis_barley",
      "title": "Trellis Plot",
      "showInEditor": true
    }
  ],
  "Basic": [
    {
      "name": "bar",
      "title": "Simple Bar Chart",
      "showInEditor": true
    },
    {
      "name": "bar_filter_calc",
      "title": "Bar with filter and calculation",
      "showInEditor": true
    },
    {
      "name": "bar_aggregate",
      "title": "Aggregate Bar Chart",
      "showInEditor": true
    },
    {
      "name": "bar_grouped",
      "title": "Grouped bar chart.",
      "showInEditor": true
    },
    {
      "name": "bar_yearmonth",
      "title": "Temperature in Seattle",
      "showInEditor": true
    },
    {
      "name": "scatter",
      "title": "A scatterplot",
      "showInEditor": true
    },
    {
      "name": "scatter_binned_axes",
      "title": "Scatterplot with binned axes",
      "showInEditor": true
    },
    {
      "name": "scatter_binned_color",
      "title": "Scatterplot with binned color"
    },
    {
      "name": "scatter_binned_size",
      "title": "Bubble Scatterplot with binned size"
    },
    {
      "name": "scatter_bubble",
      "title": "Bubble Scatterplot",
      "showInEditor": true
    },
    {
      "name": "scatter_colored_with_shape",
      "title": "Scatterplot with shape and color encoding"
    },
    {
      "name": "scatter_log",
      "title": "Scatter plot with log scale and large numbers",
      "showInEditor": true
    },
    {
      "name": "tick",
      "title": "Tick marks",
      "showInEditor": true
    },
    {
      "name": "line",
      "title": "Line chart",
      "showInEditor": true
    },
    {
      "name": "line_color",
      "title": "Colored Line chart",
      "showInEditor": true
    },
    {
      "name": "line_month",
      "title": "Temperature in Seattle",
      "showInEditor": true
    },
    {
      "name": "histogram",
      "title": "Histogram",
      "showInEditor": true
    },
    {
      "name": "area",
      "title": "Area Chart",
      "showInEditor": true
    },
    {
      "name": "area_vertical",
      "title": "Vertical Area Chart"
    },
    {
      "name": "text_table_heatmap",
      "title": "Table Heatmap"
    }
  ],
  "Stack": [
    {
      "name": "stacked_area",
      "title": "Stacked Area Chart",
      "showInEditor": true
    },
    {
      "name": "stacked_bar_v",
      "title": "Vertical Stacked Bar Chart",
      "showInEditor": true
    },
    {
      "name": "stacked_bar_1d",
      "title": "1D Stacked Bar Chart"
    }
  ],
  "Trellis": [
    {
      "name": "trellis_bar",
      "title": "Population distribution of age groups and gender in 2000"
    },
    {
      "name": "trellis_stacked_bar",
      "title": "Trellis Stacked Bar Chart",
      "showInEditor": true
    },
    {
      "name": "trellis_scatter",
      "title": "Trellis Scatter Plot"
    },
    {
      "name": "trellis_scatter_binned_row",
      "title": "Trellis Scatter Plot, faceted by Binned Row"
    }
  ]
}
;

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
    {
      "name": "falkensee",
      "desc": "Based on an <a href='https://de.wikipedia.org/wiki/Datei:Bev%C3%B6lkerungsentwicklung_Falkensee.pdf'>image from Wikipedia</a>."
    },
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
