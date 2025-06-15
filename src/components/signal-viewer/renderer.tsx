import React, {useEffect, useState, useCallback, useRef} from 'react';
import * as vega from 'vega';
import './index.css';
import SignalRow from './signalRow.js';
import TimelineRow from './TimelineRow.js';
import {SignalViewerProps} from './index.js';

interface StoreProps {
  signals: Record<string, any[]>;
  view: vega.View;
  addSignal: (value: any) => void;
  setSignals: (signals: Record<string, any[]>) => void;
  setView: (view: vega.View) => void;
}

type Props = StoreProps & SignalViewerProps;

const UI_UPDATE_THROTTLE_MS = 150;
const SIGNALS_REDUX_DEBOUNCE_MS = 100;

const SignalViewer = ({onClickHandler, signals, view, setSignals}: Props) => {
  const [keys, setKeys] = useState<string[]>([]);
  const [hoverValue, setHoverValue] = useState<Record<string, any>>({});
  const [countSignal, setCountSignal] = useState<Record<string, any>>({});
  const [isTimelineSelected, setIsTimelineSelected] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [maskListener, setMaskListener] = useState(false);
  const [timeline, setTimeline] = useState(false);
  const [currentMaxXCount, setCurrentMaxXCount] = useState(0);
  const xTimelineEventCounterRef = useRef(0);
  const [signalSnapshot, setSignalSnapshot] = useState<Record<string, any>>({});
  const [isStartingRecording, setIsStartingRecording] = useState(false);

  const maxXCountUpdateTimeoutRef = useRef<number | null>(null);
  const pendingSignalUpdatesRef = useRef<Record<string, any[]>>({});
  const signalUpdateDebounceTimeoutRef = useRef<number | null>(null);

  const getKeys = useCallback((currentView: vega.View | null) => {
    if (!currentView) return [];
    try {
      return Object.keys(
        currentView.getState({
          data: vega.falsy,
          signals: vega.truthy,
          recurse: true,
        }).signals,
      );
    } catch (error) {
      console.warn('Error getting signal keys from view state:', error);
      return [];
    }
  }, []);

  const getSignals = useCallback(
    (changedSignal: string | null = null) => {
      if (!timeline || !view) return;

      try {
        if (changedSignal) {
          try {
            const currentVal = view.signal(changedSignal);
            const xForThisDataPoint = xTimelineEventCounterRef.current;

            const record = {
              value: currentVal,
              xCount: xForThisDataPoint,
            };

            const existingHistory = pendingSignalUpdatesRef.current[changedSignal] || signals[changedSignal] || [];
            pendingSignalUpdatesRef.current[changedSignal] = existingHistory.concat(record);

            if (signalUpdateDebounceTimeoutRef.current) {
              clearTimeout(signalUpdateDebounceTimeoutRef.current);
            }

            signalUpdateDebounceTimeoutRef.current = window.setTimeout(() => {
              const newReduxSignalState = {...signals, ...pendingSignalUpdatesRef.current};
              setSignals(newReduxSignalState);
              pendingSignalUpdatesRef.current = {};
              signalUpdateDebounceTimeoutRef.current = null;
            }, SIGNALS_REDUX_DEBOUNCE_MS);

            xTimelineEventCounterRef.current += 1;
            if (maxXCountUpdateTimeoutRef.current) {
              clearTimeout(maxXCountUpdateTimeoutRef.current);
            }
            maxXCountUpdateTimeoutRef.current = window.setTimeout(() => {
              setCurrentMaxXCount(xTimelineEventCounterRef.current);
              maxXCountUpdateTimeoutRef.current = null;
            }, UI_UPDATE_THROTTLE_MS);
          } catch (error) {
            console.warn(`Error handling signal ${changedSignal}:`, error);
          }
        } else {
          const initialPopulationObj: Record<string, any[]> = {};
          const xForInitialSnapshot = xTimelineEventCounterRef.current;
          const currentKeys = getKeys(view);

          currentKeys.forEach((key) => {
            try {
              const value = view.signal(key);
              initialPopulationObj[key] = [{value, xCount: xForInitialSnapshot}];
            } catch (error) {
              console.warn(`Error reading signal ${key}:`, error);
            }
          });

          setSignals(initialPopulationObj);
          pendingSignalUpdatesRef.current = {};

          xTimelineEventCounterRef.current += 1;
          setCurrentMaxXCount(xTimelineEventCounterRef.current);
        }
      } catch (error) {
        console.warn('Error in getSignals:', error);
      }
    },
    [timeline, view, signals, setSignals, setCurrentMaxXCount, getKeys],
  );

  useEffect(() => {
    return () => {
      if (maxXCountUpdateTimeoutRef.current) {
        clearTimeout(maxXCountUpdateTimeoutRef.current);
      }
      if (signalUpdateDebounceTimeoutRef.current) {
        clearTimeout(signalUpdateDebounceTimeoutRef.current);
      }
    };
  }, []);

  const onHoverInit = useCallback(
    (signalKey: string, hValue: any, shouldPersist = false) => {
      if (!signals || Object.keys(signals).length === 0 || !view) return;
      try {
        const hoverObj: Record<string, any> = {
          [signalKey]: hValue.value,
        };
        const countObj: Record<string, any> = {
          [signalKey]: hValue.xCount,
        };

        const currentSignalKeys = Object.keys(signals);

        for (const key of currentSignalKeys) {
          if (key === signalKey) continue;
          if (signals[key] && signals[key].length > 0) {
            let i = 0;
            while (signals[key][i] && signals[key][i].xCount <= hValue.xCount) {
              i++;
            }
            if (i > 0) --i;
            if (signals[key][i]) {
              hoverObj[key] = signals[key][i].value;
              countObj[key] = signals[key][i].xCount;
            } else if (signals[key].length > 0) {
              const lastItem = signals[key][signals[key].length - 1];
              hoverObj[key] = lastItem.value;
              countObj[key] = lastItem.xCount;
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
          setSignalSnapshot(hoverObj);
          if (Object.keys(hoverObj).length > 0) {
            try {
              view.setState({signals: hoverObj});
            } catch (error) {
              console.warn('Error setting view state for hover:', error);
            }
          }
        }
      } catch (error) {
        console.warn('Error in onHoverInit:', error);
      }
    },
    [signals, view, setHoverValue, setIsHovered, setCountSignal, setIsTimelineSelected, setSignalSnapshot],
  );

  const onClickInit = useCallback(
    (key: string, hValue: any) => {
      setMaskListener(true);
      const overlay: HTMLElement | null = document.querySelector('.chart-overlay');
      if (overlay) overlay.style.display = 'block';
      onHoverInit(key, hValue, true);
    },
    [onHoverInit, setMaskListener],
  );

  const resetTimeline = useCallback(() => {
    try {
      const overlay: HTMLElement | null = document.querySelector('.chart-overlay');
      if (overlay) overlay.style.display = 'none';

      const currentValueObj: Record<string, any> = {};

      if (view && keys.length > 0 && signals) {
        const currentKeys = getKeys(view);

        currentKeys.forEach((signal) => {
          try {
            if (signals[signal] && signals[signal].length > 0) {
              currentValueObj[signal] = signals[signal][signals[signal].length - 1].value;
            } else {
              const currentSignalValue = view.signal(signal);
              if (currentSignalValue !== undefined) {
                currentValueObj[signal] = currentSignalValue;
              }
            }
          } catch (e) {
            console.warn(`Could not get signal ${signal} from view on resetTimeline`, e);
          }
        });

        if (Object.keys(currentValueObj).length > 0) {
          try {
            view.setState({signals: currentValueObj});
          } catch (error) {
            console.warn('Error setting view state on resetTimeline:', error);
          }
        }
      }

      setIsTimelineSelected(false);
      setSignalSnapshot({});
      setHoverValue({});
      setIsHovered(false);
      setMaskListener(false);
    } catch (error) {
      console.warn('Error in resetTimeline:', error);
    }
  }, [
    keys,
    signals,
    view,
    setIsTimelineSelected,
    setSignalSnapshot,
    setHoverValue,
    setIsHovered,
    setMaskListener,
    getKeys,
  ]);

  useEffect(() => {
    if (view) {
      try {
        const newKeys = getKeys(view);
        setKeys(newKeys);

        if (timeline && !maskListener) {
          if (signalUpdateDebounceTimeoutRef.current) {
            clearTimeout(signalUpdateDebounceTimeoutRef.current);
            signalUpdateDebounceTimeoutRef.current = null;
          }

          if (maxXCountUpdateTimeoutRef.current) {
            clearTimeout(maxXCountUpdateTimeoutRef.current);
            maxXCountUpdateTimeoutRef.current = null;
          }

          xTimelineEventCounterRef.current = 0;
          setCurrentMaxXCount(0);
          pendingSignalUpdatesRef.current = {};

          setTimeout(() => {
            setIsStartingRecording(true);
          }, 0);
        }
      } catch (error) {
        console.warn('Error initializing signal viewer with new view:', error);
      }
    } else {
      setKeys([]);
    }
  }, [view, getKeys, timeline, maskListener]);

  useEffect(() => {
    if (view) {
      setKeys(getKeys(view));
    }
  }, [getKeys, view, signals]);

  const getSignalsRef = useRef(getSignals);
  useEffect(() => {
    getSignalsRef.current = getSignals;
  }, [getSignals]);

  useEffect(() => {
    if (timeline && !maskListener && isStartingRecording) {
      getSignalsRef.current();
      setIsStartingRecording(false);
    }
  }, [timeline, maskListener, isStartingRecording]);

  const valueChange = useCallback(
    (key: string) => {
      if (timeline && !maskListener) {
        try {
          getSignalsRef.current(key);
        } catch (error) {
          console.warn(`Error handling value change for signal ${key}:`, error);
        }
      }
    },
    [timeline, maskListener],
  );

  return (
    <>
      <div className="timeline-control-buttons">
        <button
          style={{
            backgroundColor: timeline ? 'red' : '',
            color: timeline ? 'white' : 'black',
          }}
          onClick={() => {
            const newTimelineState = !timeline;
            setTimeline(newTimelineState);
            if (newTimelineState) {
              xTimelineEventCounterRef.current = 0;
              setCurrentMaxXCount(0);
              pendingSignalUpdatesRef.current = {};
              if (signalUpdateDebounceTimeoutRef.current) {
                clearTimeout(signalUpdateDebounceTimeoutRef.current);
                signalUpdateDebounceTimeoutRef.current = null;
              }
              if (maxXCountUpdateTimeoutRef.current) {
                clearTimeout(maxXCountUpdateTimeoutRef.current);
                maxXCountUpdateTimeoutRef.current = null;
              }
              setSignals({});
              setIsStartingRecording(true);
            } else {
              resetTimeline();
              setIsStartingRecording(false);
            }
          }}
        >
          {timeline ? 'Stop Recording & Reset' : 'Record signal changes'}
        </button>
        {timeline && !maskListener && currentMaxXCount > 1 && (
          <button
            onClick={() => {
              xTimelineEventCounterRef.current = 0;
              setCurrentMaxXCount(0);
              pendingSignalUpdatesRef.current = {};
              if (signalUpdateDebounceTimeoutRef.current) {
                clearTimeout(signalUpdateDebounceTimeoutRef.current);
                signalUpdateDebounceTimeoutRef.current = null;
              }
              if (maxXCountUpdateTimeoutRef.current) {
                clearTimeout(maxXCountUpdateTimeoutRef.current);
                maxXCountUpdateTimeoutRef.current = null;
              }
              setSignals({});
              setIsStartingRecording(true);
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
            {keys.map((signal) => (
              <SignalRow
                isHovered={isHovered}
                isTimelineSelected={isTimelineSelected}
                clickedSignal={signalSnapshot[signal]}
                hoverValue={hoverValue[signal]}
                maskListener={maskListener}
                onValueChange={valueChange}
                key={signal}
                signal={signal}
                view={view}
                timeline={timeline}
                onClickHandler={onClickHandler}
              >
                {timeline && signals && signals[signal] && (
                  <TimelineRow
                    onHoverInit={(hValue) => onHoverInit(signal, hValue)}
                    onClickInit={(hValue) => onClickInit(signal, hValue)}
                    onHoverEnd={() => {
                      setHoverValue({});
                      setIsHovered(false);
                    }}
                    isTimelineSelected={isTimelineSelected}
                    clickedValue={countSignal[signal]}
                    data={signals[signal]}
                    width={typeof window !== 'undefined' ? window.innerWidth * 0.3 : 300}
                    xCount={currentMaxXCount}
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
