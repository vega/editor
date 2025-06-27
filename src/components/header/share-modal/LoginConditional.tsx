import React from 'react';
import {useAppSelector} from '../../../hooks.js';

const LoginConditional: React.FC<{
  children: React.ReactNode;
}> = ({children}) => {
  const isAuthenticated = useAppSelector((state) => state.isAuthenticated);

  if (isAuthenticated) {
    return <>{children}</>;
  }

  return (
    <div className="login-prompt">
      <h2>Please log in to use this feature.</h2>
      <p>You need to be logged in to create and update gists.</p>
    </div>
  );
};

export default LoginConditional;
