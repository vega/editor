import * as React from 'react';
import {useAppContext} from '../../context/app-context.js';
import {usePopupState} from './PopupProvider.js';
import {Popup as AppPopup} from '../../components/popup/index.js';
import {Placement} from 'tippy.js';
import './Popup.css';
import {prettifyExpression} from './utils/prettify.js';
import {runtimeToGraph} from './utils/runtimeToGraph.js';

// TODO: Use one tippy and have max height for each pre
export function Popup() {
  const popup = usePopupState();
  const {state} = useAppContext();
  const {runtime, pulses} = state;
  const graph = React.useMemo(() => (runtime ? runtimeToGraph(runtime) : null), [runtime]);

  const getReferenceClientRect = React.useCallback(() => popup.referenceClientRect, [popup?.referenceClientRect]);
  if (popup === null) {
    return <></>;
  }
  const makeTippy = (placement: Placement, params: Record<string, string>) => (
    <AppPopup
      key={placement}
      className="dataflow-popup"
      content={
        <>
          {Object.entries(params).map(([k, v]) => (
            <div key={k}>
              <span className="label">{k}: </span>
              <pre key={k}>
                <code>{v}</code>
              </pre>
            </div>
          ))}
        </>
      }
      getReferenceClientRect={getReferenceClientRect}
      visible={popup !== null}
      interactive={true}
      placement={placement}
      arrow={true}
      maxWidth="550px"
      appendTo={document.body}
    ></AppPopup>
  );
  if (popup.type === 'edge') {
    // If we want to enable popups on edges again, we can add functionality back
    // here
    return <></>;
  }

  const node = graph.nodes[popup.id];
  const pulse = pulses.find((p) => p.clock === state.pulse);
  const value = pulse?.values[popup.id];

  if (Object.keys(node.params).length === 0) {
    return <></>;
  }
  const paramsTippy = makeTippy('top', node.params);
  if (!value || value.type === 'error') {
    return paramsTippy;
  }

  const valueTippy = makeTippy(
    'bottom',
    value.type === 'function'
      ? {'Value (function name)': value.functionName}
      : {Value: prettifyExpression(JSON.stringify(value.value), 'Value'.length)},
  );
  return (
    <>
      {paramsTippy}
      {valueTippy}
    </>
  );
}
