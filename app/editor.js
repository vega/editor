'use strict';

/*global location, window, d3, vl, vg, localStorage, document,
alert, console, VG_SPECS, VL_SPECS, ace, JSON3*/

var ved = {
  version: '1.2.0',
  data: undefined,
  renderType: 'canvas',
  vgEditor: null,
  vlEditor: null,
  currentMode: null,
  vgHidden: true  // vega editor hidden in vl mode
};

ved.params = function() {
  var query = location.search.slice(1);
  if (query.slice(-1) === '/') query = query.slice(0,-1);
  return query
    .split('&')
    .map(function(x) { return x.split('='); })
    .reduce(function(a, b) {
      a[b[0]] = b[1]; return a;
    }, {});
};

ved.mode = function() {
  var $d3  = ved.$d3,
      sel = $d3.select('.sel_mode').node(),
      vge = $d3.select('.vega-editor'),
      ace = $d3.select('.vg-spec .ace_content'),
      idx = sel.selectedIndex,
      newMode = sel.options[idx].value,
      spec;

  if (ved.currentMode === newMode) return;
  ved.currentMode = newMode;

  if (ved.currentMode === 'vega') {
    ved.vgEditor.setOptions({
      readOnly: false,
      highlightActiveLine: true,
      highlightGutterLine: true
    });

    vge.attr('class', 'vega-editor vega');
    ace.attr('class', 'ace_content');
    spec = $d3.select('.sel_vg_spec');
  } else if (ved.currentMode === 'vega-lite') {
    ved.vgEditor.setOptions({
      readOnly: true,
      highlightActiveLine: false,
      highlightGutterLine: false
    });

    vge.attr('class', 'vega-editor vega-lite');
    ace.attr('class', 'ace_content disabled');
    spec = $d3.select('.sel_vl_spec');
  } else {
    throw new Error('Unknown mode ' + ved.currentMode);
  }

  ved.editorVisibility();
  spec.node().selectedIndex = 0;
  ved.select('');
};

ved.switchToVega = function() {
  var sel = ved.$d3.select('.sel_mode').node(),
      spec = ved.vgEditor.getValue();
  sel.selectedIndex = 0;
  ved.mode();
  ved.select(spec);
};

// Changes visibility of vega editor in vl mode
ved.editorVisibility = function() {
  var $d3 = ved.$d3,
      vgs = $d3.select('.vg-spec'),
      vls = $d3.select('.vl-spec'),
      toggle = $d3.select('.click_toggle_vega');

  if (ved.vgHidden && ved.currentMode === 'vega-lite') {
    vgs.style('display', 'none');
    vls.style('flex', '1 1 auto');
    toggle.attr('class', 'click_toggle_vega up');
  } else {
    vgs.style('display', 'block');
    ved.resizeVlEditor();
    toggle.attr('class', 'click_toggle_vega down');
  }
  ved.resize();
};

ved.select = function(spec) {
  var $d3 = ved.$d3,
      mode = ved.currentMode,
      desc = $d3.select('.spec_desc'),
      editor, parse, sel;

  if (mode === 'vega') {
    editor = ved.vgEditor;
    parse  = ved.parseVg;
    sel = $d3.select('.sel_vg_spec').node();
  } else if (mode === 'vega-lite') {
    editor = ved.vlEditor;
    parse  = ved.parseVl;
    sel = $d3.select('.sel_vl_spec').node();
  }

  if (spec) {
    editor.setValue(spec);
    editor.gotoLine(0);
    desc.html('');
    parse();
    ved.resizeVlEditor();
    return;
  }

  var idx = sel.selectedIndex;
  spec = d3.select(sel.options[idx]).datum();

  if (idx > 0) {
    d3.xhr(ved.uri(spec), function(error, response) {
      editor.setValue(response.responseText);
      editor.gotoLine(0);
      parse(function() { desc.html(spec.desc || ''); });
    });
  } else {
    editor.setValue('');
    editor.gotoLine(0);
    ved.vgEditor.setValue('');
    ved.resetView();
  }

  if (mode === 'vega') {
    ved.resize();
  } else if (mode === 'vl') {
    ved.resizeVlEditor();
  }
};

ved.uri = function(entry) {
  return ved.path + '/spec/' + ved.currentMode +
    '/' + entry.name + '.json';
};

ved.renderer = function() {
  var sel = ved.$d3.select('.sel_render').node(),
      idx = sel.selectedIndex,
      ren = sel.options[idx].value;

  ved.renderType = ren;
  ved.parseVg();
};

ved.format = function() {
  [ved.vlEditor, ved.vgEditor].forEach(function(editor) {
    var text = editor.getValue();
    if (text.length) {
      var spec = JSON.parse(text);
      text = JSON3.stringify(spec, null, 2, 60);
      editor.setValue(text);
      editor.gotoLine(0);
    }
  });
};

ved.parseVl = function(callback) {
  var spec, source,
    value = ved.vlEditor.getValue();

  // delete cookie if editor is empty
  if (!value) {
    localStorage.removeItem('vlspec');
  }

  try {
    spec = JSON.parse(value);
  } catch (e) {
    console.log(e);
    return;
  }

  var vlSel = ved.$d3.select('.sel_vl_spec');
  if (vlSel.node().selectedIndex === 0) {
    localStorage.setItem('vlspec', value);
  }

  var haveStats = function(stats) {
    var vgSpec = vl.compile(spec, stats);
    var text = JSON3.stringify(vgSpec, null, 2, 60);
    ved.vgEditor.setValue(text);
    ved.vgEditor.gotoLine(0);

    // change select for vega to Custom
    var vgSel = ved.$d3.select('.sel_vg_spec');
    vgSel.node().selectedIndex = 0;

    ved.parseVg(callback);
  };

  // compute dataset stats only if the spec does not have embedded data
  if (spec.data.values === undefined) {
    d3[spec.data.formatType || 'json'](ved.path + spec.data.url, function(err, data) {
      if (err) return alert('Error loading data ' + err.statusText);
      haveStats(vl.data.stats(data));
    });
  } else {
    haveStats(null);
  }
};

ved.parseVg = function(callback) {
  var opt, source,
    value = ved.vgEditor.getValue();

  // delete cookie if editor is empty
  if (!value) {
    localStorage.removeItem('vgspec');
  }

  try {
    opt = JSON.parse(ved.vgEditor.getValue());
  } catch (e) {
    console.log(e);
    return;
  }

  var vgSel = ved.$d3.select('.sel_vg_spec');
  if (vgSel.node().selectedIndex === 0 && ved.currentMode === 'vega') {
    localStorage.setItem('vgspec', value);
  }

  if (!opt.spec && !opt.url && !opt.source) {
    // wrap spec for handoff to vega-embed
    opt = {spec: opt};
  }
  opt.actions = false;
  opt.renderer = opt.renderer || ved.renderType;
  opt.parameter_el = '.mod_params';

  ved.resetView();
  var a = vg.embed('.vis', opt, function(view, spec) {
    ved.spec = spec;
    ved.view = view;
    if (callback) callback(view);
  });
};

ved.resetView = function() {
  var $d3 = ved.$d3;
  if (ved.view) ved.view.destroy();
  $d3.select('.mod_params').html('');
  $d3.select('.spec_desc').html('');
  $d3.select('.vis').html('');
};

ved.resize = function(event) {
  ved.vgEditor.resize();
  ved.vlEditor.resize();
};

ved.resizeVlEditor = function() {
  if (ved.vgHidden || ved.currentMode !== 'vega-lite')
    return;

  var height = ved.vlEditor.getSession().getDocument().getLength() *
  ved.vlEditor.renderer.lineHeight + ved.vlEditor.renderer.scrollBar.getWidth();

  if (height > 600) {
    return;
  } else if (height < 200) {
    height = 200;
  }

  ved.$d3.select('.vl-spec')
    .style('height', height + 'px')
    .style('flex', 'none');
  ved.resize();
};

ved.setPermanentUrl = function() {
  var params = [];
  params.push('mode=' + ved.currentMode);

  var sel;
  if (ved.currentMode === 'vega') {
    sel = ved.$d3.select('.sel_vg_spec').node();
  } else {
    sel = ved.$d3.select('.sel_vl_spec').node();
  }
  var idx = sel.selectedIndex,
    spec = d3.select(sel.options[idx]).datum();

  if (spec) {
    params.push('spec=' + spec.name);
  }

  if (!ved.vgHidden && ved.currentMode === 'vega-lite') {
    params.push('showEditor=1');
  }

  if (ved.$d3.select('.sel_render').node().selectedIndex === 1) {
    params.push('renderer=svg');
  }

  var path = location.protocol + '//' + location.host + location.pathname;
  var url = path + '?' + params.join('&');

  window.history.replaceState("", document.title, url);
};

ved.export = function() {
  var ext = ved.renderType === 'canvas' ? 'png' : 'svg',
      url = ved.view.toImageURL(ext);

  var el = d3.select(document.createElement('a'))
    .attr('href', url)
    .attr('target', '_blank')
    .attr('download', (ved.spec.name || 'vega') + '.' + ext)
    .node();

  var evt = document.createEvent('MouseEvents');
  evt.initMouseEvent('click', true, true, document.defaultView, 1, 0, 0, 0, 0,
    false, false, false, false, 0, null);
  el.dispatchEvent(evt);
};

ved.setUrlAfter = function(func) {
  return function() {
    func();
    ved.setPermanentUrl();
  };
};

ved.goCustom = function(func) {
  return function() {
    var sel;
    if (ved.currentMode === 'vega') {
      sel = ved.$d3.select('.sel_vg_spec');
    } else if (ved.currentMode === 'vega-lite') {
      sel = ved.$d3.select('.sel_vl_spec');
    }
    sel.node().selectedIndex = 0;
    func();
  };
};

ved.init = function(el, dir) {
  // Set base directory
  var PATH = dir || 'app/';
  vg.config.load.baseURL = PATH;
  ved.path = PATH;

  el = (ved.$d3 = d3.select(el));

  d3.text(PATH + 'template.html', function(err, text) {
    el.html(text);

    // Vega specification drop-down menu
    var vgSel = el.select('.sel_vg_spec');
    vgSel.on('change', ved.setUrlAfter(ved.select));
    vgSel.append('option').text('Custom');
    vgSel.selectAll('optgroup')
      .data(Object.keys(VG_SPECS))
     .enter().append('optgroup')
      .attr('label', function(key) { return key; })
     .selectAll('option.spec')
      .data(function(key) { return VG_SPECS[key]; })
     .enter().append('option')
      .text(function(d) { return d.name; });

    // Vega-lite specification drop-down menu
    var vlSel = el.select('.sel_vl_spec');
    vlSel.on('change', ved.setUrlAfter(ved.select));
    vlSel.append('option').text('Custom');
    vlSel.selectAll('optgroup')
      .data(Object.keys(VL_SPECS))
     .enter().append('optgroup')
      .attr('label', function(key) { return key; })
     .selectAll('option.spec')
      .data(function(key) { return VL_SPECS[key]; })
     .enter().append('option')
      .text(function(d) { return d.name; });

    // Renderer drop-down menu
    var ren = el.select('.sel_render');
    ren.on('change', ved.setUrlAfter(ved.renderer));
    ren.selectAll('option')
      .data(['Canvas', 'SVG'])
     .enter().append('option')
      .attr('value', function(d) { return d.toLowerCase(); })
      .text(function(d) { return d; });

    // Vega or Vega-lite mode
    var mode = el.select('.sel_mode');
    mode.on('change', ved.setUrlAfter(ved.mode));

    // Code Editors
    var vlEditor = ved.vlEditor = ace.edit(el.select('.vl-spec').node());
    var vgEditor = ved.vgEditor = ace.edit(el.select('.vg-spec').node());

    [vlEditor, vgEditor].forEach(function(editor) {
      editor.getSession().setMode('ace/mode/json');
      editor.getSession().setTabSize(2);
      editor.getSession().setUseSoftTabs(true);
      editor.setShowPrintMargin(false);
      editor.on('focus', function() {
        d3.selectAll('.ace_gutter-active-line').style('background', '#DCDCDC');
        d3.selectAll('.ace-tm .ace_cursor').style('visibility', 'visible');
      });
      editor.on('blur', function() {
        d3.selectAll('.ace_gutter-active-line').style('background', 'transparent');
        d3.selectAll('.ace-tm .ace_cursor').style('visibility', 'hidden');
        editor.clearSelection();
      });
      editor.$blockScrolling = Infinity;
      d3.select(editor.textInput.getElement())
        .on('keydown', ved.goCustom(ved.setPermanentUrl));

      editor.setValue('');
      editor.gotoLine(0);
    });

    // adjust height of vl editor based on content
    vlEditor.on('input', ved.resizeVlEditor);
    ved.resizeVlEditor();

    // Initialize application
    el.select('.btn_spec_format').on('click', ved.format);
    el.select('.btn_vg_parse').on('click', ved.setUrlAfter(ved.parseVg));
    el.select('.btn_vl_parse').on('click',ved.setUrlAfter(ved.parseVl));
    el.select('.btn_to_vega').on('click', ved.setUrlAfter(function() {
      d3.event.preventDefault();
      ved.switchToVega();
    }));
    el.select('.btn_export').on('click', ved.export);
    el.select('.vg_pane').on('click', ved.setUrlAfter(function() {
      ved.vgHidden = !ved.vgHidden;
      ved.editorVisibility();
    }));
    d3.select(window).on('resize', ved.resize);
    ved.resize();

    var getIndexes = function(obj) {
      return Object.keys(obj).reduce(function(a, k) {
        return a.concat(obj[k].map(function(d) { return d.name; }));
      }, []);
    };

    ved.vgSpecs = getIndexes(VG_SPECS);
    ved.vlSpecs = getIndexes(VL_SPECS);

    // Handle application parameters
    var p = ved.params();
    if (p.renderer) {
      ren.node().selectedIndex = p.renderer.toLowerCase() === 'svg' ? 1 : 0;
      ved.renderType = p.renderer;
    }

    if (p.mode) {
      mode.node().selectedIndex = p.mode.toLowerCase() === 'vega-lite' ? 1 : 0;
    }
    ved.mode();

    if (ved.currentMode === 'vega-lite') {
      if (p.showEditor) {
        ved.vgHidden = false;
        ved.editorVisibility();
      }
    }

    if (p.spec) {
      var spec = decodeURIComponent(p.spec),
          isVl = ved.currentMode === 'vega-lite',
          specs = isVl ? ved.vlSpecs : ved.vgSpecs,
          idx = specs.indexOf(spec) + 1,
          sel = isVl ? vlSel : vgSel;

      if (idx > 0) {
        sel.node().selectedIndex = idx;
        ved.select();
      } else {
        try {
          var json = JSON.parse(decodeURIComponent(spec));
          ved.select(spec);
          ved.format();
        } catch (err) {
          console.error(err);
          console.error('Specification loading failed: ' + spec);
        }
      }
    }

    // Load content from cookies
    if (ved.currentMode === 'vega-lite' && localStorage.getItem('vlspec') && !p.spec) {
      ved.select(localStorage.getItem('vlspec'));
    } else if (ved.currentMode === 'vega' && localStorage.getItem('vgspec') && !p.spec) {
      ved.select(localStorage.getItem('vgspec'));
    }

    // Handle post messages
    window.addEventListener('message', function(evt) {
      var data = evt.data;
      console.log('[Vega-Editor] Received Message', evt.origin, data);

      // send acknowledgement
      if (data.spec || data.file) {
        evt.source.postMessage(true, '*');
      }

      // set vg or vl mode
      if (data.mode) {
        mode.node().selectedIndex =
          data.mode.toLowerCase() === 'vega-lite' ? 1 : 0;
        ved.mode();
      }

      // load spec
      if (data.spec) {
        ved.select(data.spec);
      } else if (data.file) {
        var isVl = ved.currentMode === 'vega-lite',
          specs = isVl ? ved.vlSpecs : ved.vgSpecs,
          sel = isVl ? vlSel : vgSel;
        sel.node().selectedIndex = specs.indexOf(data.file) + 1;
        ved.select();
      }
    }, false);
  });
};
