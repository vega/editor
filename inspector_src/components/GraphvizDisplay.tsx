import React, { useEffect, useState } from "react";
import PropTypes from "prop-types";
import Viz from "viz.js";
import { Module, render } from "viz.js/full.render";
import { parse } from "../helpers/svg-to-node";
import GraphViewer from "./GraphViewer";

const viz = new Viz({ Module, render });

interface GraphvizDisplayProps {
  className?: string;
  width: number;
  height: number;
  source: string;
}

const GraphvizDisplay: React.FC<GraphvizDisplayProps> = ({
  className,
  width,
  height,
  source,
}) => {
  const [renderResult, setRenderResult] = useState<string | null>(null);
  const [message, setMessage] = useState("Waiting for input");

  useEffect(() => {
    setMessage("Rendering");
    viz
      .renderString(source)
      .then((svg) => {
        setRenderResult(svg);
      })
      .catch((error) => {
        setMessage(error as string);
      });
  }, [source]);

  return renderResult === null ? (
    <p className={className}>{message}</p>
  ) : (
    <GraphViewer className={className} width={width} height={height}>
      {parse(renderResult)}
    </GraphViewer>
  );
};

GraphvizDisplay.propTypes = {
  source: PropTypes.string.isRequired,
};

export default GraphvizDisplay;
