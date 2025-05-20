import * as React from 'react';
import {useNavigate, useParams, useLocation, Location, NavigateFunction, Params} from 'react-router';

// Create interfaces for the history and match objects that match the v5 API
interface HistoryLike {
  push: NavigateFunction;
  location: Location;
}

interface MatchLike {
  params: Params;
}

// Create a HOC to provide v5-like props to class components
export function withRouter<P extends object>(
  Component: React.ComponentType<P & {history: HistoryLike; match: MatchLike}>,
) {
  return function ComponentWithRouterProp(props: P) {
    const location = useLocation();
    const navigate = useNavigate();
    const params = useParams();

    const history = {
      push: navigate,
      location,
    };

    const match = {
      params,
    };

    return <Component {...props} history={history} match={match} />;
  };
}
