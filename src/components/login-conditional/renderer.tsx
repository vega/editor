import React from 'react';
import {useAppSelector} from '../../hooks.js';
import {BACKEND_URL} from '../../constants/index.js';

type Props = {
  children?: React.ReactNode;
};

const LoginConditional = (props: Props) => {
  const isAuthenticated = useAppSelector((state) => state.isAuthenticated);

  if (isAuthenticated) {
    return <>{props.children}</>;
  }

  return (
    <span>
      <a href={`${BACKEND_URL}auth/github`}>Login with GitHub</a> to use the Gist feature.
    </span>
  );
};

export default LoginConditional;
