import * as React from 'react';
import {useAppSelector} from '../../hooks';
import {popupValueSelector} from './popupSlice';
import {Popup as AppPopup} from '../../components/popup';
import {Placement} from 'tippy.js';
import {prettifyJSON} from './utils/prettify';
import './Popup.css';

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
      content={
        <dl>
          {Object.entries(params).map(([k, v]) => (
            <React.Fragment key={k}>
              <dt>{k}</dt>
              <dd>
                <pre>
                  <code>{v}</code>
                </pre>
              </dd>
            </React.Fragment>
          ))}
        </dl>
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
    const label = popup.edge.label;
    if (!label) {
      return <></>;
    }
    return makeTippy('top', {Label: popup.edge.label});
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
    value.type === 'function' ? {'Value (function name)': value.functionName} : {Value: prettifyJSON(value.value)}
  );
  return (
    <>
      {paramsTippy}
      {valueTippy}
    </>
  );
}
