import React from 'react';
import {useAppContext} from '../../context/app-context.js';

const LoginConditional: React.FC<{
  children: React.ReactNode;
}> = ({children}) => {
  const {state} = useAppContext();
  const {isAuthenticated} = state;

  if (isAuthenticated) {
    return <>{children}</>;
  }

  return (
    <div className="login-prompt">
      <h2>Please log in to view your gists.</h2>
      <p>You need to be logged in to view your personal gists.</p>
    </div>
  );
};

export default LoginConditional;
