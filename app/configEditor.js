var configEditor = {};

configEditor.init = function() {
  configEditor.open = false;

  // Set up the debugging button
  d3.select(".btn_config").on("click", function() {
    var body = d3.select(".mod_body.config");
    configEditor.open = !configEditor.open;
    toggle(this, "selected");
    toggle(".vega-editor", "config");
    if (configEditor.open) {
      d3.selectAll(".module .mod_subheader.config.config_hidden").classed("config_hidden", false);
      toggleClass(body, "hide-config-spec", "show-config-spec");

      d3.select(".click_toggle_vega.config")
        .style("margin-left", function() {
          console.log("what... ", d3.select(".click_toggle_vega.config"));
          console.log(this.parentNode.getBoundingClientRect());
          return this.parentNode.getBoundingClientRect().width / 2 - 175 + "px";
        });
    } else {
      d3.selectAll(".module .mod_subheader.config").classed("config_hidden", true);
      toggleClass(body, "show-config-spec", "hide-config-spec");
    }
  });

  d3.select(".vg_pane.config").on("click", function() {
    subviewVisibility_config();
  });

  specVisibility();
};

function toggle(el, toggle) {
    var className = d3.select(el).attr("class");
    d3.select(el).attr("class", function() {
      if(className.indexOf(toggle) == -1) return className + " " + toggle;
      return className.replace(" " + toggle, "");
    });
  };

function subviewVisibility_config() {
  var toggle = d3.select(".click_toggle_vega.config");
  var body = d3.select(".mod_body.config");
  if(toggle.attr("class").indexOf("up") != -1) {
    toggle.attr("class", "click_toggle_vega down config");
    toggleClass(body, "min", "max");
  } else {
    toggle.attr("class", "click_toggle_vega up config");
    toggleClass(body, "max", "min");
  }
  ved.resize();
};

function toggleClass(el, current_class, replacement_class) {
  el.classed(replacement_class, true);
  el.classed(current_class, false);
}

// Clicking "config" to bring up or disappear config
function specVisibility() {
  d3.select(".click_toggle_vis").on("click", function() {
    var current = d3.select(this).attr("class");
    if(current.indexOf("left") !== -1) {
      d3.select(this).attr("class", current.replace("left", "right"))
        .select("span").attr("class", "fa fa-angle-double-right");
      d3.select(".mod_spec").style("display", "none");
    } else {
      d3.select(this).attr("class", current.replace("right", "left"))
        .select("span").attr("class", "fa fa-angle-double-left");
      d3.select(".mod_spec").style("display", "flex");
    }
  })
};