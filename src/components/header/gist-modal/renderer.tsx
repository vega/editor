import * as React from 'react';
import { RouteComponentProps, withRouter } from 'react-router-dom';
import { mapStateToProps } from '.';
import { BACKEND_URL, COOKIE_NAME, Mode } from '../../../constants';
import { getCookie } from '../../../utils/getCookie';
import './index.css';

type Props = ReturnType<typeof mapStateToProps> & { closePortal: () => void } & RouteComponentProps;

interface State {
  gist: {
    image: string;
    filename: string;
    revision: string;
    type: Mode;
    url: string;
  };
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
        revision: '',
        type: props.mode,
        url: '',
      },
      gistLoadClicked: false,
      invalidFilename: false,
      invalidRevision: false,
      invalidUrl: false,
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
    const type = this.state.gist.type;
    const url = this.state.gist.url.trim().toLowerCase();

    let revision = this.state.gist.revision.trim().toLowerCase();
    let filename = this.state.gist.filename.trim();

    if (url.length === 0) {
      this.refGistForm.reportValidity();

      return;
    }
    this.setState({
      gistLoadClicked: true,
    });

    const gistUrl = new URL(url, 'https://gist.github.com');
    const [username, gistId] = gistUrl.pathname.split('/').slice(1);
    const gistCommits = await fetch(`https://api.github.com/gists/${gistId}/commits`);
    this.setState({
      gistLoadClicked: gistCommits.ok,
      invalidUrl: !gistCommits.ok,
    });
    const responseGistCommits = await gistCommits.json();
    if (revision.length === 0) {
      // the url is invalid so we don't want to show errors for the revisiton and filename
      this.setState({
        invalidFilename: false,
        invalidRevision: false,
      });
      revision = responseGistCommits[0].version;
    } else {
      const revGistCommits = await fetch(`https://api.github.com/gists/${gistId}/${revision}`);
      this.setState({
        gistLoadClicked: revGistCommits.ok || this.state.invalidUrl,
        invalidFilename: !this.state.invalidUrl,
        invalidRevision: !(revGistCommits.ok || this.state.invalidUrl),
      });
    }

    const gistData = await fetch(`https://api.github.com/gists/${gistId}`).then(r => r.json());
    if (filename.length === 0) {
      filename = Object.keys(gistData.files).find(f => gistData.files[f].language === 'JSON');

      if (filename === undefined) {
        this.setState({
          gistLoadClicked: false,
          invalidUrl: true,
        });
        throw Error();
      }
      this.setState({
        invalidFilename: false,
      });
    } else {
      const gistFilename = Object.keys(gistData.files).find(f => gistData.files[f].language === 'JSON');
      if (this.state.gist.filename !== gistFilename && !this.state.invalidUrl) {
        this.setState({
          gistLoadClicked: false,
          invalidFilename: true,
        });
      } else {
        this.setState({
          invalidFilename: false,
        });
      }
    }
    if (!(this.state.invalidUrl || this.state.invalidFilename || this.state.invalidRevision)) {
      this.props.history.push(`/gist/${type}/${username}/${gistId}/${revision}/${filename}`);
      this.setState({
        gist: {
          filename: '',
          image: '',
          revision: '',
          type: Mode.Vega,
          url: '',
        },
        gistLoadClicked: true,
        invalidFilename: false,
        invalidRevision: false,
        invalidUrl: false,
      });

      closePortal(); // Close the gist modal after it gets load
    }
  }

  public componentWillReceiveProps(nextProps) {
    this.setState({
      gist: {
        filename: '',
        image: '',
        revision: '',
        type: nextProps.mode,
        url: '',
      },
    });
  }

  public preview(id, file, image) {
    this.updateGist({
      filename: file,
      image,
      url: `https://gist.github.com/${this.props.handle}/${id}`,
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
              {this.props.isAuthenticated &&
                this.state.personalGist
                  .filter(gist => gist.isPublic || this.state.private)
                  .map(gist => (
                    <li>
                      {gist.title}
                      <ul>
                        {gist.spec.map(spec => (
                          <li onClick={() => this.preview(gist.name, spec.name, spec.previewUrl)}>{spec.name}</li>
                        ))}
                      </ul>
                    </li>
                  ))}
            </ol>
          </div>
          <div className="load-gist">
            <h3>Load GISTS</h3>
            <form ref={form => (this.refGistForm = form)}>
              <div className="gist-input-container">
                Gist Type:
                <input
                  type="radio"
                  name="gist-type"
                  id="gist-type[vega]"
                  value="vega"
                  checked={this.state.gist.type === Mode.Vega}
                  onChange={this.updateGistType.bind(this)}
                />
                <label htmlFor="gist-type[vega]">Vega</label>
                <input
                  type="radio"
                  name="gist-type"
                  id="gist-type[vega-lite]"
                  value="vega-lite"
                  checked={this.state.gist.type === Mode.VegaLite}
                  onChange={this.updateGistType.bind(this)}
                />
                <label htmlFor="gist-type[vega-lite]">Vega Lite</label>
              </div>
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
                    {this.state.invalidFilename && <span>Please enter a valid filename.</span>}
                  </div>
                </div>
              </div>
              <div className="load-button">
                {this.state.gist.image && (
                  <div className="preview-image-container">
                    <span className="preview-text">Preview:</span>
                    <div className="preview-image-wrapper">
                      <img src={this.state.gist.image} />
                    </div>
                  </div>
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
