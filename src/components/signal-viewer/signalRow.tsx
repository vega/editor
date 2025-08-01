import React, {useCallback, useEffect, useState} from 'react';
import {Search} from 'react-feather';
import {View} from '../../constants/index.js';
import {formatValueLong} from '../table/renderer.js';

interface Props {
  view: View;
  signal: string;
  onValueChange: (key: string, value: any) => void;
  maskListener: boolean;
  isHovered: boolean;
  isTimelineSelected: boolean;
  clickedSignal: any;
  hoverValue: any;
  timeline: boolean;
  onClickHandler?: (header: string) => void;
  children?: React.ReactNode;
}

const SignalRow: React.FC<Props> = ({
  view,
  signal,
  onValueChange,
  maskListener,
  isHovered,
  isTimelineSelected,
  clickedSignal,
  hoverValue,
  timeline,
  onClickHandler,
  children,
}) => {
  const [signalValue, setSignalValue] = useState(() => {
    try {
      return view.signal(signal);
    } catch (error) {
      console.error(`Error getting initial signal value for "${signal}":`, error);
      return null;
    }
  });

  const signalHandler = useCallback(
    (name: string, value: any) => {
      setSignalValue(value);
      onValueChange(name, value);
    },
    [onValueChange],
  );

  useEffect(() => {
    if (!maskListener) {
      view.addSignalListener(signal, signalHandler);
    }
    return () => {
      view.removeSignalListener(signal, signalHandler);
    };
  }, [view, signal, signalHandler, maskListener]);

  const displayValue = isTimelineSelected ? clickedSignal : isHovered ? hoverValue : signalValue;

  const backgroundColor =
    isTimelineSelected && isHovered ? '#fce57e' : isTimelineSelected ? '#A4F9C8' : isHovered ? '#fce57e' : '';

  const {tooLong, formatted} = formatValueLong(displayValue);

  if (tooLong) {
    return (
      <tr>
        <td className="pointer" onClick={() => onClickHandler?.(signal)}>
          {signal}
          <Search />
        </td>
        {timeline && <td style={{padding: 0}}>{children}</td>}
        <td
          style={{backgroundColor}}
          key={signal}
          title="The field is too large to be displayed. Please use the view API (see JS console)."
        >
          <span>(...)</span>
        </td>
      </tr>
    );
  }

  return (
    <tr>
      <td style={{whiteSpace: 'nowrap'}} className="pointer" onClick={() => onClickHandler?.(signal)}>
        {signal}
        <Search />
      </td>
      {timeline && <td style={{padding: 0}}>{children}</td>}
      <td
        style={{
          whiteSpace: 'nowrap',
          backgroundColor,
        }}
        key={signal}
      >
        {formatted}
      </td>
    </tr>
  );
};

export default SignalRow;
