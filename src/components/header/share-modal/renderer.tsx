import LZString from 'lz-string';
import * as React from 'react';
import Clipboard from 'react-clipboard.js';
import {Copy, Link} from 'react-feather';
import {withRouter} from 'react-router-dom';
import {mapStateToProps, mapDispatchToProps} from '.';
import getCookie from '../../../utils/getCookie';
import GistSelectWidget from '../../gist-select-widget';
import {BACKEND_URL, COOKIE_NAME, NAMES} from '../../../constants/consts';
import './index.css';

type Props = ReturnType<typeof mapStateToProps> & ReturnType<typeof mapDispatchToProps>;

interface State {
  copied: boolean;
  created: boolean;
  done: boolean;
  createError: boolean;
  updateError: boolean;
  fullScreen: boolean;
  whitespace: boolean;
  generatedURL: string;
  gistFileName: string;
  gistFileNameSelected: string;
  gistPrivate: boolean;
  gistTitle: string;
  gistId: string;
  updated: boolean;
  gistURL: string;
}

class ShareModal extends React.PureComponent<Props, State> {
  constructor(props) {
    super(props);
    const date = new Date().toDateString();
    this.state = {
      copied: false,
      created: false,
      done: true,
      createError: false,
      updateError: false,
      fullScreen: false,
      whitespace: false,
      generatedURL: '',
      gistFileName: 'spec.json',
      gistFileNameSelected: '',
      gistPrivate: false,
      gistTitle: `${NAMES[this.props.mode]} spec from ${date}`,
      gistId: '',
      updated: true,
      gistURL: '',
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

  public updatePrivacy(event) {
    this.setState({
      gistPrivate: event.target.checked,
    });
  }

  public fileNameChange(event) {
    this.setState({
      gistFileName: event.target.value,
    });
  }

  public titleChange(event) {
    this.setState({
      gistTitle: event.target.value,
    });
  }

  public async createGist() {
    this.setState({
      done: false,
    });

    const body = {
      content: this.props.editorString,
      name: this.state.gistFileName || 'spec',
      title: this.state.gistTitle,
      privacy: this.state.gistPrivate,
    };

    const cookieValue = encodeURIComponent(getCookie(COOKIE_NAME));

    const res = await fetch(`${BACKEND_URL}gists/create`, {
      body: JSON.stringify(body),
      mode: 'cors',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        Cookie: `${COOKIE_NAME}=${cookieValue}`,
      },
      method: 'post',
    });

    const json = await res.json();
    this.setState(
      {
        done: true,
      },
      () => {
        if (json.url === undefined) {
          this.setState(
            {
              createError: true,
            },
            () => {
              this.props.receiveCurrentUser(json.isAuthenticated);
            }
          );
        } else {
          this.setState(
            {
              created: true,
              createError: false,
              gistURL: json.url,
            },
            () => {
              setTimeout(() => {
                this.setState({
                  created: false,
                });
              }, 2500);
            }
          );
        }
      }
    );
  }

  public selectGist(id, fileName) {
    this.setState({
      gistFileNameSelected: fileName,
      gistId: id,
    });
  }

  public async updateGist() {
    this.setState({
      updated: false,
    });

    if (this.state.gistId) {
      const cookieValue = encodeURIComponent(getCookie(COOKIE_NAME));
      const res = await fetch(`${BACKEND_URL}gists/update`, {
        body: JSON.stringify({
          gistId: this.state.gistId,
          fileName: this.state.gistFileNameSelected,
          content: this.props.editorString,
        }),
        mode: 'cors',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          Cookie: `${COOKIE_NAME}=${cookieValue}`,
        },
        method: 'post',
      });

      const data = await res.json();
      if (res.status === 205) {
        this.setState({
          gistURL: data.url,
          updated: true,
          updateError: false,
        });
      } else {
        this.setState({
          updated: true,
          updateError: true,
        });
      }
    }
  }

  public render() {
    return (
      <div className="share-modal">
        <h1>Share</h1>
        <h2>Via URL</h2>
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
        <div className="spacer"></div>
        <h2>
          Via{' '}
          <a href="https://gist.github.com/" target="_blank" rel="noopener noreferrer">
            GitHub Gist
          </a>
        </h2>
        <div className="share-gist-split">
          <div className="update-gist">
            <h3>Update an existing GIST</h3>
            <GistSelectWidget selectGist={this.selectGist.bind(this)} />
            <button className="editor-button" onClick={this.updateGist.bind(this)}>
              {this.state.updated ? 'Update' : 'Updating...'}
            </button>
            {this.state.updateError && <div className="error-message share-error">Gist could not be updated</div>}
          </div>
          <div>
            <h3>Create a new Gist</h3>
            <div className="share-input-container">
              <label>
                Title (optional):
                <input
                  value={this.state.gistTitle}
                  onChange={this.titleChange.bind(this)}
                  type="text"
                  placeholder="Enter title of gist"
                />
              </label>
            </div>
            <div className="share-input-container">
              <label>
                File name:
                <input
                  value={this.state.gistFileName}
                  onChange={this.fileNameChange.bind(this)}
                  type="text"
                  placeholder="Enter file name"
                />
              </label>
            </div>
            <div className="share-input-container">
              <label>
                <input
                  type="checkbox"
                  name="private-gist"
                  id="private-gist"
                  value="private-select"
                  checked={this.state.gistPrivate}
                  onChange={this.updatePrivacy.bind(this)}
                />
                Create a Private Gist
              </label>
            </div>
            <div>
              <button className="editor-button" onClick={this.createGist.bind(this)}>
                {this.state.done ? 'Create' : 'Creating...'}
              </button>
              {this.state.created && <span className="success">Created!</span>}
              {this.state.gistURL && (
                <Clipboard className="editor-button copy-icon" data-clipboard-text={this.state.gistURL}>
                  <Copy />
                  <span>Copy Link to Clipboard</span>
                </Clipboard>
              )}
              {this.state.createError && <div className="error-message share-error">Gist could not be created</div>}
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default withRouter(ShareModal);
