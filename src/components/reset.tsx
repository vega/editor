import * as React from 'react';
import './app.css';

function Reset() {
  const handleClick = () => {
    window.localStorage.clear();
    window.location.href = window.location.pathname;
  };

  return (
    <div className="reset">
      <p>
        Reset the Vega Editor by clearing the local storage. You can run this if the editor is stuck in a loop or
        otherwise not functioning correctly. This operation cannot be undone.
      </p>
      <button onClick={handleClick} type="button">
        Reset Vega Editor
      </button>
    </div>
  );
}

export default Reset;
