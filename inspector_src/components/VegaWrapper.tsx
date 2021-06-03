import React from "react";
import PropTypes from "prop-types";
import { Vega, VisualizationSpec } from "react-vega";
import { View } from "vega-typings";
import "./VegaWrapper.css";
import styled from "styled-components";

interface VegaWrapperProps {
  onNewView?: (view: View) => void;
  spec: string;
}

const VegaContainer = styled.main.attrs({ className: "" })`
  display: flex;
  justify-content: center;
  align-items: center;
`;

/**
 * Since react-vega do re-render every time parent component updates.
 * We need a customized wrapper that prevent component from updating manually.
 */
export class VegaWrapper extends React.Component<VegaWrapperProps> {
  public static propTypes = {
    onNewView: PropTypes.func.isRequired,
  };

  public shouldComponentUpdate(nextProps: VegaWrapperProps): boolean {
    return nextProps.spec === this.props.spec;
  }

  public render(): JSX.Element {
    const parsedSpec = JSON.parse(this.props.spec) as VisualizationSpec;
    return (
      <VegaContainer>
        <Vega
          className="m-8 bg-white rounded shadow"
          spec={parsedSpec}
          renderer="svg"
          actions={false}
          onNewView={(view) => {
            if (this.props.onNewView !== undefined) {
              this.props.onNewView(view);
            }
          }}
        />
      </VegaContainer>
    );
  }
}
