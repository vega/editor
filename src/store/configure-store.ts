import { applyMiddleware, compose, createStore } from 'redux';
import persistState from 'redux-localstorage';
import thunk from 'redux-thunk';

import rootReducer from '../reducers';
import { DEFAULT_STATE } from './../constants/default-state';

export default function configureStore(initialState = DEFAULT_STATE) {
  // Compose final middleware
  const middleware = applyMiddleware(thunk);

  // https://github.com/zalmoxisus/redux-devtools-extension#usage
  const composeEnhancers = (window as any).__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;

  // Subset of state to store in localStorage
  const paths = Object.keys(DEFAULT_STATE).filter(e => e !== 'dataSets');
  const enhancer = composeEnhancers(middleware, persistState(paths));

  // Create final store
  const store = createStore(rootReducer, initialState, enhancer);

  if ((module as any).hot) {
    (module as any).hot.accept('../reducers', () => {
      const nextRootReducer = require('../reducers').default;

      store.replaceReducer(nextRootReducer);
    });
  }
  return store;
}
