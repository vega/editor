import * as React from 'react';
import { AlertCircle, GitHub, Loader } from 'react-feather';
import { RouteComponentProps, withRouter } from 'react-router-dom';
import { mapDispatchToProps, mapStateToProps } from '.';
import { BACKEND_URL, COOKIE_NAME, Mode, NAME_TO_MODE, SCHEMA } from '../../../constants';
import { getCookie } from '../../../utils/getCookie';
import './index.css';

type Props = ReturnType<typeof mapStateToProps> &
  ReturnType<typeof mapDispatchToProps> & { closePortal: () => void } & RouteComponentProps;

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
  loaded: boolean;
  gistLoadClicked: boolean;
  invalidFilename: boolean;
  invalidRevision: boolean;
  invalidUrl: boolean;
  personalGist: any;
  private: boolean;
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
      loaded: false,
      personalGist: [],
      private: false,
    };
  }

  public componentDidMount() {
    const cookieValue = encodeURIComponent(getCookie(COOKIE_NAME));
    fetch(`${BACKEND_URL}gists/user`, {
      credentials: 'include',
      headers: {
        Cookie: `${COOKIE_NAME}=${cookieValue}`,
      },
      method: 'get',
    })
      .then(res => {
        return res.json();
      })
      .then(json => {
        if (this.props.isAuthenticated) {
          this.setState({
            loaded: true,
            personalGist: json,
          });
        }
      })
      .catch(err => {
        // console.error(err);
      });
  }

  public privacyToggle() {
    this.setState({
      private: !this.state.private,
    });
  }

  public updateGist(gist) {
    this.setState({
      gist: {
        ...this.state.gist,
        ...gist,
      },
    });
  }

  public updateGistType(event) {
    this.updateGist({ type: event.currentTarget.value });
  }

  public updateGistUrl(event) {
    this.updateGist({ url: event.currentTarget.value });
    this.setState({
      invalidUrl: false,
    });
  }

  public updateGistRevision(event) {
    this.updateGist({ revision: event.currentTarget.value });
    this.setState({
      invalidRevision: false,
    });
  }

  public updateGistFile(event) {
    this.updateGist({ filename: event.currentTarget.value });
    this.setState({
      invalidFilename: false,
    });
  }

  public async onSelectGist(closePortal) {
    const url = this.state.gist.url.trim().toLowerCase();

    let revision = this.state.gist.revision.trim().toLowerCase();
    const filename = this.state.gist.filename.trim();

    if (url.length === 0) {
      this.refGistForm.reportValidity();
      return;
    }
    this.setState({
      gistLoadClicked: true,
    });

    const gistUrl = new URL(url, 'https://gist.github.com');
    const [_, gistId] = gistUrl.pathname.split('/').slice(1);
    await fetch(`https://api.github.com/gists/${gistId}/commits`)
      .then(res => {
        this.setState({
          invalidUrl: !res.ok,
        });
        return res.json();
      })
      .then(json => {
        if (!revision && !this.state.invalidUrl) {
          revision = json[0].version;
        } else if (this.state.invalidUrl) {
          this.setState({
            gistLoadClicked: false,
          });
          return Promise.reject('Invalid Gist URL');
        }
        this.setState({
          gist: {
            ...this.state.gist,
            revision,
          },
        });
        return fetch(`https://api.github.com/gists/${gistId}/${revision}`);
      })
      .then(res => {
        this.setState({
          invalidRevision: !res.ok,
        });
        return res.json();
      })
      .then(json => {
        if (this.state.invalidRevision) {
          this.setState({
            gistLoadClicked: false,
          });
          return Promise.reject('Invalid Revision');
        } else if (!this.state.invalidRevision && filename === '') {
          const jsonFiles = Object.keys(json.files).filter(file => {
            if (file.split('.').slice(-1)[0] === 'json') {
              return true;
            }
          });
          if (jsonFiles.length === 0) {
            this.setState(
              {
                gistLoadClicked: false,
              },
              () => {
                return Promise.reject('No Vega/Vega-lite compatible file exists in the gist');
              }
            );
          } else {
            this.setState({
              gist: {
                ...this.state.gist,
                filename: jsonFiles[0],
              },
            });
            return fetch(json.files[jsonFiles[0]].raw_url);
          }
        } else {
          if (json.files[filename] === undefined) {
            this.setState({
              gistLoadClicked: false,
              invalidFilename: true,
            });
            return Promise.reject('Invalid file name');
          } else {
            return fetch(json.files[filename].raw_url);
          }
        }
      })
      .then(res => {
        return res.json();
      })
      .catch(error => {
        if (error instanceof SyntaxError) {
          this.setState({
            gistLoadClicked: false,
            invalidFilename: true,
          });
          return Promise.reject(error);
        }
      })
      .then(json => {
        if (!json.hasOwnProperty('$schema')) {
          this.setState({
            gistLoadClicked: false,
            invalidFilename: true,
          });
          return Promise.reject('Invalid Vega/Vega-Lite file');
        }
        for (const key in SCHEMA) {
          if (SCHEMA[key] === json.$schema) {
            this.setState(
              {
                gist: {
                  ...this.state.gist,
                  type: NAME_TO_MODE[key],
                },
                gistLoadClicked: false,
              },
              () => {
                if (this.state.gist.type === Mode.Vega) {
                  this.props.setGistVegaSpec('', JSON.stringify(json));
                } else if (this.state.gist.type === Mode.VegaLite) {
                  this.props.setGistVegaLiteSpec('', JSON.stringify(json));
                }
                closePortal();
              }
            );
          }
        }
      });
  }

  public componentWillReceiveProps(nextProps) {
    this.setState({
      gist: {
        filename: '',
        image: '',
        imageStyle: {
          bottom: 0,
        },
        revision: '',
        type: nextProps.mode,
        url: '',
      },
    });
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
          <a href="https://gist.github.com/" target="_blank">
            Gist
          </a>
        </h1>
        <div className="gist-split">
          <div className="personal-gist">
            <h3>Your GISTS</h3>
            {this.props.isAuthenticated ? (
              this.state.loaded ? (
                <>
                  {this.state.personalGist !== [] ? (
                    <>
                      <div className="privacy-toggle">
                        <label htmlFor="privacy">Show private gists: </label>
                        <input
                          type="checkbox"
                          name="privacy"
                          id="privacy"
                          checked={this.state.private}
                          onChange={this.privacyToggle.bind(this)}
                        />
                      </div>
                      <ol>
                        {this.state.personalGist
                          .filter(gist => gist.isPublic || this.state.private)
                          .map(gist => (
                            <li key={gist.name}>
                              {gist.title}
                              <ul>
                                {gist.spec.map(spec => (
                                  <li
                                    key={spec.name}
                                    onClick={() => this.preview(gist.name, spec.name, spec.previewUrl)}
                                  >
                                    {spec.name}
                                  </li>
                                ))}
                              </ul>
                            </li>
                          ))}
                      </ol>
                    </>
                  ) : (
                    <>You have no Vega or Vega-Lite compatible gists.</>
                  )}
                </>
              ) : (
                <div className="loader-container">
                  <Loader className="loader" />
                </div>
              )
            ) : (
              <span>
                Login with <a href={`${BACKEND_URL}auth/github`}>GitHub</a> to see all of your personal gist.
              </span>
            )}
          </div>
          <div className="load-gist">
            <h3>Load GISTS</h3>
            <form ref={form => (this.refGistForm = form)}>
              <div className="gist-input-container">
                <label>
                  Gist URL
                  <div style={{ marginTop: '2px' }}>
                    <small>
                      Example:{' '}
                      <span className="gist-url">
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
                    Revision (<small>optional</small>)
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
                    Filename (<small>optional</small>)
                    <input
                      className="gist-input"
                      type="text"
                      placeholder="Enter filename"
                      value={this.state.gist.filename}
                      onChange={this.updateGistFile.bind(this)}
                    />
                  </label>
                  <div className="error-message">
                    {this.state.invalidFilename && <span>File not Vega/Vega-Lite compatible</span>}
                  </div>
                </div>
              </div>
              <div className="load-button">
                {this.state.gist.url && this.state.gist.filename ? (
                  this.state.gist.image ? (
                    <div className="preview-image-container">
                      <span className="preview-text">Preview:</span>
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
                  ) : (
                    <div className="preview-error-message-container">
                      <div className="preview-error-message">
                        <AlertCircle className="preview-error-icon" />
                        <span>No preview available for this gist file.</span>
                      </div>
                      <span className="preview-error-fix">
                        Upload an image with same name as the gist file to{' '}
                        <a href={this.state.gist.url} target="_blank">
                          this gist
                        </a>
                        .
                      </span>
                    </div>
                  )
                ) : (
                  <></>
                )}
                <div className="gist-button">
                  <button type="button" onClick={() => this.onSelectGist(this.props.closePortal)}>
                    {this.state.gistLoadClicked ? 'Loading..' : 'Load'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    );
  }
}

export default withRouter(GistModal);
