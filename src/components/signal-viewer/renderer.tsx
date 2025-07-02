import * as React from 'react';
import {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import * as vega from 'vega';
import {useAppContext} from '../../context/app-context.js';
import './index.css';
import SignalRow from './signalRow.js';
import TimelineRow from './TimelineRow.js';

interface OwnProps {
  onClickHandler: (header: string) => void;
}

const SignalViewer: React.FC<OwnProps> = ({onClickHandler}) => {
  const {state, setState} = useAppContext();
  const {signals, view} = state;

  const setSignals = useCallback((payload) => setState((s) => ({...s, signals: payload})), [setState]);

  const [countSignal, setCountSignal] = useState({});
  const [hoverValue, setHoverValue] = useState({});
  const [isTimelineSelected, setIsTimelineSelected] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [maskListener, setMaskListener] = useState(false);
  const [signal, setSignal] = useState({});
  const [xCount, setXCount] = useState(0);
  const [timeline, setTimeline] = useState(false);
  const throttleTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const keys = useMemo(() => {
    if (!view) return [];
    return Object.keys(
      view.getState({
        data: vega.falsy,
        signals: vega.truthy,
        recurse: true,
      }).signals,
    );
  }, [view]);

  const getSignals = useCallback(
    (changedSignal: string | null = null) => {
      if (!timeline) {
        return;
      }

      const newSignals = {...signals};
      const newXCount = xCount + 1;

      if (changedSignal) {
        const obj = {
          value: view.signal(changedSignal),
          xCount: newXCount,
        };
        newSignals[changedSignal] = newSignals[changedSignal] ? [...newSignals[changedSignal], obj] : [obj];
      } else {
        keys.forEach((key) => {
          newSignals[key] = [{value: view.signal(key), xCount: newXCount}];
        });
      }

      setSignals(newSignals);
      setXCount(newXCount);
    },
    [timeline, view, xCount, signals, keys, setSignals],
  );

  useEffect(() => {
    if (view) {
      setSignal({});
      setXCount(0);
      setTimeline(false);
      setIsHovered(false);
      setIsTimelineSelected(false);
      setHoverValue({});
      setCountSignal({});
      setMaskListener(false);

      const overlay: HTMLElement = document.querySelector('.chart-overlay');
      if (overlay) {
        overlay.style.display = 'none';
      }
    }
  }, [view]);

  const resetTimeline = useCallback(() => {
    const overlay: HTMLElement = document.querySelector('.chart-overlay');
    if (overlay) {
      overlay.style.display = 'none';
    }
    const currentValueObj = {};
    if (signals) {
      keys.forEach((sig) => {
        if (signals[sig] && signals[sig].length > 0) {
          currentValueObj[sig] = signals[sig][signals[sig].length - 1].value;
        }
      });
    }
    if (view) {
      view.setState({signals: currentValueObj});
    }

    setIsTimelineSelected(false);
    setSignal({});
    setCountSignal({});
    setHoverValue({});
    setIsHovered(false);

    setMaskListener(false);
  }, [keys, signals, view]);

  const onHoverInit = useCallback(
    (signalKey, hValue, shouldPersist = false) => {
      const hoverObj = {
        [signalKey]: hValue.value,
      };
      const countObj = {
        [signalKey]: hValue.xCount,
      };

      for (const key in signals) {
        if (Object.prototype.hasOwnProperty.call(signals, key)) {
          let i = 0;
          while (signals[key][i] && signals[key][i].xCount <= hValue.xCount) {
            i++;
          }
          --i;
          if (i >= 0) {
            hoverObj[key] = signals[key][i].value;
            countObj[key] = signals[key][i].xCount;
          }
        }
      }
      if (!shouldPersist) {
        setHoverValue(hoverObj);
        setIsHovered(true);
      } else {
        setCountSignal(countObj);
        setHoverValue({});
        setIsTimelineSelected(true);
        setIsHovered(false);
        setSignal(hoverObj);
        view.setState({signals: hoverObj});
      }
    },
    [signals, view],
  );

  const onClickInit = useCallback(
    (key, hValue) => {
      setMaskListener(true);
      const overlay: HTMLElement = document.querySelector('.chart-overlay');
      if (overlay) {
        overlay.style.display = 'block';
      }
      onHoverInit(key, hValue, true);
    },
    [onHoverInit],
  );

  const valueChange = useCallback(
    (key: string) => {
      if (throttleTimeoutRef.current) {
        return;
      }
      if (timeline && !maskListener) {
        getSignals(key);
        throttleTimeoutRef.current = setTimeout(() => {
          if (throttleTimeoutRef.current) {
            throttleTimeoutRef.current = null;
          }
        }, 50);
      }
    },
    [timeline, maskListener, getSignals],
  );

  useEffect(() => {
    return () => {
      if (throttleTimeoutRef.current) {
        clearTimeout(throttleTimeoutRef.current);
      }
    };
  }, []);

  return (
    <>
      <div className="timeline-control-buttons">
        <button
          style={{
            backgroundColor: timeline ? 'red' : '',
            color: timeline ? 'white' : 'black',
          }}
          onClick={() => {
            const newTimeline = !timeline;
            setTimeline(newTimeline);
            if (newTimeline) {
              setXCount(0);
              setSignals({});
              const obj = {};
              keys.forEach((key) => {
                obj[key] = [{value: view.signal(key), xCount: 0}];
              });
              setSignals(obj);
              setXCount(1);
            } else {
              resetTimeline();
            }
          }}
        >
          {timeline ? 'Stop Recording & Reset' : 'Record signal changes'}
        </button>
        {timeline && !maskListener && xCount > 1 && (
          <button
            onClick={() => {
              setXCount(0);
              setSignals({});
              const obj = {};
              keys.forEach((key) => {
                obj[key] = [{value: view.signal(key), xCount: 0}];
              });
              setSignals(obj);
              setXCount(1);
            }}
          >
            Clear Timeline
          </button>
        )}
        {maskListener && timeline && <button onClick={resetTimeline}>Continue Recording</button>}
      </div>
      <div className="signal-viewer">
        <table className="editor-table">
          <thead>
            <tr>
              <th>Signal</th>
              {timeline && <th>Timeline</th>}
              <th>Value</th>
            </tr>
          </thead>
          <tbody>
            {view &&
              keys.map((s) => (
                <SignalRow
                  isHovered={isHovered}
                  isTimelineSelected={isTimelineSelected}
                  clickedSignal={signal[s]}
                  hoverValue={hoverValue[s]}
                  maskListener={maskListener}
                  onValueChange={valueChange}
                  key={s}
                  signal={s}
                  view={view}
                  timeline={timeline}
                  onClickHandler={onClickHandler}
                >
                  {timeline && (
                    <TimelineRow
                      onHoverInit={(hValue) => onHoverInit(s, hValue)}
                      onClickInit={(hValue) => onClickInit(s, hValue)}
                      onHoverEnd={() => {
                        setHoverValue({});
                        setIsHovered(false);
                      }}
                      isTimelineSelected={isTimelineSelected}
                      clickedValue={countSignal[s]}
                      data={signals[s]}
                      width={window.innerWidth * 0.3}
                      xCount={xCount}
                    />
                  )}
                </SignalRow>
              ))}
          </tbody>
        </table>
      </div>
    </>
  );
};

export default SignalViewer;
