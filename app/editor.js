var ved = {
  version: 1.0,
  data: undefined,
  renderType: 'canvas',
  editor: null
};

ved.params = function() {
  return location.search.slice(1)
    .split('&')
    .map(function(x) { return x.split('='); })
    .reduce(function(a, b) {
      a[b[0]] = b[1]; return a;
    }, {});
};

ved.select = function() {
  var sel  = ved.$d3.select('.sel_spec').node(),
      desc = ved.$d3.select('.spec_desc'),
      idx  = sel.selectedIndex,
      spec = d3.select(sel.options[idx]).data()[0];

  if (idx > 0) {
    d3.xhr(spec.uri, function(error, response) {
      ved.editor.setValue(response.responseText);
      ved.editor.gotoLine(0);
      ved.parse();
      desc.html(spec.desc || '');
    });
  } else {
    ved.editor.setValue('');
    ved.editor.gotoLine(0);
    desc.html('');
  }
};

ved.renderer = function() {
  var sel = ved.$d3.select('.sel_render').node(),
      idx = sel.selectedIndex,
      ren = sel.options[idx].value;

  ved.renderType = ren;
  ved.parse();
};

ved.format = function(event) {
  var el = ved.$d3.select('.spec'),
      spec = JSON.parse(el.property('value')),
      text = JSON.stringify(spec, null, 2);
  el.property('value', text);
};

ved.parse = function() {
  var spec, source;
  try {
    spec = JSON.parse(ved.editor.getValue());
  } catch (e) {
    console.log(e);
    return;
  }

  ved.spec = spec;
  if (ved.view) ved.view.destroy();
  vg.parse.spec(spec, function(chart) {
    var vis = ved.$d3.select('.vis').selectAll('*').remove();
    var view = chart({
      el: '.vis', // vis.node()
      data: ved.data,
      renderer: ved.renderType
    });
    (ved.view = view).update();
  });
};

ved.resize = function(event) {
  ved.editor.resize();
};

ved.init = function(el, dir) {
  // Set base directory
  var PATH = dir || 'app/';
  vg.config.load.baseURL = ved.path =PATH;

  function specPath(d) { return (d.uri = PATH+'spec/'+d.name+'.json', d); }

  el = (ved.$d3 = d3.select(el));

  d3.text(PATH + 'template.html', function(err, text) {
    el.html(text);

    // Specification drop-down menu               
    var sel = el.select('.sel_spec');
    sel.on('change', ved.select);
    sel.append('option').text('Custom');

    var st = sel.append('optgroup')
      .attr('label', 'Static');

    st.selectAll('option.spec')
      .data(STATIC_SPECS.map(specPath))
     .enter().append('option')
      .text(function(d) { return d.name; });

    var interactive = sel.append('optgroup')
      .attr('label', 'Interactive');

    interactive.selectAll('option.spec')
      .data(INTERACTIVE_SPECS.map(specPath))
     .enter().append('option')
      .text(function(d) { return d.name; });

    // Renderer drop-down menu
    var ren = el.select('.sel_render');
    ren.on('change', ved.renderer)
    ren.selectAll('option')
      .data(['Canvas', 'SVG'])
     .enter().append('option')
      .attr('value', function(d) { return d.toLowerCase(); })
      .text(function(d) { return d; });

    // Code Editor
    var editor = ved.editor = ace.edit(ved.$d3.select('.spec').node());
    editor.getSession().setMode('ace/mode/json');
    editor.getSession().setTabSize(2);
    editor.getSession().setUseSoftTabs(true);
    editor.setShowPrintMargin(false);
    editor.on('focus', function() {
      editor.setHighlightActiveLine(true);
      d3.selectAll('.ace_gutter-active-line').style('background', '#DCDCDC');
      d3.selectAll('.ace-tm .ace_cursor').style('visibility', 'visible');
    });
    editor.on('blur', function() {
      editor.setHighlightActiveLine(false);
      d3.selectAll('.ace_gutter-active-line').style('background', 'transparent');
      d3.selectAll('.ace-tm .ace_cursor').style('visibility', 'hidden');
      editor.clearSelection();
    });
    editor.$blockScrolling = Infinity;

    // Initialize application
    el.select('.btn_spec_format').on('click', ved.format);
    el.select('.btn_spec_parse').on('click', ved.parse);
    d3.select(window).on('resize', ved.resize);
    ved.resize();
  
    // Handle application parameters
    var p = ved.params();
    if (p.spec) {
      var idx = STATIC_SPECS.concat(INTERACTIVE_SPECS).indexOf(p.spec) + 1;
      if (idx > 0) {
        sel.node().selectedIndex = idx;
        ved.select();
      }
    }

    if (p.renderer) {
      var ren = el.select('sel_render').node();
      ren.selectedIndex = p.renderer.toLowerCase() === 'svg' ? 1 : 0;
      ved.renderer();
    }
  });
};
