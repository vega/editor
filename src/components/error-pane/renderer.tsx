import * as React from 'react';
import './index.css';

interface ErrorPaneProps {
  error?: {message: string};
  errors: string[];
  warns: string[];
  debugs: string[];
  infos: string[];
}

const ErrorPane: React.FC<ErrorPaneProps> = ({error, errors, warns, infos, debugs}) => {
  const hasMessages = error || errors.length > 0 || warns.length > 0 || infos.length > 0 || debugs.length > 0;

  return (
    <div className="error-pane">
      <ul>
        {error && (
          <li key="error">
            <span className="error">[Error] </span>
            {error.message}
          </li>
        )}
        {errors.map((errorMsg, i) => (
          <li key={`error-${i}`}>
            <span className="error">[Error] </span>
            {errorMsg}
          </li>
        ))}
        {warns.map((warning, i) => (
          <li key={`warning-${i}`}>
            <span className="warning">[Warning] </span>
            {warning}
          </li>
        ))}
        {infos.map((info, i) => (
          <li key={`info-${i}`}>
            <span className="info">[Info] </span>
            {info}
          </li>
        ))}
        {debugs.length > 0 && (
          <li key="debug">
            <span className="debug">[Debug] </span>
            Debug messages are not shown in the editor. Open the browser console to view debug logs.
          </li>
        )}
        {!hasMessages && (
          <li key="no-messages">
            <span className="info">[Info] </span>
            No error, infos, or warnings
          </li>
        )}
      </ul>
    </div>
  );
};

export default ErrorPane;
