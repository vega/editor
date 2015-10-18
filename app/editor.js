var ved = {
  version: '1.2.1',
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
  var sel = ved.$d3.select('.sel_mode').node(),
      idx = sel.selectedIndex,
      newMode = sel.options[idx].value;

  if (ved.currentMode === newMode)
    return;
  ved.currentMode = newMode;

  if (ved.currentMode === 'vega') {
    ved.vgEditor.setOptions({
      readOnly: false,
      highlightActiveLine: true,
      highlightGutterLine: true
    });
    ved.$d3.select('.vega-editor').attr('class', 'vega-editor vega');
    ved.$d3.select('.vg-spec .ace_content').attr('class', 'ace_content');
  } else if (ved.currentMode === 'vega-lite') {
    ved.vgEditor.setOptions({
      readOnly: true,
      highlightActiveLine: false,
      highlightGutterLine: false
    });

    ved.$d3.select('.vg-spec .ace_content').attr('class', 'ace_content disabled');
    ved.$d3.select('.vega-editor').attr('class', 'vega-editor vega-lite');

    if (ved.vlEditor.getValue().length > 0) {
      ved.parseVl();
    } else {
      ved.resetView();
      ved.vgEditor.setValue('');
    }
  } else {
    console.warn('Unknown mode ' + ved.currentMode);
  }

  ved.editorVisibility();
};

ved.switchToVega = function() {
  var sel = ved.$d3.select('.sel_mode').node();
  sel.selectedIndex = 0;
  ved.mode();
};

// Changes visibility of vega editor in vl mode
ved.editorVisibility = function() {
  if (ved.vgHidden && ved.currentMode === 'vega-lite') {
    ved.$d3.select('.vg-spec').style('display', 'none');
    ved.$d3.select('.vl-spec')
      .style('flex', '1 1 auto');
    ved.$d3.select('.click_toggle_vega').attr('class', 'click_toggle_vega up');
  } else {
    ved.$d3.select('.vg-spec').style('display', 'block');
    ved.resizeVlEditor();
    ved.$d3.select('.click_toggle_vega').attr('class', 'click_toggle_vega down');
  }
  ved.resize();
};

ved.selectVg = function(spec) {
  var desc = ved.$d3.select('.spec_desc');

  if (spec) {
    ved.vgEditor.setValue(spec);
    ved.vgEditor.gotoLine(0);
    desc.html('');
    ved.parseVg();
    return;
  }

  var sel = ved.$d3.select('.sel_vg_spec').node(),
      idx = sel.selectedIndex;
  spec = d3.select(sel.options[idx]).datum();

  if (idx > 0) {
    d3.xhr(ved.uriVg(spec), function(error, response) {
      ved.vgEditor.setValue(response.responseText);
      ved.vgEditor.gotoLine(0);
      ved.parseVg(function() { desc.html(spec.desc || ''); });
    });
  } else {
    ved.vgEditor.setValue('');
    ved.vgEditor.gotoLine(0);
    ved.resetView();
  }
};

ved.selectVl = function(spec) {
  var desc = ved.$d3.select('.spec_desc');

  if (spec) {
    ved.vlEditor.setValue(spec);
    ved.vlEditor.gotoLine(0);
    desc.html('');
    ved.parseVl();
    ved.resizeVlEditor();
    return;
  }

  var sel = ved.$d3.select('.sel_vl_spec').node(),
      idx = sel.selectedIndex;
  spec = d3.select(sel.options[idx]).datum();

  if (idx > 0) {
    d3.xhr(ved.uriVl(spec), function(error, response) {
      ved.vlEditor.setValue(response.responseText);
      ved.vlEditor.gotoLine(0);
      ved.parseVl(function() { desc.html(spec.desc || ''); });
    });
  } else {
    ved.vlEditor.setValue('');
    ved.vlEditor.gotoLine(0);
    ved.vgEditor.setValue('');
    ved.resetView();
  }
  ved.resizeVlEditor();
};

ved.uriVl = function(entry) {
  return ved.path + 'vlspec/' + entry.name + '.json';
};

ved.uriVg = function(entry) {
  return ved.path + 'vgspec/' + entry.name + '.json';
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
  var opt, source;
  try {
    opt = JSON.parse(ved.vlEditor.getValue());
  } catch (e) {
    console.log(e);
    return;
  }

  var haveStats = function(stats) {
    var vgSpec = vl.compile(opt, stats);
    var text = JSON3.stringify(vgSpec, null, 2, 60);
    ved.vgEditor.setValue(text);
    ved.vgEditor.gotoLine(0);

    // change select for vega to Custom
    var vgSel = ved.$d3.select('.sel_vg_spec');
    vgSel.node().selectedIndex = 0;

    ved.parseVg(callback);
  };

  // use dataset stats only if the spec does not have embedded stats
  if (!opt.data  || opt.data.values === undefined) {
    d3.json(ved.path + opt.data.url, function(err, data) {
      if (err) return alert('Error loading data ' + err.statusText);
      haveStats(vl.data.stats(data));
    });
  } else {
    haveStats(null);
  }
};

ved.parseVg = function(callback) {
  var opt, source;
  try {
    opt = JSON.parse(ved.vgEditor.getValue());
  } catch (e) {
    console.log(e);
    return;
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
  if (ved.view) ved.view.destroy();
  d3.select('.mod_params').html('');
  d3.select('.spec_desc').html('');
  d3.select('.vis').html('');
};

ved.resize = function(event) {
  ved.vgEditor.resize();
  ved.vlEditor.resize();
};

ved.resizeVlEditor = function() {
  if (ved.vgHidden)
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

ved.getPermanentUrl = function() {
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
  } else {
    if (ved.currentMode === 'vega') {
      spec = JSON.parse(ved.vgEditor.getValue());
    } else {
      spec = JSON.parse(ved.vlEditor.getValue());
    }
    params.push('spec=' + encodeURIComponent(JSON.stringify(spec)));
  }

  if (!ved.vgHidden)
    params.push('showEditor=1');

  var path = location.protocol + '//' + location.host + location.pathname;
  return path + '?' + params.join('&');
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
  evt.initMouseEvent('click', true, true, document.defaultView, 1, 0, 0, 0, 0, false, false, false, false, 0, null);
  el.dispatchEvent(evt);
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
    vgSel.on('change', ved.selectVg);
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
    vlSel.on('change', ved.selectVl);
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
    ren.on('change', ved.renderer);
    ren.selectAll('option')
      .data(['Canvas', 'SVG'])
     .enter().append('option')
      .attr('value', function(d) { return d.toLowerCase(); })
      .text(function(d) { return d; });

    // Vega or Vega-lite mode
    var mode = el.select('.sel_mode');
    mode.on('change', ved.mode);

    // Code Editors
    var vlEditor = ved.vlEditor = ace.edit(ved.$d3.select('.vl-spec').node());
    var vgEditor = ved.vgEditor = ace.edit(ved.$d3.select('.vg-spec').node());

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

      editor.setValue('');
      editor.gotoLine(0);
    });

    // adjust height of vl editor based on content
    vlEditor.on('input', ved.resizeVlEditor);
    ved.resizeVlEditor();

    // Initialize application
    el.select('.btn_spec_format').on('click', ved.format);
    el.select('.btn_vg_parse').on('click', ved.parseVg);
    el.select('.btn_vl_parse').on('click', ved.parseVl);
    el.select('.btn_to_vega').on('click', function() {
      d3.event.preventDefault();
      ved.switchToVega();
    });
    el.select('.btn_export').on('click', ved.export);
    el.select('.click_toggle_vega').on('click', function() {
      ved.vgHidden = !ved.vgHidden;
      ved.editorVisibility();
    });
    el.select('.btn_permanent').on('click', function() {
      location = ved.getPermanentUrl();
    });
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
          sel = isVl ? vlSel : vgSel,
          select = isVl ? ved.selectVl : ved.selectVg;

      if (idx > 0) {
        sel.node().selectedIndex = idx;
        select();
      } else {
        try {
          var json = JSON.parse(decodeURIComponent(spec));
          select(spec);
          ved.format();
        } catch (err) {
          console.error(err);
          console.error('Specification loading failed: ' + spec);
        }
      }
    }

    // Handle post messages
    window.addEventListener('message', function(evt) {
      var data = evt.data;
      console.log('[Vega-Editor] Received Message', evt.origin, data);

      // send acknowledgement
      if (data.spec || data.file) {
        evt.source.postMessage(true, '*');
      }

      // only handle post messages for vega
      ved.switchToVega();

      // load spec
      if (data.spec) {
        ved.selectVl(data.spec);
      } else if (data.file) {
        sel.node().selectedIndex = ved.specs.indexOf(data.file) + 1;
        ved.selectVl();
      }
    }, false);
  });
};
