import {TypedUseSelectorHook, useSelector} from 'react-redux';
import {State} from './constants/default-state';

export const useAppSelector: TypedUseSelectorHook<State> = useSelector;
