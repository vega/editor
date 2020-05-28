import React from 'react';
import {File, Lock} from 'react-feather';
import ReactPaginate from 'react-paginate';
import {mapDispatchToProps, mapStateToProps} from '.';
import {BACKEND_URL, GistPrivacy} from '../../constants';
import LoginConditional from '../login-conditional';
import './index.css';

interface State {
  currentPage: number;
  loaded: boolean;
  personalGist: {
    name: string;
    isPublic: boolean;
    title: string;
    spec: {
      name: string;
      previewUrl: string;
    }[];
  }[];
  pages: Record<string, unknown>;
  loading: boolean;
  selected: {
    gist: string;
    file: string;
  };
}

type Props = ReturnType<typeof mapStateToProps> &
  ReturnType<typeof mapDispatchToProps> & {
    selectGist: (id?: string, file?: string, image?: string) => void;
  };

class GistSelectWidget extends React.PureComponent<Props, State> {
  constructor(props) {
    super(props);
    this.state = {
      currentPage: 0,
      loaded: false,
      personalGist: [],
      pages: {},
      loading: true,
      selected: {
        gist: null,
        file: null,
      },
    };
  }
  public componentDidMount() {
    this.handlePageChange({selected: 0});
  }
  public componentDidUpdate(prevProps) {
    if (this.props.isAuthenticated !== prevProps.isAuthenticated) {
      this.setState(
        {
          currentPage: 0,
          loading: true,
        },
        () => {
          this.handlePageChange({selected: this.state.currentPage});
        }
      );
    }
    if (this.props.private !== prevProps.private) {
      this.setState(
        {
          currentPage: 0,
          loading: true,
        },
        () => {
          this.handlePageChange({selected: this.state.currentPage});
        }
      );
    }
  }
  public async handlePageChange(page) {
    if (this.state.loading) {
      this.setState(
        {
          loading: false,
        },
        async () => {
          let response;
          if (page.selected === 0) {
            response = await fetch(`${BACKEND_URL}gists/user?cursor=init&privacy=${this.props.private}`, {
              credentials: 'include',
              method: 'get',
            });
          } else {
            response = await fetch(
              `${BACKEND_URL}gists/user?cursor=${this.state.pages[page.selected]}&privacy=${this.props.private}`,
              {
                credentials: 'include',
                method: 'get',
              }
            );
          }
          const data = await response.json();
          if (Array.isArray(data.data)) {
            this.setState({
              currentPage: page.selected,
              loaded: true,
              pages: page.selected === 0 ? data.cursors : this.state.pages,
              loading: true,
              personalGist: data.data,
            });
          } else {
            this.props.receiveCurrentUser(data.isAuthenticated);
          }
        }
      );
    }
  }
  public render() {
    return (
      <LoginConditional>
        {this.state.loaded ? (
          <>
            <div className="privacy-toggle">
              <input
                type="checkbox"
                name="privacy"
                id="privacy"
                checked={this.props.private === GistPrivacy.ALL}
                onChange={this.props.toggleGistPrivacy}
              />
              <label htmlFor="privacy">Show private gists</label>
            </div>
            {this.state.personalGist.length > 0 ? (
              <>
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
                    marginPagesDisplayed={2}
                    pageRangeDisplayed={2}
                  />
                )}
                <div className={`gist-wrapper ${!this.state.loading && 'loading'}`}>
                  {this.state.personalGist.map((gist) => (
                    <div
                      key={gist.name}
                      className={`gist-container ${this.state.selected.gist === gist.name && 'gist-active'}`}
                    >
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
                              className={`filename ${
                                this.state.selected.file === spec.name &&
                                this.state.selected.gist === gist.name &&
                                'file-active'
                              }`}
                              key={spec.name}
                              onClick={() => {
                                this.props.selectGist(gist.name, spec.name, spec.previewUrl);
                                this.setState({
                                  selected: {
                                    gist: gist.name,
                                    file: spec.name,
                                  },
                                });
                              }}
                            >
                              {spec.name}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <>You have no Vega or Vega-Lite compatible gists.</>
            )}
          </>
        ) : (
          <div className="loader-container">
            <span>Loading your GISTS...</span>
          </div>
        )}
      </LoginConditional>
    );
  }
}

export default GistSelectWidget;
