import * as React from 'react';
import {mapStateToProps} from './index.js';
import './index.css';
import {useSelector} from 'react-redux';
import {State} from '../../constants/default-state.js';

export default function ErrorPane() {
  const props = useSelector((state: State) => mapStateToProps(state));

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
    <li key={i++}>
      <span className="debug">[Debug] </span>
      Debug messages are not shown in the editor. Open the browser console to view debug logs.
    </li>;
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

// export default class ErrorPane extends React.Component<Props> {
//   public render() {
//     const list = [];

//     let i = 1;

//     if (this.props.error) {
//       list.push(
//         <li key={0}>
//           <span className="error">[Error] </span>
//           {this.props.error.message}
//         </li>,
//       );
//     }

//     this.props.errors.forEach((error) => {
//       list.push(
//         <li key={i++}>
//           <span className="error">[Error] </span>
//           {error}
//         </li>,
//       );
//     });
//     this.props.warns.forEach((warning) => {
//       list.push(
//         <li key={i++}>
//           <span className="warning">[Warning] </span>
//           {warning}
//         </li>,
//       );
//     });
//     this.props.infos.forEach((info) => {
//       list.push(
//         <li key={i++}>
//           <span className="info">[Info] </span>
//           {info}
//         </li>,
//       );
//     });
//     if (this.props.debugs.length > 0) {
//       <li key={i++}>
//         <span className="debug">[Debug] </span>
//         Debug messages are not shown in the editor. Open the browser console to view debug logs.
//       </li>;
//     }
//     if (list.length === 0) {
//       list.push(
//         <li key={'no error'}>
//           <span className="info">[Info] </span>
//           No error, infos, or warnings
//         </li>,
//       );
//     }

//     return (
//       <div className="error-pane">
//         <ul>{list}</ul>
//       </div>
//     );
//   }
// }
