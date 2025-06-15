import React, {useCallback, useEffect, useRef, useState} from 'react';
import {Search} from 'react-feather';
import {isDate} from 'vega';
import {View} from '../../constants/index.js';
import {formatValueLong} from '../table/renderer.js';

/* eslint-disable react/prop-types */

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

const SignalRowComponent = (props: Props) => {
  const {view, signal, onValueChange, maskListener, timeline, onClickHandler, children} = props;

  const getCurrent = useCallback(() => {
    try {
      return view?.signal?.(signal);
    } catch (e) {
      console.log(`Signal ${signal} not found in current view`);
      return undefined;
    }
  }, [view, signal]);

  const [signalValue, setSignalValue] = useState<any>(() => {
    try {
      return getCurrent();
    } catch (e) {
      return undefined;
    }
  });

  const listenerAttachedRef = useRef(false);

  const onValueChangeRef = useRef(onValueChange);
  useEffect(() => {
    onValueChangeRef.current = onValueChange;
  }, [onValueChange]);

  const signalHandler = useCallback(
    (_signalName: string, currentValue: any) => {
      setSignalValue(currentValue);
      if (onValueChangeRef.current) {
        onValueChangeRef.current(signal, currentValue);
      }
    },
    [signal],
  );

  useEffect(() => {
    if (!view || !signal) return;

    let isListenerAttached = false;

    if (!maskListener) {
      try {
        view.signal(signal);
        view.addSignalListener(signal, signalHandler);
        isListenerAttached = true;
        listenerAttachedRef.current = true;
      } catch (e) {
        console.log(`Could not attach listener to signal ${signal}:`, e);
      }

      return () => {
        if (isListenerAttached) {
          try {
            view.removeSignalListener(signal, signalHandler);
            listenerAttachedRef.current = false;
          } catch (e) {
            console.log(`Error removing listener from signal ${signal}:`, e);
          }
        }
      };
    } else {
      if (listenerAttachedRef.current) {
        try {
          view.removeSignalListener(signal, signalHandler);
          listenerAttachedRef.current = false;
        } catch (e) {
          console.log(`Error removing listener from signal ${signal}:`, e);
        }
      }
      return undefined;
    }
  }, [view, signal, maskListener, signalHandler, timeline]);

  useEffect(() => {
    try {
      const newSignalValue = getCurrent();
      setSignalValue(newSignalValue);
      if (onValueChangeRef.current && newSignalValue !== undefined) {
        onValueChangeRef.current(signal, newSignalValue);
      }
    } catch (e) {
      console.log(`Error updating signal ${signal}:`, e);
    }
  }, [view, signal, getCurrent]);

  const renderSignal = () => {
    if (props.isTimelineSelected && props.isHovered) {
      return props.hoverValue;
    }
    if (props.isTimelineSelected) {
      return props.clickedSignal;
    } else if (props.isHovered) {
      return props.hoverValue;
    } else {
      return null;
    }
  };

  const getBackgroundColor = () => {
    if (props.isTimelineSelected && props.isHovered) {
      return '#fce57e';
    }
    if (props.isTimelineSelected && props.clickedSignal !== undefined) {
      return '#A4F9C8';
    } else if (props.isHovered && props.hoverValue !== undefined) {
      return '#fce57e';
    } else {
      return '';
    }
  };

  let tooLong = false;
  let formatted = '';
  const value = renderSignal();

  if (!isDate(signalValue)) {
    const formatValue = formatValueLong(value ? value : signalValue);
    if (formatValue !== undefined) {
      tooLong = formatValue.tooLong;
      formatted = formatValue.formatted;
    } else {
      tooLong = false;
      formatted = 'undefined';
    }
  } else {
    tooLong = false;
    formatted = new Date(value ? value : signalValue).toUTCString();
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

export default React.memo(SignalRowComponent);
