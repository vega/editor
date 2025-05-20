import * as React from 'react';
import {AlertCircle} from 'react-feather';
import {useNavigate} from 'react-router';
import {connect} from 'react-redux';
import {mapStateToProps} from './index.js';
import GistSelectWidget from '../../gist-select-widget/index.js';
import {Mode} from '../../../constants/index.js';
import './index.css';
import {parse as parseJSONC} from 'jsonc-parser';

export type Props = {
  closePortal: () => void;
};

type PropsType = ReturnType<typeof mapStateToProps> &
  Props & {
    navigate: (path: string) => void;
  };

interface State {
  gist: {
    image: string;
    imageStyle: {
      bottom: number;
    };
    filename: string;
    revision: string;
    type: Mode;
    url: string;
  };
  gistLoadClicked: boolean;
  invalidFilename: boolean;
  invalidRevision: boolean;
  invalidUrl: boolean;
  latestRevision: boolean;
  syntaxError: boolean;
}

class GistModal extends React.PureComponent<PropsType, State> {
  private refGistForm: HTMLFormElement;

  constructor(props: PropsType) {
    super(props);
    this.state = {
      gist: {
        filename: '',
        image: '',
        imageStyle: {
          bottom: 0,
        },
        revision: '',
        type: props.mode,
        url: '',
      },
      gistLoadClicked: false,
      invalidFilename: false,
      invalidRevision: false,
      invalidUrl: false,
      latestRevision: false,
      syntaxError: false,
    };
  }

  public updateGist(gist) {
    this.setState({
      gist: {
        ...this.state.gist,
        ...gist,
      },
    });
  }

  public updateGistUrl(event) {
    this.updateGist({url: event.currentTarget.value});
    this.setState({
      invalidUrl: false,
    });
  }

  public updateGistRevision(event) {
    this.updateGist({revision: event.currentTarget.value});
    this.setState({
      invalidRevision: false,
    });
  }

  public updateGistFile(event) {
    this.updateGist({filename: event.currentTarget.value});
    this.setState({
      invalidFilename: false,
    });
  }

  public async onSelectGist(closePortal) {
    const url = this.state.gist.url.trim().toLowerCase();

    this.setState({
      gist: {
        ...this.state.gist,
        filename: this.state.gist.filename.trim(),
        revision: this.state.gist.revision.trim().toLowerCase(),
      },
    });

    if (url.length === 0) {
      this.refGistForm.reportValidity();
      return;
    }
    this.setState({
      gistLoadClicked: true,
    });

    let gistUrl: URL;

    if (url.match(/gist\.githubusercontent\.com/)) {
      gistUrl = new URL(url, 'https://gist.githubusercontent.com');
      const [revision, filename] = gistUrl.pathname.split('/').slice(4);
      this.setState({
        gist: {
          ...this.state.gist,
          filename,
          revision,
        },
      });
    } else if (url.match(/gist\.github\.com/)) {
      gistUrl = new URL(url, 'https://gist.github.com');
    }
    const gistId = gistUrl.pathname.split('/')[2];

    try {
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
      };

      const githubToken = localStorage.getItem('vega_editor_github_token');
      if (githubToken) {
        headers['Authorization'] = `token ${githubToken}`;
      }

      const gistCommitsResponse = await fetch(`https://api.github.com/gists/${gistId}/commits`, {
        headers,
      });

      this.setState({
        invalidUrl: !gistCommitsResponse.ok,
      });

      if (!gistCommitsResponse.ok) {
        this.setState({
          gistLoadClicked: false,
        });
        throw new Error(`Failed to fetch gist commits: ${gistCommitsResponse.status}`);
      }

      const gistCommits = await gistCommitsResponse.json();

      if (!this.state.gist.revision && !this.state.invalidUrl) {
        this.setState({
          gist: {
            ...this.state.gist,
            revision: gistCommits[0].version,
          },
        });
      } else if (this.state.invalidUrl) {
        this.setState({
          gistLoadClicked: false,
        });
        throw new Error('Invalid Gist URL');
      }

      if (gistCommits[0].version === this.state.gist.revision) {
        this.setState({
          latestRevision: true,
        });
      }

      const gistSummaryResponse = await fetch(`https://api.github.com/gists/${gistId}/${this.state.gist.revision}`, {
        headers,
      });

      this.setState({
        invalidRevision: !gistSummaryResponse.ok,
      });

      if (!gistSummaryResponse.ok) {
        this.setState({
          gistLoadClicked: false,
        });
        throw new Error(`Failed to fetch gist summary: ${gistSummaryResponse.status}`);
      }

      const gistSummary = await gistSummaryResponse.json();

      if (this.state.invalidRevision) {
        this.setState({
          gistLoadClicked: false,
        });
        throw new Error('Invalid Revision');
      } else if (!this.state.invalidRevision && this.state.gist.filename === '') {
        const jsonFiles = Object.keys(gistSummary.files).filter((file) => {
          if (file.split('.').slice(-1)[0] === 'json') {
            return true;
          }
        });
        if (jsonFiles.length === 0) {
          this.setState({
            gistLoadClicked: false,
            invalidUrl: true,
          });
          throw new Error('No JSON file exists in the gist');
        } else {
          this.setState(
            {
              gist: {
                ...this.state.gist,
                filename: jsonFiles[0],
              },
            },
            () => {
              const {revision, filename} = this.state.gist;
              parseJSONC(gistSummary.files[jsonFiles[0]].content);
              if (this.state.latestRevision) {
                this.props.navigate(`/gist/${gistId}/${filename}`);
              } else {
                this.props.navigate(`/gist/${gistId}/${revision}/${filename}`);
              }
              closePortal();
            },
          );
        }
      } else {
        if (gistSummary.files[this.state.gist.filename] === undefined) {
          this.setState({
            gistLoadClicked: false,
            invalidFilename: true,
          });
          throw new Error('Invalid file name');
        }

        try {
          const content = await this.fetchGistContent(gistSummary, this.state.gist.filename);

          const errors = [];
          parseJSONC(content, errors);
          if (errors.length > 0) throw SyntaxError; // check if the loaded file is a JSON

          const {revision, filename} = this.state.gist;
          if (this.state.latestRevision) {
            this.props.navigate(`/gist/${gistId}/${filename}`);
          } else {
            this.props.navigate(`/gist/${gistId}/${revision}/${filename}`);
          }
          closePortal();
        } catch (error) {
          if (error instanceof SyntaxError) {
            this.setState({
              gistLoadClicked: false,
              syntaxError: true,
            });
          }
        }
      }
    } catch (error) {
      console.error('Error loading gist:', error);
      this.setState({
        gistLoadClicked: false,
      });
    }
  }

  private async fetchGistContent(gistSummary, filename) {
    const file = gistSummary.files[filename];
    if (file.truncated) {
      const response = await fetch(file.raw_url);
      return await response.text();
    }
    return file.content;
  }

  public preview(id, file, image) {
    this.setState({
      gist: {
        ...this.state.gist,
        image,
        imageStyle: {
          bottom: 0,
        },
      },
    });
  }

  public slideImage(event) {
    const imageStyle = this.state.gist.imageStyle;
    imageStyle.bottom = imageStyle.bottom + event.deltaY;
    this.setState({
      gist: {
        ...this.state.gist,
        imageStyle,
      },
    });
  }

  public slideImageBack() {
    this.setState({
      gist: {
        ...this.state.gist,
        image: '',
        imageStyle: {
          bottom: 0,
        },
      },
    });
  }

  public render() {
    return (
      <div className="gist-modal">
        <div className="gist-modal-content">
          <div className="gist-modal-header">
            <h2>Load Gist</h2>
          </div>
          <div className="gist-modal-body">
            <form ref={(ref) => (this.refGistForm = ref)}>
              <div className="gist-modal-section">
                <h3>Gist URL</h3>
                <input
                  type="text"
                  placeholder="Enter Gist URL"
                  value={this.state.gist.url}
                  onChange={this.updateGistUrl.bind(this)}
                  required
                />
                {this.state.invalidUrl && (
                  <div className="error-message">
                    <AlertCircle size={16} />
                    <span>Invalid Gist URL</span>
                  </div>
                )}
              </div>
              <div className="gist-modal-section">
                <h3>Revision</h3>
                <input
                  type="text"
                  placeholder="Enter revision (optional)"
                  value={this.state.gist.revision}
                  onChange={this.updateGistRevision.bind(this)}
                />
                {this.state.invalidRevision && (
                  <div className="error-message">
                    <AlertCircle size={16} />
                    <span>Invalid revision</span>
                  </div>
                )}
              </div>
              <div className="gist-modal-section">
                <h3>File Name</h3>
                <input
                  type="text"
                  placeholder="Enter file name (optional)"
                  value={this.state.gist.filename}
                  onChange={this.updateGistFile.bind(this)}
                />
                {this.state.invalidFilename && (
                  <div className="error-message">
                    <AlertCircle size={16} />
                    <span>Invalid file name</span>
                  </div>
                )}
                {this.state.syntaxError && (
                  <div className="error-message">
                    <AlertCircle size={16} />
                    <span>Invalid JSON syntax</span>
                  </div>
                )}
              </div>
              <div className="gist-modal-section">
                <h3>Select from Your Gists</h3>
                <GistSelectWidget selectGist={this.preview.bind(this)} />
              </div>
              <div className="gist-modal-actions">
                <button
                  className="gist-modal-load"
                  onClick={() => this.onSelectGist(this.props.closePortal)}
                  disabled={this.state.gistLoadClicked}
                >
                  {this.state.gistLoadClicked ? 'Loading...' : 'Load Gist'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    );
  }
}

// Create a wrapper component to provide the navigation hook
const GistModalWithNavigation = (props: Omit<PropsType, 'navigate'>) => {
  const navigate = useNavigate();
  return <GistModal {...props} navigate={navigate} />;
};

export default connect(mapStateToProps)(GistModalWithNavigation);
