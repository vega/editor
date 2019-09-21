import React from 'react';
import PropTypes from 'prop-types';
import { Vega } from 'react-vega';
import { chartData, chartSpec } from './chart';
import { View } from 'vega-typings';

interface VegaWrapperProps {
  onNewView?: (view: View) => void;
}

/**
 * Since react-vega do re-render every time parent component updates.
 * We need a customized wrapper that prevent component from updating manually.
 */
export class VegaWrapper extends React.Component<VegaWrapperProps> {
  public static propTypes = {
    onNewView: PropTypes.func.isRequired,
  };
  public shouldComponentUpdate(): boolean {
    return false;
  }
  public render(): JSX.Element {
    return (
      <div className="vega-wrapper">
        <Vega
          spec={chartSpec}
          data={chartData}
          width={chartSpec.width}
          height={chartSpec.height}
          renderer="svg"
          actions={false}
          onNewView={(view): {} => {
            if (this.props.onNewView !== undefined) {
              this.props.onNewView(view);
            }
            return {};
          }}
        />
      </div>
    );
  }
}
