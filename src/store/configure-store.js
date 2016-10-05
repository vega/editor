import { applyMiddleware, compose, createStore } from 'redux';
import { routerMiddleware } from 'react-router-redux';
import thunk from 'redux-thunk';
import rootReducer from '../reducers';

export default function configureStore (browserHistory, initialState = {}) {
  // Compose final middleware and use devtools in debug environment
  let middleware = applyMiddleware(thunk);
  middleware = compose(middleware, applyMiddleware(routerMiddleware(browserHistory)));

  if (process.env.NODE_ENV !== 'production') {
    const devTools = require('../components/debug/dev-tools').default.instrument();
    middleware = compose(middleware, devTools);
  }

  // Create final store and subscribe router in debug env ie. for devtools
  const store = middleware(createStore)(rootReducer, initialState);

  if (module.hot) {
    module.hot.accept('../reducers', () => {
      const nextRootReducer = require('../reducers').default;

      store.replaceReducer(nextRootReducer);
    });
  }
  return store;
}
