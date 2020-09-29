/* eslint-disable @typescript-eslint/no-explicit-any */
import React from "react";
import PropTypes from "prop-types";
import Inspector, {
  InspectorNodeRenderer,
  ObjectName,
  ObjectValue,
  ObjectLabelProps,
  ObjectRootLabelProps,
} from "react-inspector";

class Highlighter {
  private previouslyHighlightElement: SVGElement | null = null;
  private originalStrokeColor: string | null = null;
  private originalStrokeWidth: string | null = null;

  emphasize(el: SVGElement): void {
    this.dampen();
    this.originalStrokeColor = el.style.stroke;
    this.originalStrokeWidth = el.style.strokeWidth;
    el.style.stroke = "red";
    el.style.strokeWidth = "3px";
    this.previouslyHighlightElement = el;
  }

  dampen(): void {
    if (this.previouslyHighlightElement !== null) {
      this.previouslyHighlightElement.style.stroke = this.originalStrokeColor!;
      this.previouslyHighlightElement.style.strokeWidth = this.originalStrokeWidth!;
      this.previouslyHighlightElement = null;
    }
  }
}

const resultViewHighligher = new Highlighter();
const dataFlowHighlighter = new Highlighter();

export interface SceneGraphInsepectorProps {
  sceneGraph: object;
  expandLevel: number;
}

export const SceneGraphInsepector: React.FC<SceneGraphInsepectorProps> = (
  props
) => {
  const onLabelMouseEnter = (data: any): void => {
    if (data && typeof data === "object") {
      if (data._svg instanceof SVGElement) {
        resultViewHighligher.emphasize(data._svg);
      }
      if (typeof data.source === "number") {
        const el = document.getElementById(`node${data.source}`);
        console.log(el);
        if (el instanceof SVGElement) {
          dataFlowHighlighter.emphasize(el);
        }
      }
    }
  };

  const onLabelMouseLeave = (data: any): void => {
    if (data && typeof data === "object") {
      if (data._svg instanceof SVGElement) {
        resultViewHighligher.dampen();
      }
      if (typeof data.source === "number") {
        dataFlowHighlighter.dampen();
      }
    }
  };

  const ObjectLabel: React.FC<ObjectLabelProps> = ({
    name,
    data,
    isNonenumerable = false,
  }) => {
    const object = data;
    return (
      <span
        className="px-1 font-mono text-sm rounded select-none hover:bg-gray-300"
        onMouseOver={(): void => onLabelMouseEnter(data)}
        onMouseLeave={(): void => onLabelMouseLeave(data)}
      >
        <ObjectName name={name} dimmed={isNonenumerable} />
        <span>: </span>
        <ObjectValue object={object} />
      </span>
    );
  };

  const ObjectRootLabel: React.FC<ObjectRootLabelProps> = ({ name, data }) => {
    if (typeof name === "string") {
      return (
        <span>
          <span className="font-mono text-sm">{name}</span>
        </span>
      );
    } else {
      return <span className="font-mono text-sm">root</span>;
    }
  };

  const customizedNodeRenderer: InspectorNodeRenderer = ({
    depth,
    name,
    data,
    isNonenumerable,
  }) =>
    depth === 0 ? (
      <ObjectRootLabel name={name} data={data} />
    ) : (
      <ObjectLabel name={name} data={data} isNonenumerable={isNonenumerable} />
    );

  return (
    <Inspector
      data={props.sceneGraph}
      expandLevel={props.expandLevel}
      nodeRenderer={customizedNodeRenderer}
    />
  );
};

SceneGraphInsepector.propTypes = {
  sceneGraph: PropTypes.object.isRequired,
  expandLevel: PropTypes.number.isRequired,
};
