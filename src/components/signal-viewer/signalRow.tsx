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
  const {
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
  } = props;

  const getCurrent = useCallback(() => view.signal(signal), [view, signal]);
  const [signalValue, setSignalValue] = useState<any>(getCurrent());
  const listenerAttachedRef = useRef(false);

  // Ref to hold the latest onValueChange callback
  const onValueChangeRef = useRef(onValueChange);
  useEffect(() => {
    onValueChangeRef.current = onValueChange;
  }, [onValueChange]);

  const signalHandler = useCallback(
    (_signalName: string, currentValue: any) => {
      setSignalValue(currentValue);
      onValueChange(signal, currentValue);
    },
    [onValueChange, signal, setSignalValue],
  );

  useEffect(() => {
    if (!maskListener) {
      view.addSignalListener(signal, signalHandler);
      listenerAttachedRef.current = true;
      return () => {
        view.removeSignalListener(signal, signalHandler);
        listenerAttachedRef.current = false;
      };
    } else {
      if (listenerAttachedRef.current) {
        view.removeSignalListener(signal, signalHandler);
        listenerAttachedRef.current = false;
      }
      return undefined;
    }
  }, [view, signal, maskListener, signalHandler, timeline]);

  // Effect to handle view/signal prop changes to update local state and notify parent.
  useEffect(() => {
    const newSignalValue = view.signal(signal);
    setSignalValue(newSignalValue);
    // Notify parent about the current value from the (potentially new) view.
    if (onValueChangeRef.current) {
      onValueChangeRef.current(signal, newSignalValue);
    }
  }, [view, signal, setSignalValue]); // Removed onValueChange, onValueChangeRef is not a dependency

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

// export default class SignalRow extends React.PureComponent<Props, State> {
//   private listenerAttached = false;
//   constructor(props) {
//     super(props);
//     this.state = {
//       signalValue: this.props.view.signal(this.props.signal),
//     };
//     this.signalHandler = this.signalHandler.bind(this);
//   }
//   public componentDidUpdate(prevProps) {
//     if (prevProps.view !== this.props.view) {
//       prevProps.view.removeSignalListener(prevProps.signal, this.signalHandler);
//       this.props.view.addSignalListener(this.props.signal, this.signalHandler);
//       this.setState(
//         {
//           signalValue: this.props.view.signal(this.props.signal),
//         },
//         () => this.props.onValueChange(this.props.signal, this.props.view.signal(this.props.signal)),
//       );
//     }
//   }
//   public componentDidMount() {
//     if (!this.props.maskListener) {
//       this.props.view.addSignalListener(this.props.signal, this.signalHandler);
//       this.listenerAttached = true;
//     }
//   }
//   public componentWillUnmount() {
//     this.props.view.removeSignalListener(this.props.signal, this.signalHandler);
//     this.listenerAttached = false;
//   }

//   public componentWillReceiveProps(nextProps) {
//     if (nextProps.maskListener && this.listenerAttached) {
//       this.props.view.removeSignalListener(this.props.signal, this.signalHandler);
//       this.listenerAttached = false;
//     } else if (!this.listenerAttached && !nextProps.maskListener) {
//       this.props.view.addSignalListener(this.props.signal, this.signalHandler);
//       this.listenerAttached = true;
//     }
//   }

//   public renderSignal = () => {
//     const { isTimelineSelected, isHovered, clickedSignal, hoverValue } = this.props;
//     if (isTimelineSelected && isHovered) {
//       return hoverValue;
//     }
//     if (isTimelineSelected) {
//       return clickedSignal;
//     } else if (isHovered) {
//       return hoverValue;
//     } else {
//       return null;
//     }
//   };

//   public getBackgroundColor = () => {
//     if (this.props.isTimelineSelected && this.props.isHovered) {
//       return '#fce57e';
//     }
//     if (this.props.isTimelineSelected && this.props.clickedSignal !== undefined) {
//       return '#A4F9C8';
//     } else if (this.props.isHovered && this.props.hoverValue !== undefined) {
//       return '#fce57e';
//     } else {
//       return '';
//     }
//   };

//   public render() {
//     let tooLong = false;
//     let formatted = '';
//     const value = this.renderSignal();
//     if (!isDate(this.state.signalValue)) {
//       const formatValue = formatValueLong(value ? value : this.state.signalValue);
//       if (formatValue !== undefined) {
//         tooLong = formatValue.tooLong;
//         formatted = formatValue.formatted;
//       } else {
//         tooLong = false;
//         formatted = 'undefined';
//       }
//     } else {
//       tooLong = false;
//       formatted = new Date(value ? value : this.state.signalValue).toUTCString();
//     }
//     if (tooLong) {
//       return (
//         <tr>
//           <td
//             className="pointer"
//             onClick={() => this.props.onClickHandler && this.props.onClickHandler(this.props.signal)}
//           >
//             {this.props.signal}
//             <Search />
//           </td>
//           {this.props.timeline && <td style={{ padding: 0 }}>{this.props.children}</td>}
//           <td
//             style={{ backgroundColor: this.getBackgroundColor() }}
//             key={this.props.signal}
//             title="The field is too large to be displayed. Please use the view API (see JS console)."
//           >
//             <span>(...)</span>
//           </td>
//         </tr>
//       );
//     } else {
//       return (
//         <tr>
//           <td
//             style={{ whiteSpace: 'nowrap' }}
//             className="pointer"
//             onClick={() => this.props.onClickHandler && this.props.onClickHandler(this.props.signal)}
//           >
//             {this.props.signal}
//             <Search />
//           </td>
//           {this.props.timeline && <td style={{ padding: 0 }}>{this.props.children}</td>}
//           <td
//             style={{
//               whiteSpace: 'nowrap',
//               backgroundColor: this.getBackgroundColor(),
//             }}
//             key={this.props.signal}
//           >
//             {formatted}
//           </td>
//         </tr>
//       );
//     }
//   }

//   private signalHandler(signalName: string, currentValue) {
//     this.setState(
//       {
//         signalValue: currentValue,
//       },
//       () => {
//         this.props.onValueChange(this.props.signal, currentValue);
//       },
//     );
//   }
// }
