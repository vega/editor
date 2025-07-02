import React from 'react';
import {useAppContext} from '../../context/app-context.js';
import {BACKEND_URL} from '../../constants/index.js';
const LoginConditional: React.FC<{
  children: React.ReactNode;
}> = ({children}) => {
  const {state} = useAppContext();
  const {isAuthenticated} = state;

  const signIn = () => {
    const popup = window.open(`${BACKEND_URL}auth/github`, 'github-login', 'width=600,height=600,resizable=yes');
    if (popup) {
      popup.focus();
    } else {
      window.location.href = `${BACKEND_URL}auth/github`;
    }
  };

  if (isAuthenticated) {
    return <>{children}</>;
  }

  return (
    <div className="login-prompt">
      <p>
        <a style={{cursor: 'pointer', textDecoration: 'underline'}} onClick={signIn}>
          Login with GitHub
        </a>{' '}
        to use the Gist feature.
      </p>
    </div>
  );
};

export default LoginConditional;
