import stringify from 'json-stringify-pretty-compact';
import {parse as parseJSONC} from 'jsonc-parser';
import LZString from 'lz-string';
import * as React from 'react';
import Clipboard from 'react-clipboard.js';
import {Copy, Link, Save} from 'react-feather';
import {useNavigate} from 'react-router';
import {connect} from 'react-redux';
import {mapDispatchToProps, mapStateToProps} from './index.js';
import {BACKEND_URL, COOKIE_NAME, NAMES} from '../../../constants/consts.js';
import {getAuthFromLocalStorage} from '../../../utils/browser.js';
import GistSelectWidget from '../../gist-select-widget/index.js';
import LoginConditional from '../../login-conditional/index.js';
import './index.css';

const EDITOR_BASE = window.location.origin + window.location.pathname;

function getCookie(name: string): string {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop().split(';').shift() || '';
  return '';
}

type Props = ReturnType<typeof mapStateToProps> &
  ReturnType<typeof mapDispatchToProps> & {
    navigate: (path: string) => void;
  };

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
      // Get GitHub access token from localStorage
      const authData = getAuthFromLocalStorage();
      const githubToken = authData?.githubAccessToken || localStorage.getItem('vega_editor_github_token');

      if (!githubToken) {
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
        const authData = getAuthFromLocalStorage();
        const githubToken = authData?.githubAccessToken || localStorage.getItem('vega_editor_github_token');

        if (!githubToken) {
          this.setState({
            updating: false,
            updateError: true,
          });
          this.props.receiveCurrentUser(false);
          return;
        }

        const gistBody = {
          description: this.state.gistTitle,
          files: {
            [fileName]: {
              content: this.state.whitespace ? this.props.editorString : stringify(parseJSONC(this.props.editorString)),
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

        this.setState(
          {
            updating: false,
            updateError: false,
          },
          () => {
            if (res.status === 401) {
              this.props.receiveCurrentUser(false);
            } else {
              this.setState({
                gistEditorURL: `${EDITOR_BASE}#/gist/${data.id}/${fileName}`,
              });
            }
          },
        );
      }
    } catch (error) {
      console.error('Error updating gist:', error);
      this.setState({
        updating: false,
        updateError: true,
      });
    }
  }

  public render() {
    return (
      <div className="share-modal">
        <div className="share-modal-content">
          <div className="share-modal-header">
            <h2>Share</h2>
          </div>
          <div className="share-modal-body">
            <div className="share-modal-section">
              <h3>URL</h3>
              <div className="share-modal-url">
                <input type="text" value={this.state.generatedURL} readOnly />
                <Clipboard
                  data-clipboard-text={this.state.generatedURL}
                  onSuccess={this.onCopy.bind(this)}
                  className="share-modal-copy"
                >
                  <Copy size={16} />
                </Clipboard>
              </div>
              <div className="share-modal-options">
                <label>
                  <input
                    type="checkbox"
                    checked={this.state.fullScreen}
                    onChange={this.handleFulscreenCheck.bind(this)}
                  />
                  Full Screen
                </label>
                <label>
                  <input
                    type="checkbox"
                    checked={this.state.whitespace}
                    onChange={this.handleWhitespaceCheck.bind(this)}
                  />
                  Preserve Whitespace
                </label>
              </div>
              <button className="share-modal-preview" onClick={this.previewURL.bind(this)}>
                Preview
              </button>
            </div>
            <div className="share-modal-section">
              <h3>GitHub Gist</h3>
              <LoginConditional>
                <div className="share-modal-gist">
                  <div className="share-modal-gist-options">
                    <input
                      type="text"
                      placeholder="Title"
                      value={this.state.gistTitle}
                      onChange={this.titleChange.bind(this)}
                    />
                    <input
                      type="text"
                      placeholder="File Name"
                      value={this.state.gistFileName}
                      onChange={this.fileNameChange.bind(this)}
                    />
                    <label>
                      <input
                        type="checkbox"
                        checked={this.state.gistPrivate}
                        onChange={this.updatePrivacy.bind(this)}
                      />
                      Private
                    </label>
                  </div>
                  <div className="share-modal-gist-actions">
                    <button
                      className="share-modal-create"
                      onClick={this.createGist.bind(this)}
                      disabled={this.state.creating}
                    >
                      {this.state.creating ? 'Creating...' : 'Create Gist'}
                    </button>
                    <button
                      className="share-modal-update"
                      onClick={this.updateGist.bind(this)}
                      disabled={this.state.updating || !this.state.gistId}
                    >
                      {this.state.updating ? 'Updating...' : 'Update Gist'}
                    </button>
                  </div>
                  <div className="share-modal-gist-select">
                    <GistSelectWidget selectGist={this.selectGist.bind(this)} />
                  </div>
                  {this.state.gistEditorURL && (
                    <div className="share-modal-gist-url">
                      <input type="text" value={this.state.gistEditorURL} readOnly />
                      <Clipboard
                        data-clipboard-text={this.state.gistEditorURL}
                        onSuccess={this.onCopy.bind(this)}
                        className="share-modal-copy"
                      >
                        <Copy size={16} />
                      </Clipboard>
                    </div>
                  )}
                </div>
              </LoginConditional>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

// Create a wrapper component to provide the navigation hook
const ShareModalWithNavigation = (props: Omit<Props, 'navigate'>) => {
  const navigate = useNavigate();
  return <ShareModal {...props} navigate={navigate} />;
};

export default connect(mapStateToProps, mapDispatchToProps)(ShareModalWithNavigation);
