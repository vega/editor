import LZString from 'lz-string';
import * as React from 'react';
import Clipboard from 'react-clipboard.js';
import {Copy, Link} from 'react-feather';
import {withRouter} from 'react-router-dom';
import {mapStateToProps} from '.';
import './index.css';

type Props = ReturnType<typeof mapStateToProps>;

interface State {
  copied: boolean;
  fullScreen: boolean;
  whitespace: boolean;
  generatedURL: string;
}

class ShareModal extends React.PureComponent<Props, State> {
  constructor(props) {
    super(props);
    this.state = {
      copied: false,
      fullScreen: false,
      whitespace: false,
      generatedURL: '',
    };
  }

  public exportURL() {
    const specString = this.state.whitespace
      ? this.props.editorString
      : JSON.stringify(JSON.parse(this.props.editorString));

    const serializedSpec = LZString.compressToEncodedURIComponent(specString) + (this.state.fullScreen ? '/view' : '');

    if (serializedSpec) {
      const url = `${document.location.href.split('#')[0]}#/url/${this.props.mode}/${serializedSpec}`;
      this.setState({generatedURL: url});
    }
  }

  public previewURL() {
    const win = window.open(this.state.generatedURL, '_blank');
    win.focus();
  }

  public onCopy() {
    if (!this.state.copied) {
      this.setState(
        {
          copied: true,
        },
        () => {
          setTimeout(() => {
            this.setState({copied: false});
          }, 2500);
        }
      );
    }
  }

  public handleFulscreenCheck(event) {
    this.setState({fullScreen: event.target.checked}, () => {
      this.exportURL();
    });
  }

  public handleWhitespaceCheck(event) {
    this.setState({whitespace: event.target.checked}, () => {
      this.exportURL();
    });
  }

  public componentDidMount() {
    this.exportURL();
  }

  public render() {
    return (
      <>
        <h1>Share</h1>
        <p>
          We pack the Vega or Vega-Lite specification as an encoded string in the URL. We use a LZ-based compression
          algorithm. When whitespaces are not preserved, the editor will automatically format the specification when it
          is loaded.
        </p>
        <div>
          <label className="user-pref">
            <input
              type="checkbox"
              defaultChecked={this.state.fullScreen}
              name="fullscreen"
              onChange={this.handleFulscreenCheck.bind(this)}
            />
            Open visualization in fullscreen
          </label>
          <label className="user-pref">
            <input
              type="checkbox"
              defaultChecked={this.state.whitespace}
              name="whitespace"
              onChange={this.handleWhitespaceCheck.bind(this)}
            />
            Preserve whitespaces
          </label>
        </div>
        <div className="sharing-buttons">
          <button className="editor-button" onClick={() => this.previewURL()}>
            <Link />
            <span>Open Link</span>
          </button>
          <Clipboard
            className="editor-button copy-icon"
            data-clipboard-text={this.state.generatedURL}
            onSuccess={this.onCopy.bind(this)}
          >
            <Copy />
            <span>Copy Link to Clipboard</span>
          </Clipboard>
          <Clipboard
            className="editor-button copy-icon"
            data-clipboard-text={`[Open the Chart in the Vega Editor](${this.state.generatedURL})`}
            onSuccess={this.onCopy.bind(this)}
          >
            <Copy />
            <span>Copy Markdown Link to Clipboard</span>
          </Clipboard>
          <div className={`copied + ${this.state.copied ? ' visible' : ''}`}>Copied!</div>
        </div>
        Number of characters in the URL: {this.state.generatedURL.length}{' '}
        <span className="url-warning">
          {this.state.generatedURL.length > 2083 && (
            <>
              Warning:{' '}
              <a
                href="https://support.microsoft.com/en-us/help/208427/maximum-url-length-is-2-083-characters-in-internet-explorer"
                target="_blank"
                rel="noopener noreferrer"
              >
                URLs over 2083 characters may not be supported in Internet Explorer.
              </a>
            </>
          )}
        </span>
      </>
    );
  }
}

export default withRouter(ShareModal);
