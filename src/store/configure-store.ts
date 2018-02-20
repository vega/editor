import { applyMiddleware, compose, createStore } from 'redux';
import persistState from 'redux-localstorage';
import thunk from 'redux-thunk';

import rootReducer from '../reducers';
import { DEFAULT_STATE } from './../constants/default-state';

export default function configureStore(initialState = DEFAULT_STATE) {
  // Compose final middleware
  let middleware = applyMiddleware(thunk);

  const enhancer = compose(middleware, persistState());

  // Create final store
  const store = createStore(rootReducer, initialState, enhancer);

  if ((<any>module).hot) {
    (<any>module).hot.accept('../reducers', () => {
      const nextRootReducer = require('../reducers').default;

      store.replaceReducer(nextRootReducer);
    });
  }
  return store;
}
