import React, {useCallback, useEffect, useState} from 'react';
import {Search} from 'react-feather';
import {isDate} from 'vega';
import {View} from '../../constants/index.js';
import {formatValueLong} from '../table/renderer.js';

/* eslint-disable react/prop-types */

interface Props {
  view: View;
  signal: string;
  onValueChange: (key, value) => void;
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

  useEffect(() => {
    try {
      setSignalValue(view.signal(signal));
    } catch (error) {
      console.error(`Error getting updated signal value for "${signal}":`, error);
      setSignalValue(null);
    }
  }, [view, signal]);

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

  const renderSignal = () => {
    if (isTimelineSelected && isHovered) {
      return hoverValue;
    }
    if (isTimelineSelected) {
      return clickedSignal;
    } else if (isHovered) {
      return hoverValue;
    } else {
      return null;
    }
  };

  const getBackgroundColor = () => {
    if (isTimelineSelected && isHovered) {
      return '#fce57e';
    }
    if (isTimelineSelected && clickedSignal !== undefined) {
      return '#A4F9C8';
    } else if (isHovered && hoverValue !== undefined) {
      return '#fce57e';
    } else {
      return '';
    }
  };

  let tooLong = false;
  let formatted = '';
  const value = renderSignal();
  const displayValue = value !== null && value !== undefined ? value : signalValue;

  if (!isDate(displayValue)) {
    const formatValue = formatValueLong(displayValue);
    if (formatValue !== undefined) {
      tooLong = formatValue.tooLong;
      formatted = formatValue.formatted;
    } else {
      tooLong = false;
      formatted = 'undefined';
    }
  } else {
    tooLong = false;
    formatted = new Date(displayValue).toUTCString();
  }
  if (tooLong) {
    return (
      <tr>
        <td className="pointer" onClick={() => onClickHandler && onClickHandler(signal)}>
          {signal}
          <Search />
        </td>
        {timeline && <td style={{padding: 0}}>{children}</td>}
        <td
          style={{backgroundColor: getBackgroundColor()}}
          key={signal}
          title="The field is too large to be displayed. Please use the view API (see JS console)."
        >
          <span>(...)</span>
        </td>
      </tr>
    );
  } else {
    return (
      <tr>
        <td style={{whiteSpace: 'nowrap'}} className="pointer" onClick={() => onClickHandler && onClickHandler(signal)}>
          {signal}
          <Search />
        </td>
        {timeline && <td style={{padding: 0}}>{children}</td>}
        <td
          style={{
            whiteSpace: 'nowrap',
            backgroundColor: getBackgroundColor(),
          }}
          key={signal}
        >
          {formatted}
        </td>
      </tr>
    );
  }
};

export default SignalRow;
