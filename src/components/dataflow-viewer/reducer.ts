/**
 * The dataflow viewer currently has its own reducer.
 *
 * The main reason we don't use the redux store is to store some things that aren't
 * JSON serializable, like the cytoscape instance and elements. We can than do imperative updates on
 * them in the reducer.
 *
 * Also, since this is currently entirely self contained, it makes a bit easer to comprehend, by keepign all this logic closer to the view,
 * then if it was spread out through the global redux files.
 */

import cytoscape from 'cytoscape';
import * as React from 'react';
import {StoreProps} from '.';
import layout from './layout';
import runtimeToCytoscape from './runtimeToCytoscape';
import allRelated from './allRelated';
import relatedToIDs from './relatedToIDs';
import tippy, {Instance} from 'tippy.js';
import popper from 'cytoscape-popper';
import 'tippy.js/dist/tippy.css';
import 'tippy.js/themes/light-border.css';
import {Pulse} from './Pulses';

cytoscape.use(popper);

// Disable warnings about style
cytoscape.warnings(false);

export type Action =
  | {type: 'set-cytoscape'; cy: cytoscape.Core}
  | {type: 'select-elements'}
  | {type: 'unselect-elements'}
  | {type: 'select-pulse'; clock: number | null}
  | {type: 'new-runtime'; runtime: StoreProps['runtime']}
  | {type: 'new-pulses'; pulses: StoreProps['pulses']}
  | {type: 'layout-stop'; layout: cytoscape.Layouts}
  | {type: 'mouseover-graph'; target: any}
  | {type: 'mouseout-graph'; target: any};

export type State = {
  cy: cytoscape.Core | null;
  // The running layout, if we are currently doing a layout.
  runningLayout: cytoscape.Layouts | null;
  //   Nodes that are removed because they aren't part of the current pulse
  removedNodesFromPulseSelection: cytoscape.NodeCollection | null;
  //   Nides that are removed because they aren't related to the current selected nodes
  removedNodesFromNodeSelection: cytoscape.NodeCollection | null;
  selectedPulse: number | null;
  popup: null | {tippy: Instance<any>; target: any};
} & Pick<StoreProps, 'runtime' | 'pulses'>;

function createInitialState(props: StoreProps): State {
  return {
    cy: null,
    runningLayout: null,
    removedNodesFromPulseSelection: null,
    removedNodesFromNodeSelection: null,
    selectedPulse: null,
    popup: null,
    ...props,
  };
}
export type Dispatch = (action: Action) => void;
export function useDataflowReducer(props: Pick<StoreProps, 'runtime' | 'pulses'>): [State, Dispatch] {
  return React.useReducer(reducer, props, createInitialState);
}

function reducer(state: State, action: Action): State {
  const {cy} = state;

  switch (action.type) {
    case 'set-cytoscape': {
      if (cy) {
        // Remove old cytoscape instance
        cy.destroy();
      }
      return {
        ...state,
        cy: action.cy,
        runningLayout: null,
        removedNodesFromPulseSelection: null,
        removedNodesFromNodeSelection: null,
        selectedPulse: null,
      };
    }
    case 'new-runtime': {
      // Reset selected pulse, and add all new elements when runtime changes
      state.runningLayout?.stop();
      const elements = runtimeToCytoscape(action.runtime);
      cy.batch(() => {
        cy.elements().remove();
        cy.add(elements);
      });
      const runningLayout = cy.layout(layout).run();

      return {
        ...state,
        runtime: action.runtime,
        runningLayout,
        selectedPulse: null,
        removedNodesFromPulseSelection: null,
        removedNodesFromNodeSelection: null,
      };
    }
    case 'new-pulses': {
      // If the pulses have been reset and we can't fin the selected pulse, reset it
      const selectedPulse =
        action.pulses.find((p) => p.clock === state.selectedPulse) === undefined ? null : state.selectedPulse;
      // TODO: Also reset state
      return {...state, pulses: action.pulses, selectedPulse};
    }
    case 'select-elements': {
      // On select, add back removed nodes, filter nodes to successors and predecessors of selected and re-layout.
      state.runningLayout?.stop();

      cy.startBatch();
      state.removedNodesFromNodeSelection?.restore();

      // Remove all nodes that are not related to the selected nodes, and save all removed elements
      const removedNodesFromNodeSelection = allRelated(cy).absoluteComplement().nodes().remove();
      cy.endBatch();

      const runningLayout = cy.layout(layout).run();

      return {...state, runningLayout, removedNodesFromNodeSelection};
    }
    case 'unselect-elements': {
      // On unselect, show all nodes and refit
      state.runningLayout?.stop();
      state.removedNodesFromNodeSelection?.restore();
      const runningLayout = cy.layout(layout).run();
      return {...state, runningLayout, removedNodesFromNodeSelection: null};
    }
    case 'select-pulse': {
      // On selecting a pulse, restore all nodes, filter for that pulse, then filter for related to selected
      // This way, if we refilter the nodes in the selected pulse, the correct ones will be restored
      const {clock} = action;
      state.runningLayout?.stop();

      cy.startBatch();
      state.removedNodesFromNodeSelection?.restore();
      state.removedNodesFromPulseSelection?.restore();

      const removedNodesFromPulseSelection =
        clock === null
          ? null
          : relatedToIDs(cy, Object.keys(state.pulses.find((pulse) => pulse.clock === clock).values))
              .absoluteComplement()
              .nodes()
              .remove();

      // If we have removed any nodes before, then we had selected a node, and so refilter by that selected
      const removedNodesFromNodeSelection =
        state.removedNodesFromNodeSelection === null ? null : allRelated(cy).absoluteComplement().nodes().remove();
      cy.endBatch();

      const runningLayout = cy.layout(layout).run();

      return {
        ...state,
        runningLayout,
        removedNodesFromNodeSelection,
        removedNodesFromPulseSelection,
        selectedPulse: clock,
      };
    }

    case 'layout-stop': {
      // If the layout finished was the current layout, then refit, and remove running layout
      if (action.layout === state.runningLayout) {
        cy.fit(undefined, 10);
        return {...state, runningLayout: null};
      }
      //   Otherwise, the layout that finished is an old one
      return state;
    }

    /**
     * Show details on hover using tippy and popper
     * https://atomiks.github.io/tippyjs/v6/addons/#singleton
     * https://stackoverflow.com/a/54556015/907060
     * https://github.com/cytoscape/cytoscape.js-popper#usage-with-tippyjs
     **/
    case 'mouseover-graph': {
      const {target} = action;
      // If we aren't mousing over a node, continue
      if (!('isNode' in target) || !target.isNode()) {
        return state;
      }
      state.popup?.tippy.destroy();

      const t = tippy(dummyDomEle, {
        getReferenceClientRect: target.popperRef().getBoundingClientRect,
        content: `<dl>${Object.entries(target.data().params)
          .map(([k, v]) => `<dt>${k}</dt><dd><pre><code>${v}</code></pre></dd>`)
          .join('')}</dl>`,
        trigger: 'manual',
        placement: 'left',
        arrow: true,
        theme: 'light-border',
        allowHTML: true,
        maxWidth: 550,
        interactive: true,
        // Needed for interactive
        // https://stackoverflow.com/a/63270536/907060
        appendTo: document.body,
      });
      t.show();
      return {...state, popup: {tippy: t, target: target}};
    }
    case 'mouseout-graph':
      {
        const {target} = action;
        if (state.popup?.target === target) {
          state.popup.tippy.destroy();
          return {...state, popup: null};
        }
      }
      return state;
  }
}

// A dummy element must be passed as tippy only accepts dom element(s) as the target
// https://atomiks.github.io/tippyjs/v6/constructor/#target-types
const dummyDomEle = document.createElement('div');
