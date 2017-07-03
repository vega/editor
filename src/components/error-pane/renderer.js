import React from 'react';

import './index.css';

export default class ErrorPane extends React.Component {
  render() {
    let list = [];
    let warnings = this.props.warningsLogger.warns;
    if (warnings.length > 0) {
      for (let i = 0; i < warnings.length; i++) {
        list.push(<li key={i}><span className='warning'>[Warning] </span>{warnings[i]}</li>);
      }
    }
    if (this.props.error) {
      list.push(<li key={warnings.length}><span className='error'>[Error] </span>{this.props.error}</li>);
    }
    if (list.length === 0) {
      list.push(<li key={'no error'}><span className='info'>[Info] </span>No error or warnings</li>);
    } 
    return (
      <div className='error-pane'>
        <span onClick={(e) => this.props.showErrorPane()} className='close'>
          &#10006;
        </span>
        <ul>
          {list}
        </ul>
      </div>
    );
  }
}
