import {TypedUseSelectorHook, useDispatch, useSelector} from 'react-redux';
import {State} from './constants/default-state.js';

export const useAppDispatch = () => useDispatch();
export const useAppSelector: TypedUseSelectorHook<State> = useSelector;
