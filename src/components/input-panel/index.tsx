import "./index.css";
import React from "react";
import { connect } from "react-redux";
import SplitPane from "react-split-pane";
import { LAYOUT, MODES } from "../../constants";
import CompiledSpecDisplay from "./compiled-spec-display";
import CompiledSpecHeader from "./compiled-spec-header";
import SpecEditor from "./spec-editor";
type InputPanelProps = {
  compiledVegaSpec?: boolean,
  mode?: string
};
class InputPanel extends React.Component<InputPanelProps, {}> {
  getInnerPanes() {
    const innerPanes = [<SpecEditor key="editor" />];
    if (this.props.mode === MODES.VegaLite) {
      if (this.props.compiledVegaSpec) {
        innerPanes.push(<CompiledSpecDisplay key="compiled" />);
      } else {
        innerPanes.push(<CompiledSpecHeader key="compiledSpecHeader" />);
      }
    }
    return innerPanes;
  }
  render() {
    const innerPanes = this.getInnerPanes();
    if (this.props.mode === MODES.VegaLite && this.props.compiledVegaSpec) {
      return (
        <SplitPane
          split="horizontal"
          defaultSize={
            (window.innerHeight - LAYOUT.HeaderHeight) / innerPanes.length
          }
          pane2Style={{ display: "flex" }}
        >
          {innerPanes}
        </SplitPane>
      );
    } else {
      return <div className={"full-height-wrapper"}>{innerPanes}</div>;
    }
  }
}
function mapStateToProps(state, ownProps) {
  return {
    mode: state.mode,
    compiledVegaSpec: state.compiledVegaSpec
  };
}
export default connect(mapStateToProps)(InputPanel);
