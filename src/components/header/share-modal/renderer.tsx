import LZString from 'lz-string';
import * as React from 'react';
import Clipboard from 'react-clipboard.js';
import { Copy, Link } from 'react-feather';
import { withRouter } from 'react-router-dom';
import { mapStateToProps } from '.';
import './index.css';

type Props = ReturnType<typeof mapStateToProps>;

interface State {
  copied: boolean;
  fullScreen: boolean;
  generatedURL: string;
}

class ShareModal extends React.PureComponent<Props, State> {
  constructor(props) {
    super(props);
    this.state = {
      copied: false,
      fullScreen: false,
      generatedURL: '',
    };
  }

  public exportURL() {
    const serializedSpec =
      LZString.compressToEncodedURIComponent(this.props.editorString) + (this.state.fullScreen ? '/view' : '');
    if (serializedSpec) {
      const url = `${document.location.href.split('#')[0]}#/url/${this.props.mode}/${serializedSpec}`;
      this.setState({ generatedURL: url });
    }
  }

  public previewURL() {
    const win = window.open(this.state.generatedURL, '_blank');
    win.focus();
  }

  public onCopy() {
    this.setState({
      copied: true,
    });
  }

  public handleCheck(event) {
    this.setState({ fullScreen: event.target.checked }, () => {
      this.exportURL();
    });
  }

  public componentDidMount() {
    this.exportURL();
  }

  public componentDidUpdate(prevProps, prevState) {
    if (this.state.copied) {
      setTimeout(() => {
        this.setState({ copied: false });
      }, 2500);
    }
  }

  public render() {
    return (
      <div className="share-content">
        <h2>Share</h2>
        <p>We pack the Vega or Vega-Lite specification and an encoded string in the URL.</p>
        <p>We use LZ-based compression algorithm and preserve indentation, newlines, and other whitespace.</p>
        <div className="user-pref">
          <label>
            Link opens visualization in fullscreen:
            <input
              type="checkbox"
              defaultChecked={this.state.fullScreen}
              name="fullscreen"
              onChange={this.handleCheck.bind(this)}
            />
          </label>
        </div>
        <div className="share-buttons">
          <button className="share-button" onClick={() => this.previewURL()}>
            <Link />
            <span>Open Link</span>
          </button>
          <Clipboard
            className="share-button copy-icon"
            data-clipboard-text={this.state.generatedURL}
            onSuccess={this.onCopy.bind(this)}
          >
            <span>
              <Copy />
              Copy to Clipboard
            </span>
          </Clipboard>
          <div className={`copied + ${this.state.copied ? ' visible' : ''}`}>Copied!</div>
        </div>
        <div className="byte-counter">
          Number of charaters in the URL: {this.state.generatedURL.length}{' '}
          <span className="url-warning">
            {this.state.generatedURL.length > 2083 ? (
              <span>
                Warning:{' '}
                <a
                  href="https://support.microsoft.com/en-us/help/208427/maximum-url-length-is-2-083-characters-in-internet-explorer"
                  target="_blank"
                >
                  URLs over 2083 characters may not be supported in Internet Explorer.
                </a>
              </span>
            ) : (
              ''
            )}
          </span>
        </div>
      </div>
    );
  }
}

export default withRouter(ShareModal);
