import './NotFound.css';

import * as React from 'react';
import * as DOM from 'react-dom';

export default class NotFound extends React.Component<any, any> {
  constructor(props: any) {
    super(props);
  }

  public render() {
    return (
      <div className="page-container">
        <h1 className="title">404</h1>
        <p className="content"> Oops ! The Page you are looking for can't be found </p>
      </div>
    );
  }
}
