import React, {useEffect, useState, useCallback, useRef} from 'react';
import * as vega from 'vega';
import {useDispatch, useSelector} from 'react-redux';
import {mapDispatchToProps, mapStateToProps} from './index.js';
import './index.css';
import SignalRow from './signalRow.js';
import TimelineRow from './TimelineRow.js';
import {State} from '../../constants/default-state.js';

type StoreProps = ReturnType<typeof mapStateToProps> & ReturnType<typeof mapDispatchToProps>;

interface OwnComponentProps {
  onClickHandler: (header: string) => void;
}

type Props = StoreProps & OwnComponentProps;

const UI_UPDATE_THROTTLE_MS = 150; // Interval for UI updates of timeline scale (currentMaxXCount)
const SIGNALS_REDUX_DEBOUNCE_MS = 100; // Debounce for updating signals in Redux store

const SignalViewer = ({onClickHandler}: Props) => {
  const dispatch = useDispatch();
  // It's generally better to select only the needed parts of the state directly with useSelector
  // to avoid re-renders if other parts of mapStateToProps change but signals/view don't.
  // However, given the existing structure, we'll proceed.
  const reduxState = useSelector((state: State) => mapStateToProps(state));
  const {view, signals} = reduxState;
  const boundActions = mapDispatchToProps(dispatch);
  const {setSignals: setReduxSignals} = boundActions;

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

      if (changedSignal) {
        const currentVal = view.signal(changedSignal);
        const xForThisDataPoint = xTimelineEventCounterRef.current;

        const record = {
          value: currentVal,
          xCount: xForThisDataPoint,
        };

        // Accumulate updates
        const existingHistory = pendingSignalUpdatesRef.current[changedSignal] || signals[changedSignal] || [];
        pendingSignalUpdatesRef.current[changedSignal] = existingHistory.concat(record);

        // Clear existing debounce timeout
        if (signalUpdateDebounceTimeoutRef.current) {
          clearTimeout(signalUpdateDebounceTimeoutRef.current);
        }

        // Set new debounce timeout to dispatch accumulated signals to Redux
        signalUpdateDebounceTimeoutRef.current = window.setTimeout(() => {
          // Merge with current Redux signals to ensure no lost updates if new signals were added by other means
          // though ideally, all updates to 'signals' would go through this debounced path during recording.
          const newReduxSignalState = {...signals, ...pendingSignalUpdatesRef.current};
          setReduxSignals(newReduxSignalState);
          pendingSignalUpdatesRef.current = {}; // Clear pending updates after dispatch
          signalUpdateDebounceTimeoutRef.current = null;
        }, SIGNALS_REDUX_DEBOUNCE_MS);

        // Increment event counter and schedule UI update for timeline scale (throttled)
        xTimelineEventCounterRef.current += 1;
        if (maxXCountUpdateTimeoutRef.current) {
          clearTimeout(maxXCountUpdateTimeoutRef.current);
        }
        maxXCountUpdateTimeoutRef.current = window.setTimeout(() => {
          setCurrentMaxXCount(xTimelineEventCounterRef.current);
          maxXCountUpdateTimeoutRef.current = null;
        }, UI_UPDATE_THROTTLE_MS);
      } else {
        // Initial population (isStartingRecording effect)
        const initialPopulationObj: Record<string, any[]> = {};
        const xForInitialSnapshot = xTimelineEventCounterRef.current;
        const currentKeys = getKeys(view); // Get fresh keys here

        currentKeys.forEach((key) => {
          initialPopulationObj[key] = [{value: view.signal(key), xCount: xForInitialSnapshot}];
        });
        setReduxSignals(initialPopulationObj); // Direct update for initial population
        pendingSignalUpdatesRef.current = {}; // Clear any pending updates

        xTimelineEventCounterRef.current += 1;
        setCurrentMaxXCount(xTimelineEventCounterRef.current); // Update UI immediately for initial
      }
    },
    [timeline, view, signals, setReduxSignals, setCurrentMaxXCount, getKeys],
  ); // Added getKeys

  // Cleanup timeouts on unmount
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
      const hoverObj: Record<string, any> = {
        [signalKey]: hValue.value,
      };
      const countObj: Record<string, any> = {
        [signalKey]: hValue.xCount,
      };

      // Use fresh keys for iteration to ensure consistency with current view state
      const currentSignalKeys = Object.keys(signals);

      for (const key of currentSignalKeys) {
        // Changed to 'for...of' for iterating keys array
        if (key === signalKey) continue; // Already handled
        if (signals[key] && signals[key].length > 0) {
          let i = 0;
          // Find the record whose xCount is closest to or less than hValue.xCount
          while (signals[key][i] && signals[key][i].xCount <= hValue.xCount) {
            i++;
          }
          if (i > 0) --i;
          if (signals[key][i]) {
            hoverObj[key] = signals[key][i].value;
            countObj[key] = signals[key][i].xCount;
          } else if (signals[key].length > 0) {
            // Fallback to last known if search goes out of bounds
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
    const overlay: HTMLElement | null = document.querySelector('.chart-overlay');
    if (overlay) overlay.style.display = 'none';

    const currentValueObj: Record<string, any> = {};
    if (view && keys.length > 0 && signals) {
      const currentKeys = getKeys(view); // Use fresh keys
      currentKeys.forEach((signal) => {
        if (signals[signal] && signals[signal].length > 0) {
          currentValueObj[signal] = signals[signal][signals[signal].length - 1].value;
        } else {
          try {
            const currentSignalValue = view.signal(signal);
            if (currentSignalValue !== undefined) {
              currentValueObj[signal] = currentSignalValue;
            }
          } catch (e) {
            console.warn(`Could not get signal ${signal} from view on resetTimeline`);
          }
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
    // Reset counters and Redux state for signals
    xTimelineEventCounterRef.current = 0;
    setCurrentMaxXCount(0);
    setReduxSignals({});
    pendingSignalUpdatesRef.current = {};
    if (signalUpdateDebounceTimeoutRef.current) {
      clearTimeout(signalUpdateDebounceTimeoutRef.current);
      signalUpdateDebounceTimeoutRef.current = null;
    }
    if (maxXCountUpdateTimeoutRef.current) {
      clearTimeout(maxXCountUpdateTimeoutRef.current);
      maxXCountUpdateTimeoutRef.current = null;
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
    setReduxSignals,
    setCurrentMaxXCount,
  ]);

  useEffect(() => {
    if (view) {
      setKeys(getKeys(view));
    }
  }, [getKeys, view, signals]); // Added signals, as keys might change if signals are added/removed externally

  const getSignalsRef = useRef(getSignals);
  useEffect(() => {
    getSignalsRef.current = getSignals;
  }, [getSignals]);

  useEffect(() => {
    if (timeline && !maskListener && isStartingRecording) {
      getSignalsRef.current(); // Initial population
      setIsStartingRecording(false);
    }
  }, [timeline, maskListener, isStartingRecording]); // Removed getSignalsRef as it's stable from its own useEffect

  const valueChange = useCallback(
    (key: string, _value: any) => {
      if (timeline && !maskListener) {
        getSignalsRef.current(key); // This will now use the debounced mechanism
      }
    },
    [timeline, maskListener],
  ); // Removed getSignalsRef

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
              // Starting recording
              // Reset counters, clear pending Redux updates, and set flag for initial population
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
              setReduxSignals({}); // Clear Redux store for signals immediately
              setIsStartingRecording(true); // This will trigger the 'else' branch of getSignals for initial population
            } else {
              // Stopping recording
              resetTimeline();
              setIsStartingRecording(false);
            }
          }}
        >
          {timeline ? 'Stop Recording & Reset' : 'Record signal changes'}
        </button>
        {timeline && !maskListener && currentMaxXCount > 0 && (
          <button
            onClick={() => {
              // Clear timeline: Reset counters, Redux state, and pending updates
              xTimelineEventCounterRef.current = 0;
              setCurrentMaxXCount(0);
              setReduxSignals({});
              pendingSignalUpdatesRef.current = {};
              if (signalUpdateDebounceTimeoutRef.current) {
                clearTimeout(signalUpdateDebounceTimeoutRef.current);
                signalUpdateDebounceTimeoutRef.current = null;
              }
              if (maxXCountUpdateTimeoutRef.current) {
                clearTimeout(maxXCountUpdateTimeoutRef.current);
                maxXCountUpdateTimeoutRef.current = null;
              }
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
                onValueChange={valueChange} // valueChange is stable due to its dependencies
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
                    data={signals[signal]} // Receives debounced Redux signals
                    width={typeof window !== 'undefined' ? window.innerWidth * 0.3 : 300}
                    xCount={currentMaxXCount} // Receives throttled UI count for scale
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
