import * as React from 'react';
import {useAppSelector} from '../../hooks';
import {popupValueSelector} from './popupSlice';
import Tippy from '@tippyjs/react';
import 'tippy.js/dist/tippy.css';
import 'tippy.js/themes/light-border.css';
import {Placement} from 'tippy.js';
import {lab} from 'd3';
import {prettifyJSON} from './utils/prettify';

export function Popup() {
  const popup = useAppSelector(popupValueSelector);
  const getReferenceClientRect = React.useCallback(() => popup.referenceClientRect, [popup?.referenceClientRect]);
  if (popup === null) {
    return <></>;
  }
  const makeTippy = (placement: Placement, params: Record<string, string>) => (
    <Tippy
      content={
        <dl>
          {Object.entries(params).map(([k, v]) => (
            <>
              <dt>{k}</dt>
              <dd>
                <pre>
                  <code>{v}</code>
                </pre>
              </dd>
            </>
          ))}
        </dl>
      }
      getReferenceClientRect={getReferenceClientRect}
      visible={popup !== null}
      theme="light-border"
      interactive={true}
      placement={placement}
      arrow={true}
    >
      <div />
    </Tippy>
  );
  if (popup.type === 'edge') {
    const label = popup.edge.label;
    if (!label) {
      return <></>;
    }
    return makeTippy('top', {Label: popup.edge.label});
  }
  console.log(popup);
  const {node, value} = popup;
  const paramsTippy = makeTippy('top', node.params);
  if (!value) {
    return paramsTippy;
  }

  const valueTippy = makeTippy(
    'bottom',
    value.type === 'function'
      ? {'Value (function name)': value.functionName}
      : value.type === 'error'
      ? {'Value (error serializing': value.error}
      : {Value: prettifyJSON(value.value)}
  );
  return (
    <>
      {paramsTippy}
      {valueTippy}
    </>
  );
}
