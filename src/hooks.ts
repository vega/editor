import {TypedUseSelectorHook, useSelector} from 'react-redux';
import {State} from './constants/default-state.js';

export const useAppSelector: TypedUseSelectorHook<State> = useSelector;
