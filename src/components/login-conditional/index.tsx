import React from 'react';
import {useAppSelector} from '../../hooks.js';
import {BACKEND_URL} from '../../constants/index.js';

type Props = {children?: React.ReactNode};

const LoginConditional: React.FC<Props> = ({children}) => {
  const isAuthenticated = useAppSelector((state) => state.isAuthenticated);

  const handleLogin = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();

    const popup = window.open(`${BACKEND_URL}auth/github`, 'github-login', 'width=600,height=600,resizable=yes');
    if (popup) {
      popup.focus();
    } else {
      window.location.href = `${BACKEND_URL}auth/github`;
    }

    return false;
  };

  const githubLink = (
    <a href={`${BACKEND_URL}auth/github`} onClick={handleLogin}>
      Login with GitHub
    </a>
  );

  return <>{isAuthenticated ? children : <span>{githubLink} to use the Gist feature.</span>}</>;
};

export default LoginConditional;
