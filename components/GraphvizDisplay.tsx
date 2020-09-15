import React, { useEffect, useState } from "react";
import PropTypes from "prop-types";
import Viz from "viz.js";
import { Module, render } from "viz.js/full.render";
import { parse } from "../helpers/svg-to-node";

const viz = new Viz({ Module, render });

interface GraphvizDisplayProps {
  source: string;
}

const GraphvizDisplay: React.FC<GraphvizDisplayProps> = (props) => {
  const [renderResult, setRenderResult] = useState<string | null>(null);
  const [message, setMessage] = useState("Waiting for input");

  useEffect(() => {
    setMessage("Rendering");
    viz
      .renderString(props.source)
      .then((svg) => {
        setRenderResult(svg);
      })
      .catch((error) => {
        setMessage(error as string);
      });
  }, [props.source]);

  return renderResult === null ? <p>{message}</p> : parse(renderResult);
};

GraphvizDisplay.propTypes = {
  source: PropTypes.string.isRequired,
};

export default GraphvizDisplay;
