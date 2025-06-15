import * as React from 'react';
import './index.css';

interface ErrorPaneProps {
  error?: {message: string};
  errors: string[];
  warns: string[];
  debugs: string[];
  infos: string[];
}

export default function ErrorPane(props: ErrorPaneProps) {
  const list = [];

  let i = 1;

  if (props.error) {
    list.push(
      <li key={0}>
        <span className="error">[Error] </span>
        {props.error.message}
      </li>,
    );
  }

  props.errors.forEach((error) => {
    list.push(
      <li key={i++}>
        <span className="error">[Error] </span>
        {error}
      </li>,
    );
  });
  props.warns.forEach((warning) => {
    list.push(
      <li key={i++}>
        <span className="warning">[Warning] </span>
        {warning}
      </li>,
    );
  });
  props.infos.forEach((info) => {
    list.push(
      <li key={i++}>
        <span className="info">[Info] </span>
        {info}
      </li>,
    );
  });
  if (props.debugs.length > 0) {
    list.push(
      <li key={i++}>
        <span className="debug">[Debug] </span>
        Debug messages are not shown in the editor. Open the browser console to view debug logs.
      </li>,
    );
  }
  if (list.length === 0) {
    list.push(
      <li key={'no error'}>
        <span className="info">[Info] </span>
        No error, infos, or warnings
      </li>,
    );
  }

  return (
    <div className="error-pane">
      <ul>{list}</ul>
    </div>
  );
}
