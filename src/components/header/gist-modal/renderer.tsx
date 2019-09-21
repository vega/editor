import * as React from 'react';
import ReactPaginate from 'react-paginate';
import {AlertCircle, File, Lock} from 'react-feather';
import {RouteComponentProps, withRouter} from 'react-router-dom';
import {mapDispatchToProps, mapStateToProps} from '.';
import {BACKEND_URL, COOKIE_NAME, Mode, GistPrivacy} from '../../../constants';
import getCookie from '../../../utils/getCookie';
import './index.css';

type Props = ReturnType<typeof mapStateToProps> &
  ReturnType<typeof mapDispatchToProps> & {
    closePortal: () => void;
  } & RouteComponentProps;

interface State {
  currentPage: number;
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
  loaded: boolean;
  pages: any;
  personalGist: any;
  private: string;
  syntaxError: boolean;
}

class GistModal extends React.PureComponent<Props, State> {
  private refGistForm: HTMLFormElement;
  constructor(props) {
    super(props);
    this.state = {
      currentPage: 0,
      gist: {
        filename: '',
        image: '',
        imageStyle: {
          bottom: 0
        },
        revision: '',
        type: props.mode,
        url: ''
      },
      gistLoadClicked: false,
      invalidFilename: false,
      invalidRevision: false,
      invalidUrl: false,
      latestRevision: false,
      loaded: false,
      pages: {},
      personalGist: [],
      private: GistPrivacy.PUBLIC,
      syntaxError: false
    };
  }

  public componentDidMount() {
    this.handlePageChange({selected: 0});
  }

  public privacyToggle() {
    this.setState({
      private: this.state.private === GistPrivacy.PUBLIC ? GistPrivacy.ALL : GistPrivacy.PUBLIC
    });
  }

  public updateGist(gist) {
    this.setState({
      gist: {
        ...this.state.gist,
        ...gist
      }
    });
  }

  public updateGistUrl(event) {
    this.updateGist({url: event.currentTarget.value});
    this.setState({
      invalidUrl: false
    });
  }

  public updateGistRevision(event) {
    this.updateGist({revision: event.currentTarget.value});
    this.setState({
      invalidRevision: false
    });
  }

  public updateGistFile(event) {
    this.updateGist({filename: event.currentTarget.value});
    this.setState({
      invalidFilename: false
    });
  }

  public async onSelectGist(closePortal) {
    const url = this.state.gist.url.trim().toLowerCase();

    this.setState({
      gist: {
        ...this.state.gist,
        filename: this.state.gist.filename.trim(),
        revision: this.state.gist.revision.trim().toLowerCase()
      }
    });

    if (url.length === 0) {
      this.refGistForm.reportValidity();
      return;
    }
    this.setState({
      gistLoadClicked: true
    });

    let gistUrl;
    if (url.match(/gist.githubusercontent.com/)) {
      gistUrl = new URL(url, 'https://gist.githubusercontent.com');
      const [, , , revision, filename] = gistUrl.pathname.split('/').slice(1);
      this.setState({
        gist: {
          ...this.state.gist,
          filename,
          revision
        }
      });
    } else if (url.match(/gist.github.com/)) {
      gistUrl = new URL(url, 'https://gist.github.com');
    }
    const [_, gistId] = gistUrl.pathname.split('/').slice(1);
    await fetch(`https://api.github.com/gists/${gistId}/commits`)
      .then(res => {
        this.setState({
          invalidUrl: !res.ok
        });
        return res.json();
      })
      .then(json => {
        if (!this.state.gist.revision && !this.state.invalidUrl) {
          this.setState({
            gist: {
              ...this.state.gist,
              revision: json[0].version
            }
          });
        } else if (this.state.invalidUrl) {
          this.setState({
            gistLoadClicked: false
          });
          return Promise.reject('Invalid Gist URL');
        }
        if (json[0].version === this.state.gist.revision) {
          this.setState({
            latestRevision: true
          });
        }
        return fetch(`https://api.github.com/gists/${gistId}/${this.state.gist.revision}`);
      })
      .then(res => {
        this.setState({
          invalidRevision: !res.ok
        });
        return res.json();
      })
      .then(json => {
        if (this.state.invalidRevision) {
          this.setState({
            gistLoadClicked: false
          });
          return Promise.reject('Invalid Revision');
        } else if (!this.state.invalidRevision && this.state.gist.filename === '') {
          const jsonFiles = Object.keys(json.files).filter(file => {
            if (file.split('.').slice(-1)[0] === 'json') {
              return true;
            }
          });
          if (jsonFiles.length === 0) {
            this.setState(
              {
                gistLoadClicked: false,
                invalidUrl: true
              },
              () => {
                return Promise.reject('No JSON file exists in the gist');
              }
            );
          } else {
            this.setState(
              {
                gist: {
                  ...this.state.gist,
                  filename: jsonFiles[0]
                }
              },
              () => {
                const {revision, filename} = this.state.gist;
                JSON.parse(json.files[jsonFiles[0]].content);
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
          if (json.files[this.state.gist.filename] === undefined) {
            this.setState({
              gistLoadClicked: false,
              invalidFilename: true
            });
            return Promise.reject('Invalid file name');
          } else {
            const {revision, filename} = this.state.gist;
            JSON.parse(json.files[filename].content);
            if (this.state.latestRevision) {
              this.props.history.push(`/gist/${gistId}/${filename}`);
            } else {
              this.props.history.push(`/gist/${gistId}/${revision}/${filename}`);
            }
            closePortal();
          }
        }
      })
      .catch(error => {
        if (error instanceof SyntaxError) {
          this.setState({
            gistLoadClicked: false,
            syntaxError: true
          });
        }
      });
  }

  public componentDidUpdate(prevProps, prevState) {
    if (this.props.isAuthenticated !== prevProps.isAuthenticated) {
      this.setState(
        {
          currentPage: 0,
          gist: {
            filename: '',
            image: '',
            imageStyle: {
              bottom: 0
            },
            revision: '',
            type: this.props.mode,
            url: ''
          }
        },
        () => {
          this.handlePageChange({selected: this.state.currentPage});
        }
      );
    }
    if (this.state.private !== prevState.private) {
      this.setState(
        {
          currentPage: 0
        },
        () => {
          this.handlePageChange({selected: this.state.currentPage});
        }
      );
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
          bottom: 0
        },
        revision: '',
        url: `https://gist.github.com/${this.props.handle}/${id}`
      },
      invalidFilename: false,
      invalidRevision: false,
      invalidUrl: false,
      syntaxError: false
    });
  }

  public slideImage(event) {
    const imageHeight = event.target.height;
    this.setState({
      gist: {
        ...this.state.gist,
        imageStyle: {
          ...this.state.gist.imageStyle,
          bottom: imageHeight > 100 ? imageHeight - 100 : 0
        }
      }
    });
  }

  public slideImageBack() {
    this.setState({
      gist: {
        ...this.state.gist,
        imageStyle: {
          ...this.state.gist.imageStyle,
          bottom: 0
        }
      }
    });
  }

  public async handlePageChange(page) {
    const cookieValue = encodeURIComponent(getCookie(COOKIE_NAME));
    let response;
    if (page.selected === 0) {
      response = await fetch(`${BACKEND_URL}gists/user?cursor=init&privacy=${this.state.private}`, {
        credentials: 'include',
        headers: {
          Cookie: `${COOKIE_NAME}=${cookieValue}`
        },
        method: 'get'
      });
    } else {
      response = await fetch(
        `${BACKEND_URL}gists/user?cursor=${this.state.pages[page.selected]}&privacy=${this.state.private}`,
        {
          credentials: 'include',
          headers: {
            Cookie: `${COOKIE_NAME}=${cookieValue}`
          },
          method: 'get'
        }
      );
    }
    const data = await response.json();
    if (Array.isArray(data.data)) {
      this.setState({
        currentPage: page.selected,
        loaded: true,
        pages: page.selected === 0 ? data.cursors : this.state.pages,
        personalGist: data.data
      });
    } else {
      this.props.receiveCurrentUser(data.isAuthenticated);
    }
  }

  public render() {
    const githubLink = (
      /* eslint-disable-next-line react/jsx-no-target-blank */
      <a href={`${BACKEND_URL}auth/github`} target="_blank">
        Login with GitHub
      </a>
    );

    return (
      <div>
        <h1>
          Load{' '}
          <a href="https://gist.github.com/" target="_blank" rel="noopener noreferrer">
            Github Gist
          </a>
        </h1>
        <div className="gist-split">
          <div className="personal-gist">
            <h3>Your gists</h3>
            {this.props.isAuthenticated ? (
              this.state.loaded ? (
                <>
                  {this.state.personalGist.length > 0 ? (
                    <>
                      <div className="privacy-toggle">
                        <input
                          type="checkbox"
                          name="privacy"
                          id="privacy"
                          checked={this.state.private === GistPrivacy.ALL}
                          onChange={this.privacyToggle.bind(this)}
                        />
                        <label htmlFor="privacy">Show private gists</label>
                      </div>
                      {Object.keys(this.state.pages).length > 1 && (
                        <ReactPaginate
                          previousLabel={'<'}
                          nextLabel={'>'}
                          breakClassName={'break'}
                          containerClassName={'pagination'}
                          activeClassName={'active'}
                          pageCount={Object.keys(this.state.pages).length}
                          onPageChange={this.handlePageChange.bind(this)}
                          forcePage={this.state.currentPage}
                          marginPagesDisplayed={1}
                          pageRangeDisplayed={2}
                        />
                      )}
                      {this.state.personalGist.map(gist => (
                        <div key={gist.name} className="gist-container">
                          <div className="personal-gist-description">
                            {gist.isPublic ? (
                              <File width="14" height="14" />
                            ) : (
                              <Lock width="14" height="14" fill="#FDD300" />
                            )}
                            <span className={`text ${gist.title ? '' : 'play-down'}`}>
                              {gist.title ? gist.title : 'No description provided'}
                            </span>
                          </div>
                          <div className="personal-gist-files">
                            {gist.spec.map((spec, index) => (
                              <div key={index} className="file">
                                <div className="arrow"></div>
                                <div
                                  className="filename"
                                  key={spec.name}
                                  onClick={() => this.preview(gist.name, spec.name, spec.previewUrl)}
                                >
                                  {spec.name}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </>
                  ) : (
                    <>You have no Vega or Vega-Lite compatible gists.</>
                  )}
                </>
              ) : (
                <div className="loader-container">
                  <span>Loading your GISTS...</span>
                </div>
              )
            ) : (
              <span>{githubLink} to see all of your personal gist.</span>
            )}
          </div>
          <div className="load-gist">
            <h3>Load gists</h3>
            <form ref={form => (this.refGistForm = form)}>
              <div className="gist-input-container">
                <label>
                  Gist URL
                  <div style={{marginTop: '2px'}}>
                    <small>
                      Example:{' '}
                      <span
                        className="gist-url"
                        onClick={e =>
                          this.setState({
                            gist: {
                              ...this.state.gist,
                              filename: '',
                              image: '',
                              revision: '',
                              url: 'https://gist.github.com/domoritz/455e1c7872c4b38a58b90df0c3d7b1b9'
                            }
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
                            transform: `translateY(-${this.state.gist.imageStyle.bottom}px)`
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
