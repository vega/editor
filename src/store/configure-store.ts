import {applyMiddleware, compose, createStore} from 'redux';
import persistState from 'redux-localstorage';
import thunk from 'redux-thunk';

import rootReducer from '../reducers';
import {DEFAULT_STATE} from './../constants/default-state';

export default function configureStore(initialState = DEFAULT_STATE) {
  // Compose final middleware
  const middleware = applyMiddleware(thunk);

  // https://github.com/zalmoxisus/redux-devtools-extension#usage
  const composeEnhancers = (<any>window).__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;

  const enhancer = composeEnhancers(middleware, persistState());

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
