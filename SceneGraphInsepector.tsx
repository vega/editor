/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';
import PropTypes from 'prop-types';
import Inspector, { NodeRenderer, ObjectRootLabel, ObjectName, ObjectValue, ObjectLabelProps } from 'react-inspector';

let previouslyHighlightElement: SVGElement | null = null;
let originalStrokeColor: string | null = null;
let originalStrokeWidth: string | null = null;

const emphasize = (el: SVGElement): void => {
  originalStrokeColor = el.style.stroke;
  originalStrokeWidth = el.style.strokeWidth;
  el.style.stroke = 'red';
  el.style.strokeWidth = '3px';
  previouslyHighlightElement = el;
};

const dampen = (el: SVGElement): void => {
  el.style.stroke = originalStrokeColor;
  el.style.strokeWidth = originalStrokeWidth;
  previouslyHighlightElement = null;
};

export interface SceneGraphInsepectorProps {
  sceneGraph: object;
  expandLevel: number;
}

export const SceneGraphInsepector: React.FC<SceneGraphInsepectorProps> = props => {
  const onLabelMouseEnter = (data: any): void => {
    if (data && typeof data === 'object' && data._svg instanceof SVGElement) {
      if (previouslyHighlightElement !== null) {
        dampen(previouslyHighlightElement);
      }
      emphasize(data._svg as SVGElement);
    }
  };

  const onLabelMouseLeave = (data: any): void => {
    if (data && typeof data === 'object' && data._svg instanceof SVGElement) {
      dampen(data._svg as SVGElement);
    }
  };

  const ObjectLabel: React.FC<ObjectLabelProps> = ({ name, data, isNonenumerable = false }) => {
    const object = data;
    return (
      <span onMouseOver={(): void => onLabelMouseEnter(data)} onMouseLeave={(): void => onLabelMouseLeave(data)}>
        <ObjectName name={name} dimmed={isNonenumerable} />
        <span>: </span>
        <ObjectValue object={object} />
      </span>
    );
  };

  // Make linter happy
  ObjectLabel.propTypes = {
    name: PropTypes.string.isRequired,
    data: PropTypes.object.isRequired,
    isNonenumerable: PropTypes.bool.isRequired,
  };

  const customizedNodeRenderer: NodeRenderer = ({ depth, name, data, isNonenumerable }) =>
    depth === 0 ? (
      <ObjectRootLabel name={name} data={data} />
    ) : (
      <ObjectLabel name={name} data={data} isNonenumerable={isNonenumerable} />
    );

  // Make linter happy
  customizedNodeRenderer.propTypes = {
    depth: PropTypes.number.isRequired,
    name: PropTypes.string.isRequired,
    data: PropTypes.any.isRequired,
    isNonenumerable: PropTypes.bool.isRequired,
    expanded: PropTypes.bool.isRequired,
  };

  return <Inspector data={props.sceneGraph} expandLevel={props.expandLevel} nodeRenderer={customizedNodeRenderer} />;
};

SceneGraphInsepector.propTypes = {
  sceneGraph: PropTypes.object.isRequired,
  expandLevel: PropTypes.number.isRequired,
};
