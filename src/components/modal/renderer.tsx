import './index.css';

import * as React from 'react';
import { X } from 'react-feather';
import { PortalWithState } from 'react-portal';

interface Props {
  button?: any;
  header?: any;
  content?: any;

  onOpen?: () => void;
}

export default class Modal extends React.PureComponent<Props> {
  public render() {
    return (
      <PortalWithState closeOnEsc onOpen={this.props.onOpen}>
        {({ openPortal, closePortal, isOpen, portal }) => [
          <span key="0" onClick={openPortal}>
            {this.props.button}
          </span>,
          portal(
            <div className="modal-background" onClick={closePortal}>
              <div className="modal" onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                  {this.props.header}
                  <button className="close-button" onClick={closePortal}>
                    <X />
                  </button>
                </div>
                <div className="modal-body">{this.props.content}</div>
                <div className="modal-footer" />
              </div>
            </div>
          ),
        ]}
      </PortalWithState>
    );
  }
}
