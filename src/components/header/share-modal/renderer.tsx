import stringify from 'json-stringify-pretty-compact';
import {parse as parseJSONC} from 'jsonc-parser';
import LZString from 'lz-string';
import * as React from 'react';
import Clipboard from 'react-clipboard.js';
import {Copy, Link, Save} from 'react-feather';
import {withRouter} from 'react-router-dom';
import {mapDispatchToProps, mapStateToProps} from './index.js';
import {BACKEND_URL, COOKIE_NAME, NAMES} from '../../../constants/consts.js';
import {getAuthFromLocalStorage} from '../../../utils/browser.js';
import GistSelectWidget from '../../gist-select-widget/index.js';
import LoginConditional from '../../login-conditional/index.js';
import './index.css';
import {getGithubToken} from '../../../utils/github.js';

const EDITOR_BASE = window.location.origin + window.location.pathname;

function getCookie(name: string): string {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop().split(';').shift() || '';
  return '';
}

type Props = ReturnType<typeof mapStateToProps> & ReturnType<typeof mapDispatchToProps>;

interface State {
  copied: boolean;
  creating: boolean;
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
  updating: boolean;
  gistEditorURL: string;
}

class ShareModal extends React.PureComponent<Props, State> {
  constructor(props) {
    super(props);
    const date = new Date().toDateString();
    this.state = {
      copied: false,
      creating: undefined,
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
      updating: undefined,
      gistEditorURL: '',
    };
  }

  public exportURL() {
    const specString = this.state.whitespace
      ? this.props.editorString
      : JSON.stringify(parseJSONC(this.props.editorString));

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
        },
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

  public gistFileNameSelectedChange(event) {
    this.setState({
      gistFileNameSelected: event.target.value,
    });
  }

  public titleChange(event) {
    this.setState({
      gistTitle: event.target.value,
    });
  }

  public async createGist() {
    this.setState({
      creating: true,
    });

    const body = {
      content: this.state.whitespace ? this.props.editorString : stringify(parseJSONC(this.props.editorString)),
      name: this.state.gistFileName || 'spec',
      title: this.state.gistTitle,
      privacy: this.state.gistPrivate,
    };

    try {
      // Get GitHub access token just-in-time
      let githubToken;
      try {
        githubToken = await getGithubToken();
      } catch (error) {
        console.error('Failed to get GitHub token:', error);
        this.setState({
          creating: false,
          createError: true,
        });
        this.props.receiveCurrentUser(false);
        return;
      }

      const gistBody = {
        description: body.title,
        public: !body.privacy,
        files: {
          [body.name.endsWith('.json') ? body.name : `${body.name}.json`]: {
            content: body.content,
          },
        },
      };

      // Direct API call to GitHub
      const res = await fetch('https://api.github.com/gists', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `token ${githubToken}`,
        },
        body: JSON.stringify(gistBody),
      });

      if (!res.ok) {
        throw new Error(`Failed to create gist: ${res.status}`);
      }

      const data = await res.json();

      this.setState(
        {
          creating: false,
          updating: undefined,
        },
        () => {
          if (!data.id) {
            this.setState(
              {
                createError: true,
              },
              () => {
                if (res.status === 401) {
                  this.props.receiveCurrentUser(false);
                }
              },
            );
          } else {
            const fileName = Object.keys(data.files)[0];
            this.setState({
              createError: false,
              gistEditorURL: `${EDITOR_BASE}#/gist/${data.id}/${fileName}`,
            });
          }
        },
      );
    } catch (error) {
      console.error('Error creating gist:', error);
      this.setState({
        creating: false,
        createError: true,
      });
    }
  }

  public selectGist(id, fileName) {
    this.setState({
      gistFileNameSelected: fileName,
      gistId: id,
    });
  }

  public async updateGist() {
    this.setState({
      updating: true,
    });

    const fileName = this.state.gistFileNameSelected;

    try {
      if (this.state.gistId) {
        // Get GitHub access token just-in-time
        let githubToken;
        try {
          githubToken = await getGithubToken();
        } catch (error) {
          console.error('Failed to get GitHub token:', error);
          this.setState({
            updating: false,
            updateError: true,
          });
          this.props.receiveCurrentUser(false);
          return;
        }

        const gistBody = {
          files: {
            [fileName]: {
              content: this.props.editorString,
            },
          },
        };
        const res = await fetch(`https://api.github.com/gists/${this.state.gistId}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `token ${githubToken}`,
          },
          body: JSON.stringify(gistBody),
        });

        if (!res.ok) {
          throw new Error(`Failed to update gist: ${res.status}`);
        }

        const data = await res.json();

        if (data.id) {
          this.setState({
            gistEditorURL: `${EDITOR_BASE}#/gist/${data.id}/${fileName}`,
            creating: undefined,
            updating: false,
            updateError: false,
          });
        } else {
          this.setState({
            creating: undefined,
            updating: false,
            updateError: true,
          });
        }
      }
    } catch (error) {
      console.error('Error updating gist:', error);
      this.setState({
        creating: undefined,
        updating: false,
        updateError: true,
      });
    }
  }

  public render() {
    return (
      <div className="share-modal">
        <h1>Share</h1>
        <h2>Via URL</h2>
        <p>
          We pack the {NAMES[this.props.mode]} specification as an encoded string in the URL. We use a LZ-based
          compression algorithm. When whitespaces are not preserved, the editor will automatically format the
          specification when it is loaded.
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
            Preserve whitespace, comments, and trailing commas
          </label>
        </div>
        <div className="sharing-buttons">
          <button onClick={() => this.previewURL()}>
            <Link />
            <span>Open Link</span>
          </button>
          <Clipboard
            className="copy-icon"
            data-clipboard-text={this.state.generatedURL}
            onSuccess={this.onCopy.bind(this)}
          >
            <Copy />
            <span>Copy Link to Clipboard</span>
          </Clipboard>
          <Clipboard
            className="copy-icon"
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
        <LoginConditional>
          <p>
            Here, you can save your {NAMES[this.props.mode]} specification as a new Gist or update an existing Gist. You
            can view all of your Gists on <a href={`https://gist.github.com/${this.props.handle}`}>GitHub</a>.
          </p>
          <div className="share-gist-split">
            <div className="update-gist">
              <h3>Update an existing Gist</h3>
              <p>To update an existing Gist, select it in the list and then click the button below to confirm.</p>
              <GistSelectWidget selectGist={this.selectGist.bind(this)} />
              {this.props.isAuthenticated && (
                <React.Fragment>
                  <div className="share-input-container">
                    <label>
                      File name:
                      <input
                        value={this.state.gistFileNameSelected}
                        onChange={this.gistFileNameSelectedChange.bind(this)}
                        type="text"
                      />
                      <small>Change the filename to create a new file in the selected Gist</small>
                    </label>
                  </div>
                </React.Fragment>
              )}
              <div className="sharing-buttons">
                <button
                  onClick={this.updateGist.bind(this)}
                  disabled={!this.state.gistFileNameSelected || this.state.updating}
                >
                  <Save />
                  {this.state.updating ? 'Updating...' : 'Update'}
                </button>
                {this.state.gistEditorURL && this.state.updating !== undefined && (
                  <Clipboard className="copy-icon" data-clipboard-text={this.state.gistEditorURL}>
                    <Copy />
                    <span>Copy Link to Clipboard</span>
                  </Clipboard>
                )}
              </div>
              {this.state.updateError && <div className="error-message share-error">Gist could not be updated.</div>}
            </div>
            <div>
              <h3>Create a new Gist</h3>
              <p>
                Save the current {NAMES[this.props.mode]} specification as a Gist. When you save it, you will get a link
                that you can share. You can also load the specification via the Gist loading functionality in the
                editor.
              </p>
              <div>
                <label className="user-pref">
                  <input
                    type="checkbox"
                    defaultChecked={this.state.whitespace}
                    name="whitespace"
                    onChange={this.handleWhitespaceCheck.bind(this)}
                  />
                  Preserve whitespace, comments, and trailing commas
                </label>
              </div>
              <div className="share-input-container">
                <label>
                  Title:
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
              <div className="sharing-buttons">
                <button onClick={this.createGist.bind(this)} disabled={this.state.creating}>
                  <Save />
                  {this.state.creating ? 'Creating...' : 'Create'}
                </button>
                {this.state.gistEditorURL && this.state.creating !== undefined && (
                  <Clipboard className="copy-icon" data-clipboard-text={this.state.gistEditorURL}>
                    <Copy />
                    <span>Copy Link to Clipboard</span>
                  </Clipboard>
                )}
                {this.state.createError && <div className="error-message share-error">Gist could not be created</div>}
              </div>
            </div>
          </div>
        </LoginConditional>
      </div>
    );
  }
}

export default withRouter(ShareModal);
