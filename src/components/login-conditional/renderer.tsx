import React from 'react';
import {useSelector} from 'react-redux';
import {State} from '../../constants/default-state.js';
import {BACKEND_URL} from '../../constants/index.js';

type Props = {
  children?: React.ReactNode;
};

const handleLogin = (e: React.MouseEvent<HTMLAnchorElement>) => {
  e.preventDefault();
  window.location.href = `${BACKEND_URL}auth/github`;
};

const LoginConditional = (props: Props) => {
  const isAuthenticated = useSelector((state: State) => state.isAuthenticated);
  const githubLink = (
    <a href={`${BACKEND_URL}auth/github`} onClick={handleLogin}>
      Login with GitHub
    </a>
  );

  if (isAuthenticated) {
    return <>{props.children}</>;
  }

  return <span>{githubLink} to use the Gist feature.</span>;
};

export default LoginConditional;
