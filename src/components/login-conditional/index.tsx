import React from 'react';
import {useAppContext} from '../../context/app-context.js';
import {BACKEND_URL} from '../../constants/index.js';

type Props = {children?: React.ReactNode};

const LoginConditional: React.FC<Props> = ({children}) => {
  const {state} = useAppContext();
  const {isAuthenticated} = state;

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

  if (isAuthenticated) {
    return <>{children}</>;
  }

  return (
    <div className="login-prompt">
      <p>
        <a
          href={`${BACKEND_URL}auth/github`}
          onClick={handleLogin}
          style={{cursor: 'pointer', textDecoration: 'underline'}}
        >
          Login with GitHub
        </a>{' '}
        to use the Gist feature.
      </p>
    </div>
  );
};

export default LoginConditional;
