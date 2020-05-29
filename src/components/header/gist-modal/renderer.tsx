import * as React from 'react';
import {AlertCircle} from 'react-feather';
import {RouteComponentProps, withRouter} from 'react-router-dom';
import {mapStateToProps} from '.';
import GistSelectWidget from '../../gist-select-widget';
import {Mode} from '../../../constants';
import './index.css';

type Props = ReturnType<typeof mapStateToProps> & {
  closePortal: () => void;
} & RouteComponentProps;

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

class GistModal extends React.PureComponent<Props, State> {
  private refGistForm: HTMLFormElement;
  constructor(props) {
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

    if (url.match(/gist.githubusercontent.com/)) {
      gistUrl = new URL(url, 'https://gist.githubusercontent.com');
      const [revision, filename] = gistUrl.pathname.split('/').slice(4);
      this.setState({
        gist: {
          ...this.state.gist,
          filename,
          revision,
        },
      });
    } else if (url.match(/gist.github.com/)) {
      gistUrl = new URL(url, 'https://gist.github.com');
    }
    const gistId = gistUrl.pathname.split('/')[2];

    try {
      const gistCommitsResponse = await fetch(`https://api.github.com/gists/${gistId}/commits`);
      this.setState({
        invalidUrl: !gistCommitsResponse.ok,
      });
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
      const gistSummaryResponse = await fetch(`https://api.github.com/gists/${gistId}/${this.state.gist.revision}`);
      this.setState({
        invalidRevision: !gistSummaryResponse.ok,
      });
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
              JSON.parse(gistSummary.files[jsonFiles[0]].content);
              if (this.state.latestRevision) {
                this.props.history.push(`/gist/${gistId}/${filename}`);
              } else {
                this.props.history.push(`/gist/${gistId}/${revision}/${filename}`);
              }
              closePortal();
            }
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

        const rawResponse = await fetch(gistSummary.files[this.state.gist.filename].raw_url); // fetch from raw_url to handle large files
        await rawResponse.json(); // check if the loaded file is a JSON

        const {revision, filename} = this.state.gist;
        if (this.state.latestRevision) {
          this.props.history.push(`/gist/${gistId}/${filename}`);
        } else {
          this.props.history.push(`/gist/${gistId}/${revision}/${filename}`);
        }
        closePortal();
      }
    } catch (error) {
      if (error instanceof SyntaxError) {
        this.setState({
          gistLoadClicked: false,
          syntaxError: true,
        });
      }
    }
  }

  public preview(id, file, image) {
    this.setState({
      gist: {
        ...this.state.gist,
        filename: file,
        image,
        imageStyle: {
          ...this.state.gist.imageStyle,
          bottom: 0,
        },
        revision: '',
        url: `https://gist.github.com/${this.props.handle}/${id}`,
      },
      invalidFilename: false,
      invalidRevision: false,
      invalidUrl: false,
      syntaxError: false,
    });
  }

  public slideImage(event) {
    const imageHeight = event.target.height;
    this.setState({
      gist: {
        ...this.state.gist,
        imageStyle: {
          ...this.state.gist.imageStyle,
          bottom: imageHeight > 100 ? imageHeight - 100 : 0,
        },
      },
    });
  }

  public slideImageBack() {
    this.setState({
      gist: {
        ...this.state.gist,
        imageStyle: {
          ...this.state.gist.imageStyle,
          bottom: 0,
        },
      },
    });
  }

  public render() {
    return (
      <div>
        <h1>
          Load{' '}
          <a href="https://gist.github.com/" target="_blank" rel="noopener noreferrer">
            GitHub Gist
          </a>
        </h1>
        <div className="gist-split">
          <div className="personal-gist">
            <h3>Your gists</h3>
            <p>
              To load a gist, select it in the list below or specify its details on the right. View all your Gists on{' '}
              <a href={`https://gist.github.com/${this.props.handle}`}>GitHub</a>.
            </p>
            <GistSelectWidget selectGist={this.preview.bind(this)} />
          </div>
          <div className="load-gist">
            <h3>Load gists</h3>
            <form ref={(form) => (this.refGistForm = form)}>
              <div className="gist-input-container">
                <label>
                  Gist URL
                  <div style={{marginTop: '2px'}}>
                    <small>
                      Example:{' '}
                      <span
                        className="gist-url"
                        onClick={(e) =>
                          this.setState({
                            gist: {
                              ...this.state.gist,
                              filename: '',
                              image: '',
                              revision: '',
                              url: 'https://gist.github.com/domoritz/455e1c7872c4b38a58b90df0c3d7b1b9',
                            },
                          })
                        }
                      >
                        {'https://gist.github.com/domoritz/455e1c7872c4b38a58b90df0c3d7b1b9'}
                      </span>
                    </small>
                  </div>
                  <input
                    required
                    className="gist-input"
                    type="text"
                    placeholder="Enter URL"
                    value={this.state.gist.url}
                    onChange={this.updateGistUrl.bind(this)}
                  />
                </label>
                <div className="error-message">{this.state.invalidUrl && <span>Please enter a valid URL.</span>}</div>
              </div>
              <div className="gist-optional">
                <div className="gist-input-container gist-optional-input-container">
                  <label>
                    Revision (optional)
                    <input
                      className="gist-input"
                      type="text"
                      placeholder="Enter revision"
                      value={this.state.gist.revision}
                      onChange={this.updateGistRevision.bind(this)}
                    />
                  </label>
                  <div className="error-message">
                    {this.state.invalidRevision && <span>Please enter a valid revision.</span>}
                  </div>
                </div>
                <div className="gist-input-container gist-optional-input-container">
                  <label>
                    Filename (optional)
                    <input
                      className="gist-input"
                      type="text"
                      placeholder="Enter filename"
                      value={this.state.gist.filename}
                      onChange={this.updateGistFile.bind(this)}
                    />
                  </label>
                  <div className="error-message">
                    {this.state.invalidFilename ? (
                      <span>Please enter a valid JSON file</span>
                    ) : (
                      this.state.syntaxError && <span>JSON is syntactically incorrect</span>
                    )}
                  </div>
                </div>
              </div>
              {this.state.gist.url && this.state.gist.filename ? (
                this.state.gist.image ? (
                  <div className="preview-container">
                    <div className="preview-text">Preview:</div>
                    <div className="preview-image-container">
                      <div className="preview-image-wrapper">
                        <img
                          src={this.state.gist.image}
                          onMouseOver={this.slideImage.bind(this)}
                          onMouseOut={this.slideImageBack.bind(this)}
                          style={{
                            transform: `translateY(-${this.state.gist.imageStyle.bottom}px)`,
                          }}
                        />
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="preview-error-message-container">
                    <div className="preview-error-message">
                      <AlertCircle className="preview-error-icon" />
                      <span>No preview available for this gist file.</span>
                    </div>
                    <span className="preview-error-fix">
                      Upload an image file with name {this.state.gist.filename.replace(/\.json/i, '.(png/jpg)')}.
                    </span>
                  </div>
                )
              ) : (
                <></>
              )}
              <button type="button" onClick={() => this.onSelectGist(this.props.closePortal)}>
                {this.state.gistLoadClicked ? 'Loading..' : 'Load'}
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }
}

export default withRouter(GistModal);
