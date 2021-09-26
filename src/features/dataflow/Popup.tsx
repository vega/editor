import * as React from 'react';
import {useAppSelector} from '../../hooks';
import {popupValueSelector} from './popupSlice';
import {Popup as AppPopup} from '../../components/popup';
import {Placement} from 'tippy.js';
import './Popup.css';
import {prettifyExpression} from './utils/prettify';

// TODO: Use one tippy and have max height for each pre
export function Popup() {
  const popup = useAppSelector(popupValueSelector);
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
    >
      <div />
    </AppPopup>
  );
  if (popup.type === 'edge') {
    // If we want to enable popups on edges again, we can add functionality back
    // here
    return <></>;
  }
  const {node, value} = popup;
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
      : {Value: prettifyExpression(JSON.stringify(value.value), 'Value'.length)}
  );
  return (
    <>
      {paramsTippy}
      {valueTippy}
    </>
  );
}
